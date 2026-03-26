/*
  VOIDEX AI — app.js
  Made by Aousisgood1
*/

const API = window.location.origin;

// ── State ────────────────────────────────
let userId      = getOrCreateUserId();
let currentChat = null;  // { id, messages, title }
let isLoading   = false;
let ownerAuthed = false;
let ownerPw     = '';

// ── User ID (persisted) ───────────────────
function getOrCreateUserId() {
  let id = localStorage.getItem('vx_ai_uid');
  if (!id) {
    id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    localStorage.setItem('vx_ai_uid', id);
  }
  return id;
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadChatList();
  loadUsage();

  // Triple-click logo → owner panel
  let logoClicks = 0;
  document.getElementById('logo-btn')?.addEventListener('click', () => {
    logoClicks++;
    if (logoClicks >= 3) { logoClicks = 0; openOwner(); }
    setTimeout(() => logoClicks = 0, 800);
  });

  // Enter to send
  document.getElementById('msg-input')?.addEventListener('keydown', handleKey);

  // Focus input
  document.getElementById('msg-input')?.focus();
});

// ══════════════════════════════════════════
//  SIDEBAR
// ══════════════════════════════════════════
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ══════════════════════════════════════════
//  CHAT LIST
// ══════════════════════════════════════════
async function loadChatList() {
  try {
    const res  = await fetch(`${API}/api/ai/chats/${encodeURIComponent(userId)}`);
    const data = await res.json();
    renderChatList(data);
  } catch {}
}

function renderChatList(chats) {
  const el = document.getElementById('chat-list');
  if (!chats || !chats.length) {
    el.innerHTML = '<div class="chat-list-empty">No chats yet</div>';
    return;
  }
  el.innerHTML = '';
  chats.forEach(chat => {
    const item = document.createElement('div');
    item.className = 'chat-item' + (currentChat?.id === chat.id ? ' active' : '');
    item.dataset.id = chat.id;
    const ago = timeAgo(chat.updatedAt);
    item.innerHTML = `
      <div class="chat-item-title">${esc(chat.title || 'New Chat')}</div>
      <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
        <div class="chat-item-meta">${ago}</div>
        <button class="chat-item-del" onclick="deleteChat('${chat.id}',event)" title="Delete">✕</button>
      </div>
    `;
    item.addEventListener('click', () => loadChat(chat.id));
    el.appendChild(item);
  });
}

async function loadChat(id) {
  try {
    const res  = await fetch(`${API}/api/ai/chat/${encodeURIComponent(id)}`);
    const chat = await res.json();
    if (chat.error) return;

    currentChat = chat;
    document.getElementById('header-title').textContent = chat.title || 'Chat';
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('messages').innerHTML = '';

    chat.messages.forEach(m => appendMessage(m.role, m.content, false));
    scrollBottom();

    // Update active state
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-id="${id}"]`)?.classList.add('active');
  } catch {}
}

async function startNewChat() {
  currentChat = null;
  document.getElementById('header-title').textContent = 'Voidex AI';
  document.getElementById('welcome').style.display = '';
  document.getElementById('messages').innerHTML = '';
  document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
  document.getElementById('msg-input').focus();
}

async function deleteChat(id, e) {
  e?.stopPropagation();
  try {
    await fetch(`${API}/api/ai/chat/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (currentChat?.id === id) startNewChat();
    loadChatList();
  } catch {}
}

// ══════════════════════════════════════════
//  SEND MESSAGE
// ══════════════════════════════════════════
async function sendMessage() {
  const input = document.getElementById('msg-input');
  const text  = input.value.trim();
  if (!text || isLoading) return;

  // Check usage
  const usageRes  = await fetch(`${API}/api/ai/usage/${encodeURIComponent(userId)}`);
  const usageData = await usageRes.json();
  if (usageData.remaining <= 0) {
    showLimitModal();
    return;
  }

  input.value = '';
  autoResize(input);
  isLoading = true;
  document.getElementById('send-btn').disabled = true;

  // Hide welcome
  document.getElementById('welcome').style.display = 'none';

  // If no current chat, create one
  if (!currentChat) {
    const res  = await fetch(`${API}/api/ai/chat/new`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    currentChat = await res.json();
  }

  // Add user message
  currentChat.messages = currentChat.messages || [];
  currentChat.messages.push({ role: 'user', content: text });
  appendMessage('user', text, true);
  scrollBottom();

  // Show thinking
  const thinkId = showThinking();

  try {
    const response = await fetch(`${API}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: currentChat.messages,
        userId,
        chatId: currentChat.id,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      removeThinking(thinkId);
      if (response.status === 429) { showLimitModal(); }
      else appendMessage('ai', '⚠ Error: ' + (err.error || 'Something went wrong'), true);
      return;
    }

    // Stream response
    removeThinking(thinkId);
    const aiMsgEl = appendMessage('ai', '', true);
    const bubbleEl = aiMsgEl.querySelector('.msg-bubble');
    bubbleEl.innerHTML = '<span class="cursor-blink"></span>';

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let   full    = '';
    let   buffer  = '';
    let   streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') { streamDone = true; break; }
        try {
          const parsed = JSON.parse(data);
          if (parsed.token) {
            full += parsed.token;
            bubbleEl.innerHTML = formatMsg(full) + '<span class="cursor-blink"></span>';
            scrollBottom();
          }
          if (parsed.error) throw new Error(parsed.error);
        } catch {}
      }
    }

    reader.cancel().catch(() => {});

    // Final render — remove cursor
    bubbleEl.innerHTML = formatMsg(full);
    currentChat.messages.push({ role: 'assistant', content: full });

    // Update title if first message
    if (!currentChat.title) {
      currentChat.title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
      document.getElementById('header-title').textContent = currentChat.title;
    }

    loadChatList();
    loadUsage();

  } catch (err) {
    removeThinking(thinkId);
    appendMessage('ai', '⚠ Connection error. Please try again.', true);
  } finally {
    isLoading = false;
    document.getElementById('send-btn').disabled = false;
    document.getElementById('msg-input').focus();
  }
}

function useSuggestion(btn) {
  const input = document.getElementById('msg-input');
  input.value = btn.textContent.replace(/^[⭐⚡🔄📈💎🥚]\s*/, '');
  autoResize(input);
  input.focus();
  sendMessage();
}

// ══════════════════════════════════════════
//  MESSAGE RENDERING
// ══════════════════════════════════════════
function appendMessage(role, content, animate) {
  const msgs = document.getElementById('messages');
  const row  = document.createElement('div');
  row.className = 'msg-row ' + role + (animate ? '' : ' no-anim');

  const avatarIcon = role === 'user' ? '👤' : '⬡';
  row.innerHTML = `
    <div class="msg-avatar">${avatarIcon}</div>
    <div class="msg-bubble">${formatMsg(content)}</div>
  `;
  msgs.appendChild(row);
  return row;
}

function formatMsg(text) {
  if (!text) return '';
  // Code blocks
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code>${escHtml(code.trim())}</code></pre>`
  );
  // Inline code
  text = text.replace(/`([^`]+)`/g, (_, c) => `<code>${escHtml(c)}</code>`);
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Newlines
  text = text.replace(/\n/g, '<br>');
  return text;
}

function showThinking() {
  const msgs = document.getElementById('messages');
  const row  = document.createElement('div');
  const id   = 'think_' + Date.now();
  row.id = id;
  row.className = 'msg-row ai';
  row.innerHTML = `
    <div class="msg-avatar">⬡</div>
    <div class="thinking-bubble">
      <div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div>
    </div>
  `;
  msgs.appendChild(row);
  scrollBottom();
  return id;
}

function removeThinking(id) {
  document.getElementById(id)?.remove();
}

// ══════════════════════════════════════════
//  USAGE
// ══════════════════════════════════════════
async function loadUsage() {
  try {
    const res  = await fetch(`${API}/api/ai/usage/${encodeURIComponent(userId)}`);
    const data = await res.json();
    const pct  = (data.usage / data.limit) * 100;

    document.getElementById('usage-count').textContent = `${data.usage} / ${data.limit}`;
    const fill = document.getElementById('usage-bar-fill');
    fill.style.width = Math.min(pct, 100) + '%';
    fill.className   = 'usage-bar-fill' + (pct >= 100 ? ' full' : pct >= 80 ? ' warn' : '');
  } catch {}
}

function showLimitModal() {
  alert('You\'ve reached the daily limit of 30 messages. Come back tomorrow!');
}

// ══════════════════════════════════════════
//  OWNER PANEL
// ══════════════════════════════════════════
function openOwner() {
  document.getElementById('owner-overlay').classList.add('open');
  if (ownerAuthed) {
    document.getElementById('owner-login').style.display = 'none';
    document.getElementById('owner-dash').style.display  = 'block';
    ownerLoadPrompt();
  } else {
    document.getElementById('owner-login').style.display = 'block';
    document.getElementById('owner-dash').style.display  = 'none';
  }
}

function closeOwner() {
  document.getElementById('owner-overlay').classList.remove('open');
}

async function ownerLogin() {
  const pw  = document.getElementById('owner-pw').value.trim();
  const err = document.getElementById('owner-login-err');
  err.style.display = 'none';
  try {
    const res = await fetch(`${API}/api/owner/prompt`, { headers: { 'x-owner-password': pw } });
    if (res.status === 401) { err.textContent = 'Wrong password'; err.style.display='block'; return; }
    const data = await res.json();
    ownerPw     = pw;
    ownerAuthed = true;
    document.getElementById('owner-login').style.display = 'none';
    document.getElementById('owner-dash').style.display  = 'block';
    document.getElementById('prompt-editor').value = data.prompt || '';
  } catch { err.textContent = 'Server unreachable'; err.style.display='block'; }
}

async function ownerLoadPrompt() {
  try {
    const res  = await fetch(`${API}/api/owner/prompt`, { headers: { 'x-owner-password': ownerPw } });
    const data = await res.json();
    document.getElementById('prompt-editor').value = data.prompt || '';
  } catch {}
}

async function savePrompt() {
  const prompt = document.getElementById('prompt-editor').value.trim();
  const err    = document.getElementById('prompt-err');
  err.style.display = 'none';
  if (!prompt) { err.textContent = 'Prompt cannot be empty'; err.style.display='block'; return; }
  try {
    const res = await fetch(`${API}/api/owner/prompt`, {
      method: 'PUT', headers: { 'Content-Type':'application/json', 'x-owner-password': ownerPw },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.success) showToast('✔ Prompt saved');
    else { err.textContent = data.error; err.style.display='block'; }
  } catch { err.textContent = 'Save failed'; err.style.display='block'; }
}

function ownerTab(name, btn) {
  document.querySelectorAll('.owner-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.owner-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('otab-' + name).classList.add('active');

  if (name === 'stats')  ownerLoadStats();
  if (name === 'chats')  ownerLoadChats();
}

async function ownerLoadStats() {
  try {
    const [statusRes, usageRes] = await Promise.all([
      fetch(`${API}/api/status`),
      fetch(`${API}/api/owner/usage`, { headers: { 'x-owner-password': ownerPw } }),
    ]);
    const status = await statusRes.json();
    const usage  = await usageRes.json();

    const el = document.getElementById('stats-content');
    el.innerHTML = `
      <div class="stat-card"><div class="stat-num">${usage.total || 0}</div><div class="stat-lbl">MSGS TODAY</div></div>
      <div class="stat-card"><div class="stat-num">${(usage.users||[]).length}</div><div class="stat-lbl">USERS TODAY</div></div>
      <div class="stat-card"><div class="stat-num">${Math.floor((status.uptime||0)/60)}m</div><div class="stat-lbl">UPTIME</div></div>
      <div class="stat-card"><div class="stat-num">v${status.version||'?'}</div><div class="stat-lbl">VERSION</div></div>
    `;

    // Usage breakdown
    if (usage.users && usage.users.length) {
      const table = document.createElement('div');
      table.style.cssText = 'margin-top:1rem;';
      table.innerHTML = '<div style="font-size:.7rem;font-weight:700;letter-spacing:.1em;color:var(--tm);margin-bottom:.5rem;">USER USAGE TODAY</div>';
      usage.users.forEach(u => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;padding:.4rem .5rem;border-bottom:1px solid var(--b);font-size:.82rem;';
        row.innerHTML = `<span style="color:var(--td);font-family:'Share Tech Mono',monospace;">${esc(u.user_id?.slice(0,20)||'?')}</span><span style="color:var(--rg);font-weight:700;">${u.count} msgs</span>`;
        table.appendChild(row);
      });
      el.appendChild(table);
    }
  } catch {}
}

async function ownerLoadChats() {
  try {
    const res   = await fetch(`${API}/api/owner/chats`, { headers: { 'x-owner-password': ownerPw } });
    const chats = await res.json();
    const el    = document.getElementById('owner-chats-list');

    if (!chats.length) { el.innerHTML = '<div style="color:var(--tm);font-size:.85rem;padding:.8rem 0;">No chats yet</div>'; return; }

    el.innerHTML = `<div style="font-size:.7rem;font-weight:700;letter-spacing:.1em;color:var(--tm);margin-bottom:.5rem;">${chats.length} TOTAL CHATS</div>`;
    chats.forEach(c => {
      const row = document.createElement('div');
      row.className = 'owner-chat-row';
      row.innerHTML = `
        <div class="ocr-title">${esc(c.title||'Untitled')}</div>
        <div class="ocr-meta">${c.messageCount} msgs · ${timeAgo(c.updatedAt)}</div>
        <button class="ocr-del" onclick="ownerDeleteChat('${c.id}',this)">Delete</button>
      `;
      el.appendChild(row);
    });
  } catch {}
}

async function ownerDeleteChat(id, btn) {
  try {
    await fetch(`${API}/api/owner/chat/${encodeURIComponent(id)}`, {
      method: 'DELETE', headers: { 'x-owner-password': ownerPw },
    });
    btn.closest('.owner-chat-row')?.remove();
    showToast('Chat deleted');
  } catch {}
}

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
}

function scrollBottom() {
  const ca = document.getElementById('chat-area');
  ca.scrollTop = ca.scrollHeight;
}

function esc(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escHtml(str) { return esc(str); }

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return d + 'd';
  if (h > 0) return h + 'h';
  if (m > 0) return m + 'm';
  return 'now';
}

let toastTimer;
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  clearTimeout(toastTimer);
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--card2);border:1px solid var(--b2);border-radius:7px;padding:.55rem 1.3rem;font-size:.88rem;font-weight:600;color:#fff;z-index:9000;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.4);';
  document.body.appendChild(t);
  toastTimer = setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .25s'; setTimeout(()=>t.remove(),280); }, 2200);
}
