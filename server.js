/*
  VOIDEX AI — server.js
  Made by Aousisgood1
  Groq AI + Supabase storage
*/

const express = require('express');
const cors    = require('cors');
const crypto  = require('crypto');
const https   = require('https');
const http    = require('http');
const path    = require('path');

const app     = express();
const PORT    = process.env.PORT || 3001;
const VERSION = '1.0.0';

const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'VOIDEX_OWNER_2026';
const GROQ_API_KEY   = process.env.GROQ_API_KEY   || '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';
const SUPABASE_URL   = process.env.SUPABASE_URL;
const SUPABASE_KEY   = process.env.SUPABASE_KEY;

// Daily message limit per user (based on browser fingerprint)
const DAILY_LIMIT = 30;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'frontend')));

// ══════════════════════════════════════════
//  IN-MEMORY FALLBACK (if no Supabase)
// ══════════════════════════════════════════
let _memSettings = {};
let _memChats    = {};
let _memLimits   = {};

// ══════════════════════════════════════════
//  SUPABASE CLIENT
// ══════════════════════════════════════════
function sbReq(method, table, body, query) {
  return new Promise((resolve, reject) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return reject(new Error('no_supabase'));
    const url  = new URL(`${SUPABASE_URL}/rest/v1/${table}${query || ''}`);
    const data = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method,
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
      },
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) reject(new Error(`SB${res.statusCode}: ${raw.slice(0,200)}`));
          else resolve(raw ? JSON.parse(raw) : null);
        } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
    if (data) req.write(data);
    req.end();
  });
}

// ── SETTINGS ──────────────────────────────
const DEFAULT_PROMPT = `You are Voidex AI, an expert assistant for a Roblox tapping simulation game called "Tapping Simulator" (or similar). You help players with everything about the game.

WHAT YOU KNOW:
- Pet values, tiers, and rarities (Secret > Mythic > Legendary > Epic > Rare > Uncommon > Common)
- Enchant comparisons and recommendations
- Game strategy and progression tips
- Trading advice and market knowledge
- Auto-clicking setups and optimization
- Rebirth timing and multipliers

PERSONALITY:
- Friendly, concise, and helpful
- Give clear YES/NO answers when comparing two options
- Always explain WHY when recommending something
- If you don't know a specific value, say so honestly and suggest how to find it
- Use simple language, players may be young

IMPORTANT:
- Secret pets are the rarest and most valuable
- Always prioritize the player's progression level when giving advice
- When comparing enchants, consider: damage output, tap speed, luck/rarity bonuses`;

async function getPrompt() {
  try {
    if (SUPABASE_URL) {
      const rows = await sbReq('GET', 'settings', null, '?key=eq.ai_prompt&select=value');
      if (rows && rows.length > 0) return rows[0].value;
    }
    return _memSettings['ai_prompt'] || DEFAULT_PROMPT;
  } catch { return _memSettings['ai_prompt'] || DEFAULT_PROMPT; }
}

async function setPrompt(value) {
  _memSettings['ai_prompt'] = value;
  if (!SUPABASE_URL) return;
  try {
    const existing = await sbReq('GET', 'settings', null, '?key=eq.ai_prompt&select=key');
    if (existing && existing.length > 0) {
      await sbReq('PATCH', 'settings', { value, updated_at: new Date().toISOString() }, '?key=eq.ai_prompt');
    } else {
      await sbReq('POST', 'settings', { key: 'ai_prompt', value }, '');
    }
  } catch (e) { console.error('[AI] setPrompt:', e.message); }
}

// ── CHATS ─────────────────────────────────
async function saveChat(chat) {
  _memChats[chat.id] = chat;
  if (!SUPABASE_URL) return;
  try {
    const existing = await sbReq('GET', 'ai_chats', null, `?id=eq.${chat.id}&select=id`);
    if (existing && existing.length > 0) {
      await sbReq('PATCH', 'ai_chats', { data: chat, updated_at: new Date().toISOString() }, `?id=eq.${chat.id}`);
    } else {
      await sbReq('POST', 'ai_chats', { id: chat.id, user_id: chat.userId, data: chat }, '');
    }
  } catch (e) { console.error('[AI] saveChat:', e.message); }
}

async function getUserChats(userId) {
  if (SUPABASE_URL) {
    try {
      const rows = await sbReq('GET', 'ai_chats', null, `?user_id=eq.${encodeURIComponent(userId)}&select=id,data&order=updated_at.desc&limit=20`);
      return (rows || []).map(r => r.data);
    } catch {}
  }
  return Object.values(_memChats).filter(c => c.userId === userId).sort((a,b) => b.updatedAt - a.updatedAt).slice(0, 20);
}

async function getChat(id) {
  if (SUPABASE_URL) {
    try {
      const rows = await sbReq('GET', 'ai_chats', null, `?id=eq.${encodeURIComponent(id)}&select=data`);
      if (rows && rows.length > 0) return rows[0].data;
    } catch {}
  }
  return _memChats[id] || null;
}

async function deleteChat(id) {
  delete _memChats[id];
  if (!SUPABASE_URL) return;
  try { await sbReq('DELETE', 'ai_chats', null, `?id=eq.${encodeURIComponent(id)}`); }
  catch {}
}

// ── RATE LIMITS ───────────────────────────
function todayKey() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

async function getUsage(userId) {
  const key = `${userId}_${todayKey()}`;
  if (SUPABASE_URL) {
    try {
      const rows = await sbReq('GET', 'ai_usage', null, `?key=eq.${encodeURIComponent(key)}&select=count`);
      return rows && rows.length > 0 ? rows[0].count : 0;
    } catch {}
  }
  return _memLimits[key] || 0;
}

async function incrementUsage(userId) {
  const key   = `${userId}_${todayKey()}`;
  const count = (await getUsage(userId)) + 1;
  _memLimits[key] = count;
  if (SUPABASE_URL) {
    try {
      const existing = await sbReq('GET', 'ai_usage', null, `?key=eq.${encodeURIComponent(key)}&select=key`);
      if (existing && existing.length > 0) {
        await sbReq('PATCH', 'ai_usage', { count }, `?key=eq.${encodeURIComponent(key)}`);
      } else {
        await sbReq('POST', 'ai_usage', { key, user_id: userId, count, date: todayKey() }, '');
      }
    } catch {}
  }
  return count;
}

// ══════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════
function authOwner(req, res, next) {
  const pw = req.headers['x-owner-password'] || req.body?.ownerPassword || '';
  if (pw !== OWNER_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ══════════════════════════════════════════
//  GROQ AI
// ══════════════════════════════════════════
function callGroq(messages, stream, res) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      messages,
      max_tokens:  1024,
      temperature: 0.7,
      stream:      !!stream,
    });

    const opts = {
      hostname: 'api.groq.com',
      path:     '/openai/v1/chat/completions',
      method:   'POST',
      headers:  {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(opts, (groqRes) => {
      if (!stream) {
        let raw = '';
        groqRes.on('data', c => raw += c);
        groqRes.on('end', () => {
          try {
            const data = JSON.parse(raw);
            if (data.error) reject(new Error(data.error.message));
            else resolve(data.choices[0].message.content);
          } catch (e) { reject(e); }
        });
      } else {
        // Stream to SSE response
        res.setHeader('Content-Type',  'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection',    'keep-alive');
        res.flushHeaders();

        let full    = '';
        let settled = false;

        groqRes.on('data', (chunk) => {
          if (settled) return;
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              settled = true;
              res.write(`data: [DONE]\n\n`);
              resolve(full);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const token  = parsed.choices?.[0]?.delta?.content || '';
              if (token) {
                full += token;
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
              }
            } catch {}
          }
        });
        groqRes.on('end', () => { if (!settled) { settled = true; resolve(full); } });
        groqRes.on('error', (err) => { if (!settled) { settled = true; reject(err); } });
      }
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Groq timeout')); });
    req.write(body);
    req.end();
  });
}

// ══════════════════════════════════════════
//  PUBLIC ROUTES
// ══════════════════════════════════════════

// Status
app.get('/api/status', (req, res) => {
  res.json({ version: VERSION, status: 'online', model: 'llama-3.3-70b-versatile', limit: DAILY_LIMIT });
});

// Get system prompt (public — needed to show in UI that AI is specialized)
app.get('/api/ai/info', (req, res) => {
  res.json({ model: 'Llama 3.3 70B', limit: DAILY_LIMIT, version: VERSION });
});

// ── CHAT ──────────────────────────────────

// POST /api/ai/chat — main chat endpoint (streaming)
app.post('/api/ai/chat', async (req, res) => {
  const { messages, userId, chatId } = req.body;

  if (!userId)   return res.status(400).json({ error: 'userId required' });
  if (!messages || !messages.length) return res.status(400).json({ error: 'messages required' });

  // Check rate limit
  const usage = await getUsage(userId);
  if (usage >= DAILY_LIMIT) {
    return res.status(429).json({
      error: `Daily limit reached (${DAILY_LIMIT} messages). Resets at midnight.`,
      usage,
      limit: DAILY_LIMIT,
    });
  }

  // Build messages with system prompt
  const systemPrompt = await getPrompt();
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-20), // keep last 20 for context
  ];

  try {
    // Increment usage before calling (prevents abuse)
    const newUsage = await incrementUsage(userId);

    // Stream response
    const fullResponse = await callGroq(fullMessages, true, res);

    // Save/update chat
    if (chatId) {
      const existing = await getChat(chatId) || { id: chatId, userId, title: '', messages: [], createdAt: Date.now(), updatedAt: Date.now() };

      // Auto-title from first user message
      if (!existing.title && messages.length > 0) {
        const firstMsg = messages.find(m => m.role === 'user');
        existing.title = firstMsg ? firstMsg.content.slice(0, 50) + (firstMsg.content.length > 50 ? '...' : '') : 'New Chat';
      }

      existing.messages   = [...messages, { role: 'assistant', content: fullResponse }];
      existing.updatedAt  = Date.now();
      await saveChat(existing);
    }

    // If streaming already ended the response, we're done
    if (!res.writableEnded) res.end();

  } catch (err) {
    console.error('[AI] Chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI error: ' + err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// GET /api/ai/usage/:userId
app.get('/api/ai/usage/:userId', async (req, res) => {
  const usage = await getUsage(req.params.userId);
  res.json({ usage, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - usage) });
});

// GET /api/ai/chats/:userId
app.get('/api/ai/chats/:userId', async (req, res) => {
  const chats = await getUserChats(req.params.userId);
  // Return summary only (no messages) for the list
  res.json(chats.map(c => ({ id: c.id, title: c.title, updatedAt: c.updatedAt, messageCount: c.messages?.length || 0 })));
});

// GET /api/ai/chat/:id — get full chat
app.get('/api/ai/chat/:id', async (req, res) => {
  const chat = await getChat(req.params.id);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  res.json(chat);
});

// POST /api/ai/chat/new — create empty chat
app.post('/api/ai/chat/new', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const chat = {
    id:         `chat_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    userId,
    title:      '',
    messages:   [],
    createdAt:  Date.now(),
    updatedAt:  Date.now(),
  };
  await saveChat(chat);
  res.json(chat);
});

// DELETE /api/ai/chat/:id
app.delete('/api/ai/chat/:id', async (req, res) => {
  await deleteChat(req.params.id);
  res.json({ success: true });
});

// ══════════════════════════════════════════
//  OWNER ROUTES
// ══════════════════════════════════════════

// GET prompt
app.get('/api/owner/prompt', authOwner, async (req, res) => {
  res.json({ prompt: await getPrompt() });
});

// PUT prompt
app.put('/api/owner/prompt', authOwner, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || prompt.length < 10) return res.status(400).json({ error: 'Prompt too short' });
  await setPrompt(prompt);
  res.json({ success: true });
});

// GET all chats (owner)
app.get('/api/owner/chats', authOwner, async (req, res) => {
  if (SUPABASE_URL) {
    try {
      const rows = await sbReq('GET', 'ai_chats', null, '?select=id,user_id,data&order=updated_at.desc&limit=100');
      return res.json((rows || []).map(r => ({
        id:           r.id,
        userId:       r.user_id,
        title:        r.data?.title || 'Untitled',
        messageCount: r.data?.messages?.length || 0,
        updatedAt:    r.data?.updatedAt,
      })));
    } catch {}
  }
  res.json(Object.values(_memChats).map(c => ({ id: c.id, userId: c.userId, title: c.title, messageCount: c.messages?.length || 0, updatedAt: c.updatedAt })));
});

// GET usage stats (owner)
app.get('/api/owner/usage', authOwner, async (req, res) => {
  if (SUPABASE_URL) {
    try {
      const rows = await sbReq('GET', 'ai_usage', null, `?date=eq.${todayKey()}&select=user_id,count&order=count.desc&limit=50`);
      const total = (rows || []).reduce((s, r) => s + r.count, 0);
      return res.json({ date: todayKey(), total, users: rows || [] });
    } catch {}
  }
  const today = todayKey();
  const users = Object.entries(_memLimits)
    .filter(([k]) => k.endsWith(today))
    .map(([k, count]) => ({ user_id: k.replace('_'+today,''), count }));
  res.json({ date: today, total: users.reduce((s,u)=>s+u.count,0), users });
});

// DELETE chat (owner)
app.delete('/api/owner/chat/:id', authOwner, async (req, res) => {
  await deleteChat(req.params.id);
  res.json({ success: true });
});

// Reset usage for user
app.delete('/api/owner/usage/:userId', authOwner, async (req, res) => {
  const key = `${req.params.userId}_${todayKey()}`;
  delete _memLimits[key];
  if (SUPABASE_URL) {
    try { await sbReq('DELETE', 'ai_usage', null, `?key=eq.${encodeURIComponent(key)}`); } catch {}
  }
  res.json({ success: true });
});

// ══════════════════════════════════════════
//  KEEPALIVE
// ══════════════════════════════════════════
setInterval(() => {
  http.get(`http://localhost:${PORT}/api/status`, r => { r.resume(); console.log(`[AI] Keepalive ✓ uptime:${Math.floor(process.uptime())}s`); }).on('error', ()=>{});
}, 10 * 60 * 1000);

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'index.html')));

app.listen(PORT, () => {
  console.log(`╔══════════════════════════════════════╗`);
  console.log(`║   VOIDEX AI v${VERSION} — ONLINE          ║`);
  console.log(`║   Model: Llama 3.3 70B (Groq)        ║`);
  console.log(`║   Made by Aousisgood1                ║`);
  console.log(`╚══════════════════════════════════════╝`);
});
