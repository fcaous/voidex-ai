/* ══════════════════════════════════════════
   VOIDEX AI — styles.css
   Red theme — Made by Aousisgood1
══════════════════════════════════════════ */

:root {
  --r:      #731010;
  --rh:     #b91c1c;
  --rg:     #ef4444;
  --rd:     #3b0808;
  --bg:     #060101;
  --bg2:    #0a0202;
  --card:   #140303;
  --card2:  #1c0404;
  --b:      #2d0707;
  --b2:     #4a0d0d;
  --b3:     #631212;
  --txt:    #fff;
  --td:     #fca5a5;
  --tm:     #7f1d1d;
  --green:  #16a34a;
}

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
html, body { height:100%; overflow:hidden; }
body {
  font-family: 'Rajdhani', sans-serif;
  background: var(--bg);
  color: var(--txt);
  display: flex;
}

/* Grain */
body::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  pointer-events: none; z-index: 9999; opacity: .5;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--r); border-radius: 2px; }

/* ══ SIDEBAR ══ */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--bg2);
  border-right: 1px solid var(--b);
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: transform .25s ease, width .25s ease;
  position: relative;
  z-index: 10;
}
.sidebar.collapsed { transform: translateX(-260px); width: 0; overflow: hidden; }

.sidebar-top { padding: 1.2rem 1rem 0; }

.sidebar-logo {
  display: flex; align-items: center; gap: 9px;
  cursor: pointer; margin-bottom: 1rem;
  user-select: none;
}
.logo-hex {
  width: 32px; height: 32px; background: var(--r); border-radius: 7px;
  display: flex; align-items: center; justify-content: center; font-size: 15px;
  border: 1px solid var(--rh); box-shadow: 0 0 12px rgba(185,28,28,.35);
  transition: box-shadow .2s;
}
.sidebar-logo:hover .logo-hex { box-shadow: 0 0 20px rgba(239,68,68,.5); }
.logo-text {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.2rem; font-weight: 800; letter-spacing: .08em;
}
.logo-text span { color: var(--rg); }

.new-chat-btn {
  width: 100%;
  background: var(--r); border: 1px solid var(--rh); border-radius: 8px;
  padding: .6rem 1rem; color: #fff;
  font-family: 'Barlow Condensed', sans-serif; font-size: .95rem; font-weight: 700; letter-spacing: .08em;
  cursor: pointer; transition: all .15s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-bottom: 1.2rem;
}
.new-chat-btn span { font-size: 1.2rem; line-height: 1; }
.new-chat-btn:hover { background: var(--rh); box-shadow: 0 0 16px rgba(239,68,68,.35); }

.sidebar-section-label {
  font-size: .65rem; font-weight: 700; letter-spacing: .15em;
  color: var(--tm); padding: 0 1rem .4rem;
}

.chat-list { flex: 1; overflow-y: auto; padding: 0 .5rem; }
.chat-list-empty { color: var(--tm); font-size: .85rem; font-weight: 500; padding: .8rem .5rem; text-align: center; }

.chat-item {
  display: flex; align-items: center; justify-content: space-between; gap: .4rem;
  padding: .55rem .7rem; border-radius: 7px; cursor: pointer;
  transition: background .12s; margin-bottom: 2px;
}
.chat-item:hover { background: var(--card2); }
.chat-item.active { background: rgba(115,16,16,.35); border: 1px solid var(--b2); }
.chat-item-title {
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .88rem; font-weight: 600; color: var(--td);
}
.chat-item.active .chat-item-title { color: #fff; }
.chat-item-del {
  flex-shrink: 0; width: 20px; height: 20px; border-radius: 4px;
  background: transparent; border: none; color: var(--tm);
  font-size: .7rem; cursor: pointer; display: none;
  align-items: center; justify-content: center; transition: all .12s;
}
.chat-item:hover .chat-item-del { display: flex; }
.chat-item-del:hover { background: rgba(185,28,28,.3); color: var(--rg); }
.chat-item-meta { font-size: .7rem; color: var(--tm); }

.sidebar-bottom { padding: .8rem 1rem 1rem; border-top: 1px solid var(--b); }
.usage-bar-wrap { margin-bottom: .6rem; }
.usage-label { display: flex; justify-content: space-between; font-size: .75rem; font-weight: 600; color: var(--tm); margin-bottom: .35rem; }
.usage-bar-bg { height: 5px; background: var(--b); border-radius: 3px; overflow: hidden; }
.usage-bar-fill { height: 100%; background: var(--r); border-radius: 3px; transition: width .4s ease; }
.usage-bar-fill.warn { background: #d97706; }
.usage-bar-fill.full { background: var(--rg); }
.usage-reset { font-size: .68rem; color: var(--tm); margin-top: .25rem; }
.sidebar-model { font-size: .72rem; color: var(--tm); font-family: 'Share Tech Mono', monospace; }

/* ══ MAIN ══ */
.main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

.chat-header {
  height: 54px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1.2rem;
  background: rgba(6,1,1,.92);
  border-bottom: 1px solid var(--b);
  backdrop-filter: blur(12px);
}
.sidebar-toggle {
  background: transparent; border: 1px solid var(--b); border-radius: 6px;
  width: 32px; height: 32px; color: var(--td); cursor: pointer; font-size: 1rem;
  display: flex; align-items: center; justify-content: center; transition: all .15s;
  flex-shrink: 0;
}
.sidebar-toggle:hover { border-color: var(--b2); color: #fff; background: var(--card); }
.header-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.1rem; font-weight: 700; letter-spacing: .06em;
  color: var(--td); flex: 1; text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  padding: 0 .5rem;
}
.model-badge {
  font-family: 'Share Tech Mono', monospace;
  font-size: .65rem; color: var(--rg);
  background: var(--rd); border: 1px solid var(--b2);
  border-radius: 4px; padding: .18rem .5rem; white-space: nowrap;
}
.header-right { display: flex; align-items: center; gap: .5rem; flex-shrink: 0; }

/* ══ CHAT AREA ══ */
.chat-area {
  flex: 1; overflow-y: auto; display: flex; flex-direction: column;
  padding: 1.5rem 1rem;
}

/* Welcome */
.welcome {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 2rem 1rem;
  max-width: 640px; margin: 0 auto; width: 100%;
}
.welcome-icon {
  font-size: 3rem; margin-bottom: 1rem;
  color: var(--rg); text-shadow: 0 0 30px rgba(239,68,68,.4);
}
.welcome-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.5rem; font-weight: 800; letter-spacing: -.01em; margin-bottom: .5rem;
}
.welcome-title span { color: var(--rg); }
.welcome-sub { color: var(--td); font-size: .95rem; font-weight: 500; line-height: 1.6; margin-bottom: 2rem; }

.suggestions-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: .6rem; width: 100%;
}
.suggestion-btn {
  background: var(--card); border: 1px solid var(--b); border-radius: 9px;
  padding: .75rem 1rem; color: var(--td); text-align: left;
  font-family: 'Rajdhani', sans-serif; font-size: .88rem; font-weight: 600; line-height: 1.4;
  cursor: pointer; transition: all .15s;
}
.suggestion-btn:hover { border-color: var(--b2); background: var(--card2); color: #fff; }

/* Messages */
.messages { max-width: 760px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: .6rem; }

.msg-row {
  display: flex; gap: .7rem; align-items: flex-start;
  animation: msgIn .2s ease;
}
@keyframes msgIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }

.msg-row.user { flex-direction: row-reverse; }

.msg-avatar {
  width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: .85rem;
  margin-top: 2px;
}
.msg-row.user .msg-avatar { background: var(--r); border: 1px solid var(--rh); }
.msg-row.ai   .msg-avatar { background: var(--card2); border: 1px solid var(--b2); color: var(--rg); }

.msg-bubble {
  max-width: 75%; padding: .75rem 1rem; border-radius: 12px;
  font-size: .93rem; line-height: 1.65; font-weight: 500;
}
.msg-row.user .msg-bubble {
  background: var(--r); color: #fff; border: 1px solid var(--rh);
  border-bottom-right-radius: 4px;
}
.msg-row.ai .msg-bubble {
  background: var(--card); border: 1px solid var(--b);
  color: var(--td); border-bottom-left-radius: 4px;
}

/* Thinking indicator */
.thinking-bubble {
  background: var(--card); border: 1px solid var(--b);
  border-radius: 12px; border-bottom-left-radius: 4px;
  padding: .75rem 1rem; display: flex; align-items: center; gap: 4px;
}
.t-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--rg);
  animation: tdot 1.2s infinite;
}
.t-dot:nth-child(2) { animation-delay: .15s; }
.t-dot:nth-child(3) { animation-delay: .3s; }
@keyframes tdot { 0%,60%,100%{transform:translateY(0);opacity:.4;} 30%{transform:translateY(-5px);opacity:1;} }

/* Cursor blink */
.cursor-blink { display: inline-block; width: 2px; height: 1em; background: var(--rg); margin-left: 2px; vertical-align: text-bottom; animation: cblink .7s infinite; }
@keyframes cblink { 0%,100%{opacity:1} 50%{opacity:0} }

/* Code blocks in messages */
.msg-bubble pre {
  background: var(--bg2); border: 1px solid var(--b); border-radius: 6px;
  padding: .7rem .9rem; margin: .5rem 0; overflow-x: auto;
  font-family: 'Share Tech Mono', monospace; font-size: .8rem; line-height: 1.6;
}
.msg-bubble code {
  font-family: 'Share Tech Mono', monospace; font-size: .85em;
  background: rgba(115,16,16,.25); border-radius: 3px; padding: .1em .35em;
}
.msg-bubble pre code { background: none; padding: 0; }

/* ══ INPUT ══ */
.input-area {
  flex-shrink: 0; padding: .8rem 1rem 1rem;
  border-top: 1px solid var(--b);
  background: var(--bg);
}
.input-wrap {
  display: flex; align-items: flex-end; gap: .6rem;
  background: var(--card); border: 1px solid var(--b2); border-radius: 12px;
  padding: .5rem .5rem .5rem .9rem; max-width: 760px; margin: 0 auto;
  transition: border-color .2s;
}
.input-wrap:focus-within { border-color: var(--rh); }
.msg-textarea {
  flex: 1; background: transparent; border: none; outline: none; resize: none;
  color: #fff; font-family: 'Rajdhani', sans-serif; font-size: .95rem; font-weight: 500;
  line-height: 1.5; max-height: 140px; overflow-y: auto;
}
.msg-textarea::placeholder { color: var(--tm); }
.send-btn {
  width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
  background: var(--r); border: 1px solid var(--rh); color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s;
}
.send-btn:hover { background: var(--rh); box-shadow: 0 0 12px rgba(239,68,68,.4); }
.send-btn:disabled { opacity: .4; cursor: not-allowed; }
.input-footer { text-align: center; font-size: .7rem; color: var(--tm); margin-top: .5rem; max-width: 760px; margin-left: auto; margin-right: auto; }
.input-footer strong { color: var(--rg); }

/* ══ OWNER PANEL ══ */
.owner-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.85); backdrop-filter: blur(6px);
  z-index: 1000; display: none; align-items: center; justify-content: center; padding: 1.5rem;
}
.owner-overlay.open { display: flex; }
.owner-panel {
  background: var(--bg2); border: 1px solid var(--b2); border-radius: 14px;
  width: 100%; max-width: 680px; max-height: 88vh; overflow-y: auto;
  padding: 1.8rem; animation: fadeUp .25s ease;
}
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
.owner-panel-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: .4rem;
}
.owner-panel-header h2 {
  font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 800;
}
.owner-panel-header h2 span { color: var(--rg); }
.owner-close {
  width: 28px; height: 28px; border-radius: 6px; background: rgba(185,28,28,.18);
  border: 1px solid var(--b2); color: var(--td); cursor: pointer; font-size: .9rem;
  display: flex; align-items: center; justify-content: center; transition: background .12s;
}
.owner-close:hover { background: var(--r); color: #fff; }
.owner-sub { color: var(--td); font-size: .9rem; font-weight: 500; margin-bottom: 1.2rem; }

.owner-tabs { display: flex; gap: .4rem; margin-bottom: 1.2rem; border-bottom: 1px solid var(--b); padding-bottom: .8rem; }
.owner-tab {
  background: transparent; border: 1px solid var(--b); border-radius: 7px;
  padding: .38rem .9rem; color: var(--tm); font-family: 'Barlow Condensed', sans-serif;
  font-size: .9rem; font-weight: 700; letter-spacing: .06em; cursor: pointer; transition: all .15s;
}
.owner-tab:hover { border-color: var(--b2); color: var(--td); }
.owner-tab.active { background: var(--r); border-color: var(--rh); color: #fff; }

.owner-tab-content { display: none; }
.owner-tab-content.active { display: block; }
.owner-tab-desc { color: var(--td); font-size: .88rem; font-weight: 500; margin-bottom: .8rem; line-height: 1.6; }

.owner-field { margin-bottom: 1rem; }
.owner-field label { display: block; font-size: .75rem; font-weight: 700; letter-spacing: .12em; color: var(--td); margin-bottom: .4rem; }
.owner-field input {
  width: 100%; background: var(--card2); border: 1px solid var(--b); border-radius: 7px;
  padding: .65rem .9rem; color: #fff; font-family: 'Share Tech Mono', monospace;
  font-size: .88rem; outline: none; transition: border-color .2s;
}
.owner-field input:focus { border-color: var(--rh); }
.owner-field input::placeholder { color: var(--tm); }
.owner-btn {
  width: 100%; background: var(--r); border: 1px solid var(--rh); border-radius: 8px;
  padding: .7rem; color: #fff; font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem; font-weight: 700; letter-spacing: .08em; cursor: pointer; transition: all .2s;
  margin-top: .5rem;
}
.owner-btn:hover { background: var(--rh); }
.owner-err {
  background: rgba(185,28,28,.15); border: 1px solid rgba(239,68,68,.3);
  border-radius: 6px; padding: .45rem .8rem; color: #fca5a5;
  font-size: .82rem; font-weight: 600; margin-bottom: .5rem;
}
.prompt-textarea {
  width: 100%; min-height: 280px; resize: vertical;
  background: var(--card2); border: 1px solid var(--b); border-radius: 8px;
  padding: .9rem 1rem; color: #fff; font-family: 'Share Tech Mono', monospace;
  font-size: .8rem; line-height: 1.75; outline: none; transition: border-color .2s;
}
.prompt-textarea:focus { border-color: var(--rh); }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: .8rem; margin-bottom: 1.2rem; }
.stat-card { background: var(--card); border: 1px solid var(--b); border-radius: 9px; padding: 1rem; text-align: center; }
.stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 800; color: var(--rg); line-height: 1; }
.stat-lbl { font-size: .68rem; color: var(--tm); letter-spacing: .1em; font-weight: 700; margin-top: .25rem; }
.owner-chat-row {
  display: flex; align-items: center; justify-content: space-between; gap: .8rem;
  padding: .65rem .9rem; border-bottom: 1px solid var(--b); font-size: .85rem;
}
.owner-chat-row:last-child { border-bottom: none; }
.ocr-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--td); font-weight: 600; }
.ocr-meta { color: var(--tm); font-size: .75rem; white-space: nowrap; }
.ocr-del { background: transparent; border: 1px solid var(--b); border-radius: 4px; padding: .18rem .5rem; color: var(--tm); font-size: .72rem; cursor: pointer; transition: all .12s; }
.ocr-del:hover { border-color: var(--rg); color: var(--rg); }

/* Mobile responsive */
@media (max-width: 640px) {
  .sidebar { position: absolute; }
  .msg-bubble { max-width: 88%; }
  .suggestions-grid { grid-template-columns: 1fr; }
}
