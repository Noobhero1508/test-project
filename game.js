/* ═══════════════════════════════════════════════════════════
   GLOBAL AGENT MISSION — Player Game Engine
   ═══════════════════════════════════════════════════════════ */

// ─── Player State ───
let playerId = null;
let playerName = '';
let score = 0;
let streak = 0;
let maxStreak = 0;
let correctCount = 0;
let currentQ = -1;
let currentRound = 0;
let timerInterval = null;
let timeLeft = 20;
let answered = false;
let hintUsed = false;
let matrixAnimFrame = null;
let playerTeam = null;   // 'pro' or 'anti'
let teamScore = 0;       // points earned during Round 3
let round4Score = 0;     // points earned ONLY in Round 4 (for team battle display)
let sessionR3Questions = null; // synced from Firebase
let sessionR3Seed = null;
let questionScreenTemplate = null;
let typewriterSkipped = false;  // skip typewriter flag
let currentMCQQuestion = null;  // for keyboard nav
let r3InfluenceListener = null; // optimized listener ref

// ─── Round 3 Client-Driven State ───
let r3LocalQuestionIndex = 0;  // 0-9, current question within R3
let r3Questions = [];          // 10 R3 questions for this session
let r3AutoAdvanceTimer = null; // local auto-advance timer
let r3FlowStarted = false;     // guard: start only once
let r3Finished = false;        // has player sent r3finished?
let r3BonusApplied = false;    // has team bonus been applied?

const TOTAL_TIME = 20;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 22; // ~138.23

function hashString32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle(arr, seed) {
  const out = [...arr];
  let s = seed >>> 0;
  const next = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildPerPlayerR3Questions(seed) {
  const stableSeed = hashString32(`${playerId || 'guest'}:${seed || 0}`);
  return seededShuffle(ROUND3_POOL, stableSeed).slice(0, 10);
}

// ─── Screen Management ───
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');

  // Trigger screen-specific init
  if (id === 'screen-story') startTypewriter();
  if (id === 'screen-name') document.getElementById('player-name-input').focus();
}

// ─── Typewriter Effect ───
const STORY_TEXT = `Agent,

Welcome to the Global Intelligence Bureau.
The world is more connected than ever — and more fragile.

Globalization has reshaped economies, cultures, and languages
at a speed no one predicted. But with connection comes conflict.

Our analysts have identified critical gaps in global knowledge.
Trade imbalances. Cultural misunderstandings. Language barriers.

You have been selected to close those gaps.

Four missions await you — each one testing a different dimension
of your global intelligence. Answer well. Answer fast.
The world is watching.

— Commander Atlas`;

let typewriterStarted = false;
function startTypewriter() {
  if (typewriterStarted) return;
  typewriterStarted = true;

  const container = document.getElementById('story-text');
  const cursor = document.getElementById('cursor');
  const btnBegin = document.getElementById('btn-begin');
  const btnSkip = document.getElementById('btn-skip-story');
  const totalLen = STORY_TEXT.length;
  let i = 0;

  function finishTypewriter() {
    // Show all text immediately
    container.innerHTML = STORY_TEXT.replace(/\n/g, '<br>');
    cursor.style.display = 'none';
    btnBegin.classList.add('visible');
    if (btnSkip) btnSkip.classList.add('hidden');
    for (let d = 0; d < 5; d++) {
      document.getElementById('sp-' + d).classList.add('filled');
    }
  }

  function type() {
    if (typewriterSkipped || i >= totalLen) {
      finishTypewriter();
      return;
    }
    const ch = STORY_TEXT[i];
    if (ch === '\n') {
      container.innerHTML += '<br>';
    } else {
      container.innerHTML += ch;
    }
    i++;

    // Progress dots
    const pct = i / totalLen;
    const dotIdx = Math.floor(pct * 5);
    for (let d = 0; d < dotIdx; d++) {
      document.getElementById('sp-' + d).classList.add('filled');
    }

    // Delay per character type
    let delay = 28;
    if (ch === '.' || ch === ',' || ch === '—') delay = 55;
    if (ch === '\n') delay = 80;

    setTimeout(type, delay);
  }
  type();
}

function skipTypewriter() {
  typewriterSkipped = true;
}

// ─── Name Input & Firebase Join ───
function confirmName() {
  const input = document.getElementById('player-name-input');
  const name = input.value.trim();
  if (!name) { input.focus(); return; }

  playerName = name;

  // Try to reconnect with saved session
  const savedId = localStorage.getItem('gam_playerId');
  const savedName = localStorage.getItem('gam_playerName');
  if (savedId && savedName === name) {
    playerId = savedId;
    console.log('[PLAYER] Reconnecting as:', playerName, 'ID:', playerId);
  } else {
    playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    console.log('[PLAYER] Joining as:', playerName, 'ID:', playerId);
  }

  // Save to localStorage for reconnection
  localStorage.setItem('gam_playerId', playerId);
  localStorage.setItem('gam_playerName', playerName);

  const playerRef = db.ref('players/' + playerId);

  // Write to Firebase
  playerRef.set({
    name: playerName,
    score: 0,
    streak: 0,
    rank: 'Junior Agent',
    answers: {}
  }).then(() => {
    console.log('[PLAYER] Successfully joined Firebase');
  }).catch(err => {
    console.error('[PLAYER] Failed to join:', err);
    alert('Could not connect to game server! Check your internet connection.');
  });

  // Auto-cleanup on disconnect
  playerRef.onDisconnect().remove();

  // Switch to waiting room
  document.getElementById('name-entry').classList.add('hidden');
  document.getElementById('waiting-room').classList.remove('hidden');

  // Listen for other players
  db.ref('players').on('value', snap => {
    const players = snap.val() || {};
    const list = document.getElementById('player-list');
    list.innerHTML = '';
    Object.values(players).forEach(p => {
      const tag = document.createElement('span');
      tag.className = 'player-tag';
      tag.textContent = p.name;
      list.appendChild(tag);
    });
    console.log('[PLAYER] Players in lobby:', Object.keys(players).length);
  }, err => {
    console.error('[PLAYER] Error listening to players:', err);
  });

  // Listen for session changes during game
  db.ref('session').on('value', snap => {
    const session = snap.val();
    console.log('[PLAYER] Session update:', session?.status, 'Q:', session?.currentQuestion);
    if (session && session.status === 'playing') {
      handleSessionUpdate(session);
    } else if (session && session.status === 'between_rounds') {
      showFunFact(session.currentRound);
    } else if (session && session.status === 'team_selection') {
      showTeamSelection();
    } else if (session && session.status === 'r3_reveal') {
      showR3Reveal(session.r3Winner);
    } else if (session && session.status === 'team_results') {
      showTeamResults();
    } else if (session && session.status === 'ended') {
      showFinalResults();
    }
  }, err => {
    console.error('[PLAYER] Error listening to session:', err);
  });
}

// ─── Session Update Handler ───
function handleSessionUpdate(session) {
  const qIdx = session.currentQuestion;
  const round = session.currentRound;

  // Build per-player Round 3 set once per session seed.
  if (session.round3Seed && session.round3Seed !== sessionR3Seed) {
    sessionR3Seed = session.round3Seed;
    r3Questions = buildPerPlayerR3Questions(sessionR3Seed);
    QUESTIONS = buildSessionQuestions(r3Questions);
  } else if (!sessionR3Seed && session.round3Questions && !sessionR3Questions) {
    // Backward compatibility if host has not sent round3Seed yet.
    sessionR3Questions = session.round3Questions;
    r3Questions = sessionR3Questions.map(id => ROUND3_POOL.find(q => q.id === id)).filter(Boolean);
    QUESTIONS = buildSessionQuestions(r3Questions);
  }

  // ── Round 3: handled entirely client-side ──
  if (round === 3) {
    currentRound = 3;
    if (!r3FlowStarted && r3Questions.length > 0) {
      r3FlowStarted = true;
      startR3LocalFlow();
    }
    return; // Do NOT let host's currentQuestion drive R3 rendering
  }

  // ── Rounds 1, 2, 4: host-driven as before ──
  if (qIdx !== currentQ) {
    currentQ = qIdx;
    currentRound = round;
    answered = false;
    hintUsed = false;

    let qInRound = 0;
    if (round === 1) qInRound = qIdx;
    else if (round === 2) qInRound = qIdx - 5;
    else if (round === 4) qInRound = qIdx - 20;

    if (qInRound === 0) {
      showRoundIntro(round, () => loadQuestion(qIdx));
    } else {
      loadQuestion(qIdx);
    }
  }

  if (session.showAnswer && !answered) {
    handleTimeout();
  }
}

// ─── Round 3 Local Flow ───────────────────────────────────
function startR3LocalFlow() {
  r3LocalQuestionIndex = 0;
  r3Finished = false;
  r3BonusApplied = false;
  showRoundIntro(3, () => loadR3Question(0));
}

function loadR3Question(idx) {
  ensureQuestionScreenTemplate();
  restoreQuestionScreenIfNeeded();

  if (idx >= r3Questions.length) {
    finishR3();
    return;
  }

  const q = r3Questions[idx];
  // Update local currentQ to the global QUESTIONS index (R3 starts at 10)
  currentQ = 10 + idx;
  currentRound = 3;
  answered = false;
  hintUsed = false;

  showScreen('screen-question');
  const screenEl = document.getElementById('screen-question');
  screenEl.className = 'screen active theme-debate';
  screenEl.style.background = '#1a1410';
  screenEl.style.setProperty('--accent', '#d4a017');

  // Build header with correct local index
  buildR3Header(idx);

  // Build question body
  document.getElementById('feedback-box').classList.add('hidden');
  const tag = document.getElementById('q-tag');
  tag.textContent = 'MOTION BEFORE THE COURT · Q' + (idx + 1) + ' OF 10';

  const fillinBanner = document.getElementById('fillin-banner');
  const mcqArea = document.getElementById('q-mcq-area');
  const fillinArea = document.getElementById('q-fillin-area');

  if (q.type === 'fillin') {
    fillinBanner.classList.remove('hidden');
    mcqArea.classList.add('hidden');
    fillinArea.classList.remove('hidden');
    setupFillIn(q);
  } else {
    fillinBanner.classList.add('hidden');
    mcqArea.classList.remove('hidden');
    fillinArea.classList.add('hidden');
    setupMCQ(q);
  }

  // Build progress dots (showing position within 10 R3 questions)
  buildR3ProgressDots(idx);

  document.getElementById('r4-stage-dots').classList.add('hidden');
  document.getElementById('score-display').textContent = score.toLocaleString();
  updateStreakBadge();
  stopMatrixRain();
  startTimer();

  // Update influence bar
  updateInfluenceBar();
}

function buildR3Header(idx) {
  const header = document.getElementById('q-header');
  header.innerHTML = `
    <div class="q-topbar">
      <span style="font-size:22px">⚖️</span>
      <div class="r3-title-center">
        GLOBALIZATION DEBATE ARENA
        <small>ROUND 3 · THE COURTROOM · Q${idx + 1} OF 10</small>
      </div>
      <span style="font-size:20px">🏛️</span>
    </div>
    <div class="versus-bar">
      <div class="vs-side vs-pro">
        <span style="font-size:20px">🌐</span>
        <div>
          <div>PRO GLOBALIZATION</div>
          <div class="vs-pts" id="vs-pro-pts">0 pts</div>
        </div>
      </div>
      <div class="vs-middle">VS</div>
      <div class="vs-side vs-anti">
        <div>
          <div>ANTI GLOBALIZATION</div>
          <div class="vs-pts" id="vs-anti-pts">0 pts</div>
        </div>
        <span style="font-size:20px">🛡️</span>
      </div>
    </div>
    <div class="influence-bar-wrap">
      <div class="influence-bar-label">— INFLUENCE BAR —</div>
      <div class="influence-bar">
        <div class="inf-pro" id="inf-pro" style="width:50%"></div>
        <div class="inf-anti" id="inf-anti" style="width:50%"></div>
      </div>
    </div>`;
  updateInfluenceBar();
}

function buildR3ProgressDots(idx) {
  const container = document.getElementById('progress-dots');
  container.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const dot = document.createElement('span');
    dot.className = 'p-dot';
    if (i < idx) dot.classList.add('done');
    if (i === idx) dot.classList.add('current');
    container.appendChild(dot);
  }
}

function loadNextR3Question() {
  if (r3AutoAdvanceTimer) {
    clearTimeout(r3AutoAdvanceTimer);
    r3AutoAdvanceTimer = null;
  }
  r3LocalQuestionIndex++;
  if (r3LocalQuestionIndex < 10) {
    loadR3Question(r3LocalQuestionIndex);
  } else {
    finishR3();
  }
}

function finishR3() {
  if (r3Finished) return;
  r3Finished = true;
  stopTimer();

  // Keep original question DOM intact by swapping in a temporary waiting template.
  ensureQuestionScreenTemplate();
  showScreen('screen-question');
  const screen = document.getElementById('screen-question');
  screen.className = 'screen active';
  screen.style.background = '#0d1117';
  screen.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:24px;padding:40px;text-align:center">
      <div style="font-size:64px">⚖️</div>
      <h2 style="color:#d4a017;font-size:28px;margin:0">ROUND 3 COMPLETE!</h2>
      <p style="color:#aaa;font-size:18px;margin:0">You answered all 10 questions!<br>Waiting for the other team to finish...</p>
      <div class="r3-wait-spinner" style="width:60px;height:60px;border:4px solid #333;border-top:4px solid #d4a017;border-radius:50%;animation:spin 1s linear infinite;margin-top:20px"></div>
      <div id="r3-bonus-notification" style="display:none;margin-top:20px;padding:20px 32px;background:linear-gradient(135deg,#1a2a1a,#0d1a0d);border:2px solid #4caf50;border-radius:16px;color:#4caf50;font-size:20px;font-weight:700"></div>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;

  // Send completion signals to Firebase
  const now = firebase.database.ServerValue.TIMESTAMP;
  db.ref('players/' + playerId).update({
    r3finished: true,
    r3FinishedAt: now
  });
}

// ─── Team Bonus Listener ──────────────────────────────────
function startR3BonusListener() {
  db.ref('session/r3TeamBonus').on('value', snap => {
    const bonus = snap.val();
    if (!bonus || r3BonusApplied) return;
    if (bonus.team !== playerTeam) return;

    r3BonusApplied = true;
    const playerBonus = bonus.playerBonus || 500;

    // Show notification if on the finish screen
    const notif = document.getElementById('r3-bonus-notification');
    if (notif) {
      notif.style.display = 'block';
      notif.innerHTML = `🏆 TEAM COMPLETION BONUS!<br><span style="font-size:28px">+${playerBonus} pts</span><br><small style="color:#aaa;font-size:14px">Your team finished first!</small>`;
    } else {
      // Still in question — show overlay notification
      showBonusToast(playerBonus);
    }

    // Pull authoritative scores from Firebase immediately.
    db.ref('players/' + playerId).once('value').then(playerSnap => {
      const p = playerSnap.val() || {};
      score = p.score || score;
      teamScore = p.teamScore || teamScore;
      const scoreEl = document.getElementById('score-display');
      if (scoreEl) scoreEl.textContent = score.toLocaleString();
      updateInfluenceBar();
    });
  });
}

function showBonusToast(pts) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;top:20px;right:20px;z-index:9999;
    background:linear-gradient(135deg,#1a2a1a,#2a3a2a);
    border:2px solid #4caf50;border-radius:12px;
    padding:16px 24px;color:#4caf50;font-weight:700;font-size:18px;
    box-shadow:0 8px 32px rgba(76,175,80,.4);
    animation:slideIn .3s ease;`;
  toast.innerHTML = `🏆 TEAM BONUS! <span style="color:#fff">+${pts} pts</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// ─── Round Intro ───
function showRoundIntro(round, callback) {
  const r = ROUNDS[round];
  document.getElementById('ri-icon').textContent = r.icon;
  document.getElementById('ri-badge').textContent = 'ROUND ' + round;
  document.getElementById('ri-name').textContent = r.name;
  document.getElementById('ri-sub').textContent = r.subtitle;

  const colors = { 1: '#cc0000', 2: '#00ff88', 3: '#d4a017', 4: '#e491b0' };
  document.getElementById('ri-badge').style.background = colors[round] || '#cc0000';

  // Round 4: reset round4Score
  if (round === 4) round4Score = 0;

  showScreen('screen-round-intro');

  let count = 3;
  const cdEl = document.getElementById('ri-countdown');
  cdEl.textContent = 'Starting in 3...';

  const cdInterval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(cdInterval);
      callback();
    } else {
      cdEl.textContent = 'Starting in ' + count + '...';
    }
  }, 1000);
}

// ─── Load Question ───
function loadQuestion(qIdx) {
  ensureQuestionScreenTemplate();
  restoreQuestionScreenIfNeeded();

  const q = QUESTIONS[qIdx];
  const round = q.round;
  // qInRound calculation (R3 is 10-19 in 25-q array)
  let qInRound = qIdx;
  if (round === 2) qInRound = qIdx - 5;
  else if (round === 3) qInRound = qIdx - 10;
  else if (round === 4) qInRound = qIdx - 20;
  const theme = ROUNDS[round].theme;

  showScreen('screen-question');
  const screenEl = document.getElementById('screen-question');

  // Remove old themes
  screenEl.className = 'screen active theme-' + theme;

  // Apply culture shock sub-theme
  if (round === 4 && q.stage) {
    const stage = CULTURE_STAGES[q.stage];
    screenEl.style.background = stage.bg;
    screenEl.style.setProperty('--accent', stage.accent);
  } else if (round === 1) {
    screenEl.style.background = '#0a0a0a';
    screenEl.style.setProperty('--accent', '#cc0000');
  } else if (round === 2) {
    screenEl.style.background = '#050e1a';
    screenEl.style.setProperty('--accent', '#00ff88');
  } else if (round === 3) {
    screenEl.style.background = '#1a1410';
    screenEl.style.setProperty('--accent', '#d4a017');
  }

  // Build header based on round
  buildHeader(round, qIdx, q);

  // Build question body
  const tag = document.getElementById('q-tag');
  const feedbackBox = document.getElementById('feedback-box');
  feedbackBox.classList.add('hidden');

  const totalInRound = round === 3 ? 10 : 5;
  if (round === 3) {
    tag.textContent = 'MOTION BEFORE THE COURT · Q' + (qInRound + 1) + ' OF 10';
  } else if (round === 2) {
    tag.textContent = 'ROUND 2 · Q' + (qInRound + 1) + ' OF 5 · ' + q.topic.toUpperCase();
  } else {
    tag.textContent = 'ROUND ' + round + ' · Q' + (qInRound + 1) + ' OF ' + totalInRound + ' · ' + q.topic.toUpperCase();
  }

  const fillinBanner = document.getElementById('fillin-banner');
  const mcqArea = document.getElementById('q-mcq-area');
  const fillinArea = document.getElementById('q-fillin-area');

  if (q.type === 'fillin') {
    fillinBanner.classList.remove('hidden');
    mcqArea.classList.add('hidden');
    fillinArea.classList.remove('hidden');
    setupFillIn(q);
  } else {
    fillinBanner.classList.add('hidden');
    mcqArea.classList.remove('hidden');
    fillinArea.classList.add('hidden');
    setupMCQ(q);
  }

  // Build progress dots
  buildProgressDots(qIdx);

  // Round 4 stage dots
  const stageDotsCont = document.getElementById('r4-stage-dots');
  if (round === 4 && q.stage) {
    stageDotsCont.classList.remove('hidden');
    const stageOrder = ['honeymoon', 'frustration', 'depression', 'acceptance'];
    const curIdx = stageOrder.indexOf(q.stage);
    stageDotsCont.innerHTML = stageOrder.map((s, i) => {
      const st = CULTURE_STAGES[s];
      const cls = i === curIdx ? 'active' : (i < curIdx ? 'done' : 'todo');
      return `<div class="r4-sdot ${cls}">${st.emoji}</div>`;
    }).join('');
  } else {
    stageDotsCont.classList.add('hidden');
    stageDotsCont.innerHTML = '';
  }

  // Update score display
  document.getElementById('score-display').textContent = score.toLocaleString();

  // Update streak
  updateStreakBadge();

  // Start timer
  startTimer();

  // Matrix canvas for round 2
  if (round === 2) {
    startMatrixRain();
  } else {
    stopMatrixRain();
  }
}

// ─── Build Header per Round ───
function buildHeader(round, qIdx, q) {
  const header = document.getElementById('q-header');
  // R1: 0-4, R2: 5-9, R3: 10-19, R4: 20-24
  let qInRound = qIdx;
  if (round === 2) qInRound = qIdx - 5;
  else if (round === 3) qInRound = qIdx - 10;
  else if (round === 4) qInRound = qIdx - 20;

  if (round === 1) {
    header.innerHTML = `
      <div class="q-topbar">
        <span class="badge-breaking"><span class="brk-dot"></span> BREAKING NEWS</span>
        <span class="r1-network">GNN · GLOBAL NEWS NETWORK</span>
      </div>
      <div class="news-ticker">
        <div class="ticker-inner">
          ★ BREAKING: Starbucks opens 500th store in Southeast Asia ★
          UN warns: environmental impact of consumerism at record high ★
          Survey: 60% of citizens view globalization positively ★
          BREAKING: New trade agreements reshape global markets ★
        </div>
      </div>`;
  } else if (round === 2) {
    header.innerHTML = `
      <div class="q-topbar">
        <span>▶ TRADE FLOOR · ROUND 2</span>
        <div class="stock-tickers">
          <div class="stock-tick"><div class="tick-value tick-up" id="tick-import">IMPORT ▲2.4%</div></div>
          <div class="stock-tick"><div class="tick-value tick-down" id="tick-unemploy">UNEMPLOY ▼0.8%</div></div>
          <div class="stock-tick"><div class="tick-value tick-up" id="tick-gdp">GDP ▲1.1%</div></div>
          <div class="stock-tick"><div class="tick-value tick-up" id="tick-export">EXPORT ▲3.2%</div></div>
        </div>
      </div>`;
    startStockTickers();
  } else  if (round === 3) {
    header.innerHTML = `
      <div class="q-topbar">
        <span style="font-size:22px">⚖️</span>
        <div class="r3-title-center">
          GLOBALIZATION DEBATE ARENA
          <small>ROUND 3 · THE COURTROOM · Q${qInRound + 1} OF 10</small>
        </div>
        <span style="font-size:20px">🏛️</span>
      </div>
      <div class="versus-bar">
        <div class="vs-side vs-pro">
          <span style="font-size:20px">🌐</span>
          <div>
            <div>PRO GLOBALIZATION</div>
            <div class="vs-pts" id="vs-pro-pts">0 pts</div>
          </div>
        </div>
        <div class="vs-middle">VS</div>
        <div class="vs-side vs-anti">
          <div>
            <div>ANTI GLOBALIZATION</div>
            <div class="vs-pts" id="vs-anti-pts">0 pts</div>
          </div>
          <span style="font-size:20px">🛡️</span>
        </div>
      </div>
      <div class="influence-bar-wrap">
        <div class="influence-bar-label">— INFLUENCE BAR —</div>
        <div class="influence-bar">
          <div class="inf-pro" id="inf-pro" style="width:57%"></div>
          <div class="inf-anti" id="inf-anti" style="width:43%"></div>
        </div>
      </div>`;
  } else if (round === 4) {
    const stage = CULTURE_STAGES[q.stage] || CULTURE_STAGES.honeymoon;
    const stages = ['honeymoon', 'frustration', 'depression', 'acceptance'];
    const stageIdx = stages.indexOf(q.stage);
    header.innerHTML = `
      <div class="culture-tabs">
        ${stages.map((s, i) => {
          const st = CULTURE_STAGES[s];
          const isActive = s === q.stage;
          const tabClass = isActive ? 'active' : (i < stageIdx ? 'done' : 'todo');
          return `<div class="c-tab ${tabClass}" style="${isActive ? 'color:' + st.accent + ';border-bottom-color:' + st.accent : ''}">
            <span>${st.emoji}</span> ${st.name}
          </div>`;
        }).join('')}
      </div>
      <div class="stage-banner">
        <div class="stage-emoji">${stage.emoji}</div>
        <div>
          <div class="stage-name" style="color:${stage.accent}">${stage.name} Stage</div>
          <div class="stage-desc">${stage.desc}</div>
        </div>
      </div>
      <div class="mood-bar-wrap">
        <div class="mood-bar">
          <div class="mood-fill" style="width:${stage.moodPct}%;background:${stage.accent}"></div>
        </div>
      </div>`;
  }
}

// ─── Stock Ticker Animation (Round 2) ───
let tickerInterval = null;
function startStockTickers() {
  if (tickerInterval) clearInterval(tickerInterval);
  tickerInterval = setInterval(() => {
    ['tick-import', 'tick-unemploy', 'tick-gdp', 'tick-export'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const labels = { 'tick-import': 'IMPORT', 'tick-unemploy': 'UNEMPLOY', 'tick-gdp': 'GDP', 'tick-export': 'EXPORT' };
      const delta = (Math.random() * 0.4 - 0.2).toFixed(1);
      const numMatch = el.textContent.match(/[\d.]+/);
      const base = numMatch ? parseFloat(numMatch[0]) : 1.0;
      const newVal = (base + parseFloat(delta)).toFixed(1);
      const isUp = newVal >= 0;
      el.textContent = labels[id] + ' ' + (isUp ? '▲' : '▼') + Math.abs(newVal) + '%';
      el.className = 'tick-value ' + (isUp ? 'tick-up' : 'tick-down');
    });
  }, 2000);
}

// ─── Matrix Rain (Round 2) ───
function startMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  canvas.classList.remove('hidden');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = 'IMPORTEXPORTGDPTRADEECONOMYUNEMPLOYMENT01';
  const fontSize = 12;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(5,14,26,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88';
    ctx.font = fontSize + 'px Courier New';

    for (let i = 0; i < drops.length; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    matrixAnimFrame = requestAnimationFrame(draw);
  }
  draw();
}
function stopMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  canvas.classList.add('hidden');
  if (matrixAnimFrame) {
    cancelAnimationFrame(matrixAnimFrame);
    matrixAnimFrame = null;
  }
}

// ─── Setup MCQ ───
function setupMCQ(q) {
  document.getElementById('q-text').textContent = q.question;
  const grid = document.getElementById('q-options');
  const letters = ['A', 'B', 'C', 'D'];
  grid.innerHTML = '';
  currentMCQQuestion = q; // store for keyboard navigation

  // Support 2, 3 or 4 options dynamically
  const optCount = q.options.length;
  if (optCount <= 2) {
    grid.style.gridTemplateColumns = '1fr 1fr';
  } else if (optCount === 3) {
    grid.style.gridTemplateColumns = '1fr 1fr 1fr';
  } else {
    grid.style.gridTemplateColumns = '';
  }

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.id = 'opt-' + i;
    btn.innerHTML = `<span class="opt-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.onclick = () => selectMCQ(i, q);
    grid.appendChild(btn);
  });
}

function selectMCQ(idx, q) {
  if (answered) return;
  answered = true;

  const isCorrect = idx === q.answer;
  const elapsed = TOTAL_TIME - timeLeft;
  const isRound3 = q.round === 3;

  // Style buttons
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === q.answer && (isCorrect || isRound3)) btn.classList.add('correct');
    if (i === idx && !isCorrect) btn.classList.add('wrong');
  });

  // Calculate score
  let earned = 0;
  if (isCorrect) {
    streak++;
    if (streak > maxStreak) maxStreak = streak;
    correctCount++;

    const baseScore = Math.round((timeLeft / TOTAL_TIME) * 800) + 200;
    let multiplier = 1.0;
    if (streak >= 5) multiplier = 2.0;
    else if (streak >= 3) multiplier = 1.5;

    earned = Math.round(baseScore * multiplier);
    score += earned;

    // Confetti on correct answer
    fireCorrectConfetti(streak);

    // Team scoring for Round 3
    if (isRound3 && playerTeam) {
      teamScore += earned;
      db.ref('players/' + playerId).update({ teamScore: teamScore, score: score });
    }

    // Round 4 individual tracking
    if (q.round === 4) {
      round4Score += earned;
      db.ref('players/' + playerId).update({ round4Score: round4Score });
    }
  } else {
    streak = 0;
  }

  // Show feedback
  if (isRound3) {
    const correctAnswerText = !isCorrect ? q.options[q.answer] : null;
    showFeedback(isCorrect, earned, q.explanation, correctAnswerText);
  } else {
    showFeedback(isCorrect, earned, isCorrect ? q.explanation : 'Wait for Commander Atlas to reveal the answer...');
  }

  saveAnswer(q.id, isCorrect, elapsed * 1000, q.options ? q.options[idx] : '');
  stopTimer();
  updateStreakBadge();
  animateScoreUpdate(earned, isCorrect);
  // Remove timer-critical on answer
  const qs = document.getElementById('screen-question');
  if (qs) qs.classList.remove('timer-critical');

  // ── Round 3: client-driven auto-advance ──
  if (isRound3) {
    const delay = isCorrect ? 2000 : 5000;
    if (r3AutoAdvanceTimer) clearTimeout(r3AutoAdvanceTimer);
    r3AutoAdvanceTimer = setTimeout(() => loadNextR3Question(), delay);
  }
}

// ─── Setup Fill-In ───
function setupFillIn(q) {
  document.getElementById('fi-before').textContent = q.blankBefore + ' ';
  document.getElementById('fi-after').textContent = ' ' + q.blankAfter;
  document.getElementById('fi-blank').textContent = '___________';
  document.getElementById('fi-blank').style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent');

  const input = document.getElementById('fi-input');
  input.value = '';
  input.disabled = false;
  input.focus();

  document.getElementById('fi-submit').disabled = false;
  document.getElementById('hint-btn').classList.remove('hidden');
  document.getElementById('hint-display').classList.add('hidden');
  document.getElementById('hint-display').innerHTML = '';
  hintUsed = false;

  // Submit on Enter
  input.onkeydown = (e) => {
    if (e.key === 'Enter') submitFillIn();
  };

  // Live typing feedback — show text in blank as user types
  const blank = document.getElementById('fi-blank');
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  input.oninput = () => {
    const val = input.value.trim();
    if (val) {
      blank.textContent = val;
      blank.style.color = accent;
      blank.style.opacity = '0.7';
    } else {
      blank.textContent = '___________';
      blank.style.color = 'transparent';
      blank.style.opacity = '1';
    }
  };
}

function submitFillIn() {
  if (answered) return;
  const q = QUESTIONS[currentQ];
  const input = document.getElementById('fi-input');
  const val = input.value.trim();
  if (!val) { input.focus(); return; }

  answered = true;
  input.disabled = true;
  document.getElementById('fi-submit').disabled = true;

  const isCorrect = checkFillIn(val, q.answer);
  const elapsed = TOTAL_TIME - timeLeft;
  const blank = document.getElementById('fi-blank');
  const isRound3 = q.round === 3;
  let fiEarned = 0;

  if (isCorrect) {
    blank.textContent = q.answer;
    blank.style.borderColor = '#4caf50';
    blank.style.color = '#4caf50';

    streak++;
    if (streak > maxStreak) maxStreak = streak;
    correctCount++;

    const baseScore = Math.round((timeLeft / TOTAL_TIME) * 800) + 200;
    let multiplier = 1.0;
    if (streak >= 5) multiplier = 2.0;
    else if (streak >= 3) multiplier = 1.5;

    const bonusMultiplier = hintUsed ? 1.0 : 2.0;
    fiEarned = Math.round(baseScore * multiplier * bonusMultiplier);
    score += fiEarned;

    // Confetti on correct fill-in
    fireCorrectConfetti(streak);

    // Team scoring for Round 3
    if (isRound3 && playerTeam) {
      teamScore += fiEarned;
      db.ref('players/' + playerId).update({ teamScore: teamScore, score: score });
    }

    // Round 4 individual tracking
    if (q.round === 4) {
      round4Score += fiEarned;
      db.ref('players/' + playerId).update({ round4Score: round4Score, score: score });
    }

    showFeedback(true, fiEarned, q.explanation);
  } else {
    // Round 3: show the correct answer; Rounds 1/2/4: hide it
    if (isRound3) {
      blank.textContent = q.answer;
      blank.style.borderColor = '#ef5350';
      blank.style.color = '#ef5350';
    } else {
      blank.textContent = '???';
      blank.style.borderColor = '#ef5350';
      blank.style.color = '#ef5350';
    }
    input.parentElement.classList.add('shake');
    streak = 0;

    if (isRound3) {
      showFeedback(false, 0, q.explanation, q.answer);
    } else {
      showFeedback(false, 0, 'Wait for Commander Atlas to reveal the answer...');
    }
  }

  saveAnswer(q.id, isCorrect, elapsed * 1000, val);
  stopTimer();
  updateStreakBadge();
  animateScoreUpdate(fiEarned, isCorrect);
  const qs = document.getElementById('screen-question');
  if (qs) qs.classList.remove('timer-critical');

  // ── Round 3: client-driven auto-advance ──
  if (isRound3) {
    const delay = isCorrect ? 2000 : 5000;
    if (r3AutoAdvanceTimer) clearTimeout(r3AutoAdvanceTimer);
    r3AutoAdvanceTimer = setTimeout(() => loadNextR3Question(), delay);
  }
}

function checkFillIn(userInput, correctAnswer) {
  const normalize = s => s.toLowerCase().trim().replace(/[.,!?]/g, '');
  return normalize(userInput) === normalize(correctAnswer);
}

function useHint() {
  if (hintUsed) return;
  hintUsed = true;
  const q = QUESTIONS[currentQ];
  document.getElementById('hint-btn').classList.add('hidden');

  const words = q.answer.split(' ');
  const display = document.getElementById('hint-display');
  display.classList.remove('hidden');
  display.innerHTML = '';

  words.forEach((word, wIdx) => {
    if (wIdx > 0) {
      const spacer = document.createElement('span');
      spacer.className = 'h-spacer';
      display.appendChild(spacer);
    }
    for (let ci = 0; ci < word.length; ci++) {
      const box = document.createElement('span');
      box.className = 'h-letter';
      box.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent');
      if (ci === 0) {
        box.classList.add('revealed');
        box.textContent = word[ci];
      } else {
        box.classList.add('empty');
        box.textContent = '·';
      }
      display.appendChild(box);
    }
  });
}

// ─── Feedback ───
function showFeedback(isCorrect, earned, explanation, correctAnswer) {
  const box = document.getElementById('feedback-box');
  box.classList.remove('hidden', 'correct', 'wrong', 'timeout');

  if (isCorrect) {
    box.classList.add('correct');
    box.innerHTML = `✓ Correct! +${earned} pts earned.<br><small>${explanation}</small>`;
  } else {
    box.classList.add('wrong');
    const answerText = correctAnswer ? ` The answer is: <strong>${correctAnswer}</strong>` : '';
    box.innerHTML = `✗ Not quite.${answerText}<br><small>${explanation}</small>`;
  }
}

function showTimeoutFeedback(revealAnswer) {
  const q = QUESTIONS[currentQ];
  const box = document.getElementById('feedback-box');
  box.classList.remove('hidden', 'correct', 'wrong', 'timeout');
  box.classList.add('timeout');

  if (revealAnswer) {
    // Round 3: show the correct answer
    const answer = q.type === 'fillin' ? q.answer : q.options[q.answer];
    box.innerHTML = `⏰ Time's up! The answer is: <strong>${answer}</strong><br><small>${q.explanation}</small>`;
  } else {
    // Rounds 1, 2, 4: don't reveal the answer
    box.innerHTML = `⏰ Time's up! Wait for Commander Atlas to reveal the answer...`;
  }
}

// ─── Timer ───
function startTimer() {
  timeLeft = TOTAL_TIME;
  answered = false;
  updateTimerDisplay();

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function handleTimeout() {
  if (answered) return;
  answered = true;
  stopTimer();
  streak = 0;

  // For R3, use the local r3Questions array; otherwise use QUESTIONS
  const q = currentRound === 3 ? r3Questions[r3LocalQuestionIndex] : QUESTIONS[currentQ];
  if (!q) return;
  const isRound3 = q.round === 3;

  if (q.type === 'mcq') {
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
      btn.classList.add('disabled');
      if (i === q.answer && isRound3) btn.classList.add('correct');
    });
  } else {
    const blank = document.getElementById('fi-blank');
    if (isRound3) {
      blank.textContent = q.answer;
      blank.style.borderColor = '#ffd54f';
      blank.style.color = '#ffd54f';
    } else {
      blank.textContent = '???';
      blank.style.borderColor = '#ffd54f';
      blank.style.color = '#ffd54f';
    }
    document.getElementById('fi-input').disabled = true;
    document.getElementById('fi-submit').disabled = true;
  }

  showTimeoutFeedback(isRound3);
  saveAnswer(q.id, false, TOTAL_TIME * 1000, '');
  updateStreakBadge();

  // ── Round 3: client-driven auto-advance on timeout (5s) ──
  if (isRound3) {
    if (r3AutoAdvanceTimer) clearTimeout(r3AutoAdvanceTimer);
    r3AutoAdvanceTimer = setTimeout(() => loadNextR3Question(), 5000);
  }
}

function updateTimerDisplay() {
  const fill = document.getElementById('timer-fill');
  const text = document.getElementById('timer-text');
  const wrap = document.getElementById('timer-wrap');
  const questionScreen = document.getElementById('screen-question');

  const offset = TIMER_CIRCUMFERENCE * (1 - timeLeft / TOTAL_TIME);
  fill.setAttribute('stroke-dashoffset', offset);
  text.textContent = timeLeft;

  // Color based on time
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  if (timeLeft <= 5) {
    fill.setAttribute('stroke', '#ff4444');
    text.style.color = '#ff4444';
    wrap.classList.add('timer-warning');
    if (questionScreen) questionScreen.classList.add('timer-critical');
  } else if (timeLeft <= 8) {
    fill.setAttribute('stroke', '#ff4444');
    text.style.color = '#ff4444';
    wrap.classList.add('timer-warning');
    if (questionScreen) questionScreen.classList.remove('timer-critical');
  } else {
    fill.setAttribute('stroke', accent);
    text.style.color = accent;
    wrap.classList.remove('timer-warning');
    if (questionScreen) questionScreen.classList.remove('timer-critical');
  }
}

// ─── Streak Badge ───
function updateStreakBadge() {
  const badge = document.getElementById('streak-badge');
  const qBody = document.getElementById('q-body');
  if (streak >= 5) {
    badge.textContent = '🔥🔥 ×2';
    badge.classList.add('streak-active');
    if (qBody) { qBody.classList.add('streak-glow', 'streak-mega'); }
  } else if (streak >= 3) {
    badge.textContent = '🔥 ×1.5';
    badge.classList.add('streak-active');
    if (qBody) { qBody.classList.add('streak-glow'); qBody.classList.remove('streak-mega'); }
  } else {
    badge.textContent = '';
    badge.classList.remove('streak-active');
    if (qBody) { qBody.classList.remove('streak-glow', 'streak-mega'); }
  }
}

// ─── Progress Dots ───
function buildProgressDots(currentIdx) {
  const container = document.getElementById('progress-dots');
  container.innerHTML = '';
  const total = QUESTIONS ? QUESTIONS.length : 25;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('span');
    dot.className = 'p-dot';
    if (i < currentIdx) dot.classList.add('done');
    if (i === currentIdx) dot.classList.add('current');
    container.appendChild(dot);
  }
}

// ─── Fun Fact ───
function showFunFact(round) {
  const r = ROUNDS[round];
  if (!r) return;

  const titleEl = document.getElementById('funfact-title');
  const bodyEl  = document.getElementById('funfact-text');

  if (r.funFactTitle) {
    titleEl.textContent = r.funFactTitle;
    titleEl.classList.remove('hidden');
  } else {
    titleEl.textContent = '';
    titleEl.classList.add('hidden');
  }
  bodyEl.textContent = r.funFactBody;

  showScreen('screen-funfact');
  stopMatrixRain();
  stopParticles();
}

// ─── Round 3 Winner Reveal (Daddy Image) ───
function showR3Reveal(winner) {
  stopTimer();
  stopMatrixRain();
  showScreen('screen-r3-reveal');

  const img = document.getElementById('r3-reveal-img');
  const title = document.getElementById('r3-reveal-title');
  const subtitle = document.getElementById('r3-reveal-subtitle');

  // Determine if player's team won or lost
  const myTeam = playerTeam; // 'pro', 'anti', or null

  let playerWon = false;
  if (winner === 'tie') {
    playerWon = true; // tie = both teams get "like"
  } else if (myTeam === winner) {
    playerWon = true;
  }

  if (winner === 'tie') {
    img.src = 'dady like.jpg';
    title.textContent = "IT'S A TIE!";
    title.style.color = '#d4a017';
    subtitle.textContent = 'Both teams fought equally hard!';
  } else if (playerWon) {
    img.src = 'dady like.jpg';
    title.textContent = '🏆 YOUR TEAM WINS!';
    title.style.color = '#4caf50';
    subtitle.textContent = winner === 'pro'
      ? '🌐 PRO GLOBALIZATION takes the debate!'
      : '🛡️ ANTI GLOBALIZATION takes the debate!';
  } else {
    img.src = 'dady phat.jpg';
    title.textContent = '😔 YOUR TEAM LOST...';
    title.style.color = '#f44336';
    subtitle.textContent = winner === 'pro'
      ? '🌐 PRO GLOBALIZATION wins the debate.'
      : '🛡️ ANTI GLOBALIZATION wins the debate.';
  }
  // Fallback when local image files are unavailable.
  img.onerror = () => {
    const isWinLike = winner === 'tie' || playerWon;
    const bg = isWinLike ? '#103015' : '#350f10';
    const fg = isWinLike ? '#4caf50' : '#f44336';
    const text = encodeURIComponent(isWinLike ? 'DADDY LIKE' : 'DADDY PHAT');
    img.src =
      `data:image/svg+xml;utf8,` +
      `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='550'>` +
      `<rect width='100%' height='100%' fill='${bg}'/>` +
      `<text x='50%' y='46%' dominant-baseline='middle' text-anchor='middle' fill='${fg}' font-size='86' font-family='Arial' font-weight='700'>${text}</text>` +
      `<text x='50%' y='62%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-size='34' font-family='Arial'>Round 3 Result</text>` +
      `</svg>`;
  };
}

// ─── Final Results ───
function showFinalResults() {
  stopTimer();
  stopMatrixRain();
  stopParticles();

  // Determine rank
  let rankTitle, rankIcon, rankMsg;
  if (score >= 9000) {
    rankTitle = 'GLOBAL DIRECTOR'; rankIcon = '👑';
    rankMsg = 'Outstanding, Agent. The world is safer with you.';
  } else if (score >= 6000) {
    rankTitle = 'ELITE AGENT'; rankIcon = '🥇';
    rankMsg = 'Excellent work. The Bureau is proud.';
  } else if (score >= 3000) {
    rankTitle = 'SENIOR AGENT'; rankIcon = '🥈';
    rankMsg = 'Good performance. Keep training.';
  } else {
    rankTitle = 'JUNIOR AGENT'; rankIcon = '🥉';
    rankMsg = 'Mission noted. Study harder, Agent.';
  }

  document.getElementById('final-icon').textContent = rankIcon;
  document.getElementById('final-rank').textContent = rankTitle;
  document.getElementById('final-correct').textContent = correctCount;
  document.getElementById('final-total').textContent = QUESTIONS ? QUESTIONS.length.toString() : '25';
  document.getElementById('final-streak').textContent = maxStreak;
  document.getElementById('final-message').textContent = rankMsg;

  // Animated score count-up
  const scoreEl = document.getElementById('final-score');
  const duration = 1200;
  const startTime = performance.now();
  function tickScore(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    scoreEl.textContent = Math.round(score * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tickScore);
    else scoreEl.textContent = score.toLocaleString();
  }
  requestAnimationFrame(tickScore);

  // Update Firebase
  db.ref('players/' + playerId).update({
    score: score,
    streak: maxStreak,
    rank: rankTitle
  });

  showScreen('screen-final');

  // Final celebration confetti
  fireFinalConfetti();

  // Fetch leaderboard from Firebase to show rank + mini LB
  db.ref('players').once('value', snap => {
    const players = snap.val() || {};
    const sorted = Object.entries(players)
      .map(([id, p]) => ({ id, name: p.name || '???', score: p.score || 0 }))
      .sort((a, b) => b.score - a.score);

    // Find my rank
    const myRank = sorted.findIndex(p => p.id === playerId) + 1;
    const totalPlayers = sorted.length;

    // Show placement
    const placementEl = document.getElementById('final-placement');
    if (placementEl && myRank > 0) {
      const suffix = myRank === 1 ? 'st' : myRank === 2 ? 'nd' : myRank === 3 ? 'rd' : 'th';
      const isTop3 = myRank <= 3;
      placementEl.innerHTML = `<div class="placement-badge ${isTop3 ? 'top-3' : ''}">
        <span class="place-num">#${myRank}</span>
        <span>${myRank}${suffix} out of ${totalPlayers} agents</span>
      </div>`;
    }

    // Mini leaderboard (top 5 + my row if not in top 5)
    const lbEl = document.getElementById('final-leaderboard');
    if (lbEl && sorted.length > 1) {
      let html = '<div class="final-lb-title">LEADERBOARD</div>';
      const showCount = Math.min(5, sorted.length);
      for (let i = 0; i < showCount; i++) {
        const p = sorted[i];
        const isMe = p.id === playerId;
        html += `<div class="final-lb-row ${isMe ? 'is-me' : ''}">
          <span class="final-lb-rank">${i + 1}</span>
          <span class="final-lb-name">${isMe ? '→ ' + p.name : p.name}</span>
          <span class="final-lb-score">${p.score.toLocaleString()}</span>
        </div>`;
      }
      // If I'm not in top 5, show my row with separator
      if (myRank > 5) {
        html += '<div style="text-align:center;color:var(--muted);font-size:11px;margin:4px 0">···</div>';
        const me = sorted[myRank - 1];
        html += `<div class="final-lb-row is-me">
          <span class="final-lb-rank">${myRank}</span>
          <span class="final-lb-name">→ ${me.name}</span>
          <span class="final-lb-score">${me.score.toLocaleString()}</span>
        </div>`;
      }
      lbEl.innerHTML = html;
    }
  });
}

// ─── Save Answer to Firebase ───
function saveAnswer(qId, correct, timeMs, value) {
  if (!playerId) return;
  db.ref('players/' + playerId + '/answers/' + qId).set({
    value: value,
    correct: correct,
    timeMs: Math.round(timeMs)
  });
  db.ref('players/' + playerId).update({
    score: score,
    streak: streak
  });
}

// ─── Team Selection (Round 3) ───
function showTeamSelection() {
  // Reset team score for new round
  teamScore = 0;
  r3FlowStarted = false;
  r3Finished = false;
  r3BonusApplied = false;
  r3LocalQuestionIndex = 0;
  r3Questions = [];
  sessionR3Questions = null;
  sessionR3Seed = null;
  // Start listening for team bonus
  startR3BonusListener();
  showScreen('screen-team-select');

  // Reset UI state
  document.getElementById('team-btn-pro').classList.remove('team-card-chosen');
  document.getElementById('team-btn-anti').classList.remove('team-card-chosen');
  document.getElementById('team-btn-pro').disabled = false;
  document.getElementById('team-btn-anti').disabled = false;
  document.getElementById('team-sel-waiting').classList.add('hidden');

  // If already chosen, restore state
  if (playerTeam) {
    showTeamChosen(playerTeam);
  }
}

function ensureQuestionScreenTemplate() {
  if (questionScreenTemplate) return;
  const screen = document.getElementById('screen-question');
  if (screen) {
    questionScreenTemplate = screen.innerHTML;
  }
}

function restoreQuestionScreenIfNeeded() {
  const screen = document.getElementById('screen-question');
  if (!screen || !questionScreenTemplate) return;
  if (!document.getElementById('q-header') || !document.getElementById('q-body')) {
    screen.innerHTML = questionScreenTemplate;
  }
}

function selectTeam(team) {
  playerTeam = team;
  teamScore = 0;

  // Save to Firebase
  db.ref('players/' + playerId).update({
    team: team,
    teamScore: 0
  });

  showTeamChosen(team);
}

function showTeamChosen(team) {
  document.getElementById('team-btn-pro').classList.remove('team-card-chosen');
  document.getElementById('team-btn-anti').classList.remove('team-card-chosen');
  document.getElementById('team-btn-pro').disabled = true;
  document.getElementById('team-btn-anti').disabled = true;

  if (team === 'pro') {
    document.getElementById('team-btn-pro').classList.add('team-card-chosen');
  } else {
    document.getElementById('team-btn-anti').classList.add('team-card-chosen');
  }

  document.getElementById('team-sel-status').innerHTML =
    team === 'pro'
      ? '<span style="color:#4caf50;font-size:16px;font-weight:600">🌐 You joined PRO GLOBALIZATION</span>'
      : '<span style="color:#f44336;font-size:16px;font-weight:600">🛡️ You joined ANTI GLOBALIZATION</span>';
  document.getElementById('team-sel-waiting').classList.remove('hidden');
}

// ─── Team Results (after Round 3) ───
function showTeamResults() {
  stopTimer();
  stopMatrixRain();
  showScreen('screen-team-results');

  db.ref('players').once('value', snap => {
    const players = snap.val() || {};
    let proScore = 0, antiScore = 0, proCount = 0, antiCount = 0;

    Object.values(players).forEach(p => {
      if (p.team === 'pro') {
        proScore += (p.teamScore || 0);
        proCount++;
      } else if (p.team === 'anti') {
        antiScore += (p.teamScore || 0);
        antiCount++;
      }
    });

    document.getElementById('tr-pro-score').textContent = proScore.toLocaleString();
    document.getElementById('tr-anti-score').textContent = antiScore.toLocaleString();
    document.getElementById('tr-pro-members').textContent = proCount + ' agents';
    document.getElementById('tr-anti-members').textContent = antiCount + ' agents';

    const total = proScore + antiScore || 1;
    const proPct = Math.round(proScore / total * 100);
    document.getElementById('tr-inf-pro').style.width = proPct + '%';
    document.getElementById('tr-inf-anti').style.width = (100 - proPct) + '%';

    let winnerText, winnerIcon;
    if (proScore > antiScore) {
      winnerText = '🌐 PRO GLOBALIZATION WINS!';
      winnerIcon = '🌐';
    } else if (antiScore > proScore) {
      winnerText = '🛡️ ANTI GLOBALIZATION WINS!';
      winnerIcon = '🛡️';
    } else {
      winnerText = "IT'S A TIE!";
      winnerIcon = '⚖️';
    }
    document.getElementById('tr-title').textContent = 'DEBATE CONCLUDED';
    document.getElementById('tr-subtitle').textContent = winnerText;
    document.getElementById('tr-winner-icon').textContent = winnerIcon;

    // Show player's team result
    const yourTeam = document.getElementById('tr-your-team');
    if (playerTeam) {
      const myTeamScore = playerTeam === 'pro' ? proScore : antiScore;
      const otherScore = playerTeam === 'pro' ? antiScore : proScore;
      const won = myTeamScore > otherScore;
      yourTeam.innerHTML = won
        ? '<div style="color:#4caf50;font-size:18px;font-weight:600;margin:16px 0">🏆 Your team WON! Congratulations!</div>'
        : myTeamScore === otherScore
          ? '<div style="color:#d4a017;font-size:18px;font-weight:600;margin:16px 0">⚖️ It\'s a tie!</div>'
          : '<div style="color:#f44336;font-size:18px;font-weight:600;margin:16px 0">Your team lost. Better luck next time!</div>';
    }
  });
}

// ─── Influence Bar (Round 3, real-time listener) ───
function startInfluenceBarListener() {
  if (r3InfluenceListener) return; // already listening
  r3InfluenceListener = db.ref('players').on('value', snap => {
    if (currentRound !== 3) return;
    const players = snap.val() || {};
    let proScore = 0, antiScore = 0;

    Object.values(players).forEach(p => {
      if (p.team === 'pro') proScore += (p.teamScore || 0);
      else if (p.team === 'anti') antiScore += (p.teamScore || 0);
    });

    const total = proScore + antiScore || 1;
    const proPct = Math.round(proScore / total * 100);
    const proEl = document.getElementById('inf-pro');
    const antiEl = document.getElementById('inf-anti');
    if (proEl) proEl.style.width = proPct + '%';
    if (antiEl) antiEl.style.width = (100 - proPct) + '%';

    // Update point counters in header
    const proPtsEl = document.getElementById('vs-pro-pts');
    const antiPtsEl = document.getElementById('vs-anti-pts');
    if (proPtsEl) proPtsEl.textContent = proScore.toLocaleString() + ' pts';
    if (antiPtsEl) antiPtsEl.textContent = antiScore.toLocaleString() + ' pts';
  });
}

function stopInfluenceBarListener() {
  if (r3InfluenceListener) {
    db.ref('players').off('value', r3InfluenceListener);
    r3InfluenceListener = null;
  }
}

// Legacy wrapper for backward compatibility
function updateInfluenceBar() {
  startInfluenceBarListener();
}

// ─── Confetti Effects ───
function fireCorrectConfetti(currentStreak) {
  if (typeof confetti !== 'function') return;
  if (currentStreak >= 5) {
    // Big streak confetti (×2 multiplier) — double burst
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.7 }, colors: ['#ff6600', '#ffcc00', '#ff3300'] });
    setTimeout(() => {
      confetti({ particleCount: 60, spread: 120, origin: { y: 0.5 }, colors: ['#ff6600', '#ffcc00'] });
    }, 200);
  } else if (currentStreak >= 3) {
    // Medium streak confetti (×1.5 multiplier)
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ['#ffd700', '#ffaa00', '#ff8800'] });
  } else {
    // Normal correct — small burst
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#4caf50', '#81c784', '#a5d6a7'], gravity: 1.2 });
  }
}

function fireFinalConfetti() {
  if (typeof confetti !== 'function') return;
  // Multi-burst celebration
  const end = Date.now() + 2500;
  const colors = ['#ffd700', '#ff6600', '#4caf50', '#cc0000', '#00ff88'];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// ─── Keyboard Navigation for MCQ ───
document.addEventListener('keydown', (e) => {
  if (answered || !currentMCQQuestion) return;
  // Only respond when question screen is active
  const qScreen = document.getElementById('screen-question');
  if (!qScreen || !qScreen.classList.contains('active')) return;
  // Don't intercept if user is typing in fill-in input
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

  const keyMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
  const idx = keyMap[e.key.toLowerCase()];
  if (idx !== undefined && idx < currentMCQQuestion.options.length) {
    selectMCQ(idx, currentMCQQuestion);
  }
});

// ─── Animated Score Update ───
function animateScoreUpdate(earned, isCorrect) {
  const el = document.getElementById('score-display');
  if (!el) return;

  const oldScore = score - (isCorrect ? earned : 0);
  const targetScore = score;

  // Floating points popup
  if (isCorrect && earned > 0) {
    showPointsPopup(earned, streak >= 3);
  }

  // Count-up animation
  if (isCorrect && earned > 0) {
    const duration = 400;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(oldScore + (targetScore - oldScore) * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = targetScore.toLocaleString();
        // Bump effect
        el.classList.remove('score-bump');
        void el.offsetWidth; // force reflow
        el.classList.add('score-bump');
      }
    }
    requestAnimationFrame(tick);
  } else {
    el.textContent = targetScore.toLocaleString();
  }
}

// ─── Floating Points Popup ───
function showPointsPopup(pts, isBonus) {
  const scoreEl = document.getElementById('score-display');
  if (!scoreEl) return;

  const rect = scoreEl.getBoundingClientRect();
  const popup = document.createElement('div');
  popup.className = 'points-popup' + (isBonus ? ' bonus' : '');
  popup.textContent = '+' + pts;
  popup.style.left = rect.left + 'px';
  popup.style.top = (rect.top - 10) + 'px';
  document.body.appendChild(popup);

  // Auto-remove after animation
  setTimeout(() => popup.remove(), 1300);
}

// ─── Background Particles ───
let particlesContainer = null;
let particlesActive = false;

const ROUND_PARTICLES = {
  1: { colors: ['#cc0000', '#ff3333', '#ff6666'], count: 12, sizeRange: [3, 8] },
  2: { colors: ['#00ff88', '#00cc66', '#33ffaa'], count: 15, sizeRange: [2, 6] },
  3: { colors: ['#d4a017', '#8b6914', '#f5d060'], count: 10, sizeRange: [3, 7] },
  4: { colors: ['#e491b0', '#c77dba', '#f0b0c8'], count: 10, sizeRange: [3, 7] }
};

function startParticles(round) {
  stopParticles();
  const config = ROUND_PARTICLES[round];
  if (!config) return;

  particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles-container';
  document.body.appendChild(particlesContainer);
  particlesActive = true;

  for (let i = 0; i < config.count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 12;
    const delay = Math.random() * duration;

    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      background: ${color};
      left: ${left}%;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
    `;
    particlesContainer.appendChild(p);
  }
}

function stopParticles() {
  if (particlesContainer) {
    particlesContainer.remove();
    particlesContainer = null;
  }
  particlesActive = false;
}

// Hook particles into round changes
const _originalShowRoundIntro = showRoundIntro;
showRoundIntro = function(round, callback) {
  startParticles(round);
  _originalShowRoundIntro(round, callback);
};
