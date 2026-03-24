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

const TOTAL_TIME = 20;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 22; // ~138.23

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
  const totalLen = STORY_TEXT.length;
  let i = 0;

  function type() {
    if (i >= totalLen) {
      cursor.style.display = 'none';
      btnBegin.classList.add('visible');
      // Fill remaining progress dots
      for (let d = 0; d < 5; d++) {
        document.getElementById('sp-' + d).classList.add('filled');
      }
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

// ─── Name Input & Firebase Join ───
function confirmName() {
  const input = document.getElementById('player-name-input');
  const name = input.value.trim();
  if (!name) { input.focus(); return; }

  playerName = name;
  playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

  console.log('[PLAYER] Joining as:', playerName, 'ID:', playerId);

  // Write to Firebase
  db.ref('players/' + playerId).set({
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

  if (qIdx !== currentQ) {
    currentQ = qIdx;
    currentRound = round;
    answered = false;
    hintUsed = false;

    // Check if need to show round intro
    const q = QUESTIONS[qIdx];
    const qInRound = qIdx - (round - 1) * 5; // 0-4 within round

    if (qInRound === 0) {
      showRoundIntro(round, () => loadQuestion(qIdx));
    } else {
      loadQuestion(qIdx);
    }
  }

  if (session.showAnswer && !answered) {
    // Time's up from host
    handleTimeout();
  }
}

// ─── Round Intro ───
function showRoundIntro(round, callback) {
  const r = ROUNDS[round];
  document.getElementById('ri-icon').textContent = r.icon;
  document.getElementById('ri-badge').textContent = 'ROUND ' + round;
  document.getElementById('ri-name').textContent = r.name;
  document.getElementById('ri-sub').textContent = r.subtitle;

  // Apply round accent color to badge
  const colors = { 1: '#cc0000', 2: '#00ff88', 3: '#d4a017', 4: '#e491b0' };
  document.getElementById('ri-badge').style.background = colors[round] || '#cc0000';

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
  const q = QUESTIONS[qIdx];
  const round = q.round;
  const qInRound = qIdx - (round - 1) * 5;
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

  if (round === 3) {
    tag.textContent = 'MOTION BEFORE THE COURT';
  } else if (round === 2) {
    tag.textContent = '// Q' + (qIdx + 1) + ' OF 20 · ' + q.topic.toUpperCase();
  } else {
    tag.textContent = 'ROUND ' + round + ' · Q' + (qInRound + 1) + ' OF 5 · ' + q.topic.toUpperCase();
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
  const qInRound = qIdx - (round - 1) * 5;

  if (round === 1) {
    header.innerHTML = `
      <div class="q-topbar">
        <span class="badge-breaking">● BREAKING NEWS</span>
        <span>GNN · GLOBAL NEWS NETWORK</span>
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
        <span>Q${qIdx + 1} / 20</span>
      </div>
      <div class="stock-tickers">
        <div class="stock-tick"><div class="tick-name">IMPORT</div><div class="tick-value tick-up" id="tick-import">▲ 2.4%</div></div>
        <div class="stock-tick"><div class="tick-name">UNEMPLOY</div><div class="tick-value tick-down" id="tick-unemploy">▼ 0.8%</div></div>
        <div class="stock-tick"><div class="tick-name">GDP</div><div class="tick-value tick-up" id="tick-gdp">▲ 1.1%</div></div>
        <div class="stock-tick"><div class="tick-name">EXPORT</div><div class="tick-value tick-up" id="tick-export">▲ 3.2%</div></div>
      </div>`;
    startStockTickers();
  } else if (round === 3) {
    header.innerHTML = `
      <div class="q-topbar">
        <span>⚖️</span>
        <span>GLOBALIZATION DEBATE ARENA</span>
        <span>🏛️</span>
      </div>
      <div class="versus-bar">
        <div class="vs-side vs-pro">🌐 PRO GLOBALIZATION</div>
        <div class="vs-middle">VS</div>
        <div class="vs-side vs-anti">ANTI GLOBALIZATION 🛡️</div>
      </div>
      <div class="influence-bar-wrap">
        <div class="influence-bar-label">— INFLUENCE BAR —</div>
        <div class="influence-bar">
          <div class="inf-pro" id="inf-pro" style="width:50%"></div>
          <div class="inf-anti" id="inf-anti" style="width:50%"></div>
        </div>
      </div>`;
  } else if (round === 4) {
    const stage = CULTURE_STAGES[q.stage] || CULTURE_STAGES.honeymoon;
    const stages = ['honeymoon', 'frustration', 'depression', 'acceptance'];
    header.innerHTML = `
      <div class="culture-tabs">
        ${stages.map(s => {
          const st = CULTURE_STAGES[s];
          const isActive = s === q.stage;
          return `<div class="c-tab ${isActive ? 'active' : ''}" style="${isActive ? 'color:' + st.accent : ''}">
            <span>${st.emoji}</span> ${st.name}
            ${isActive ? `<div style="position:absolute;bottom:0;left:20%;width:60%;height:2px;background:${st.accent};border-radius:1px"></div>` : ''}
          </div>`;
        }).join('')}
      </div>
      <div class="stage-banner">
        <div class="stage-emoji">${stage.emoji}</div>
        <div class="stage-name" style="color:${stage.accent}">${stage.name} Stage</div>
        <div class="stage-desc">${stage.desc}</div>
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
      const delta = (Math.random() * 0.4 - 0.2).toFixed(1);
      const base = parseFloat(el.textContent.replace(/[▲▼ %]/g, ''));
      const newVal = (base + parseFloat(delta)).toFixed(1);
      const isUp = newVal >= 0;
      el.textContent = (isUp ? '▲ ' : '▼ ') + Math.abs(newVal) + '%';
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

  // Style buttons
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === q.answer) btn.classList.add('correct');
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
  } else {
    streak = 0;
  }

  // Show feedback
  showFeedback(isCorrect, earned, q.explanation);

  // Update Firebase
  saveAnswer(q.id, isCorrect, elapsed * 1000, q.options ? q.options[idx] : '');

  stopTimer();
  updateStreakBadge();
  document.getElementById('score-display').textContent = score.toLocaleString();
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
    const earned = Math.round(baseScore * multiplier * bonusMultiplier);
    score += earned;

    showFeedback(true, earned, q.explanation);
  } else {
    blank.textContent = q.answer;
    blank.style.borderColor = '#ef5350';
    blank.style.color = '#ef5350';
    input.parentElement.classList.add('shake');
    streak = 0;

    showFeedback(false, 0, q.explanation, q.answer);
  }

  saveAnswer(q.id, isCorrect, elapsed * 1000, val);
  stopTimer();
  updateStreakBadge();
  document.getElementById('score-display').textContent = score.toLocaleString();
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

function showTimeoutFeedback() {
  const q = QUESTIONS[currentQ];
  const box = document.getElementById('feedback-box');
  box.classList.remove('hidden', 'correct', 'wrong', 'timeout');
  box.classList.add('timeout');

  const answer = q.type === 'fillin' ? q.answer : q.options[q.answer];
  box.innerHTML = `⏰ Time's up! The answer is: <strong>${answer}</strong><br><small>${q.explanation}</small>`;
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

  const q = QUESTIONS[currentQ];
  if (q.type === 'mcq') {
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
      btn.classList.add('disabled');
      if (i === q.answer) btn.classList.add('correct');
    });
  } else {
    const blank = document.getElementById('fi-blank');
    blank.textContent = q.answer;
    blank.style.borderColor = '#ffd54f';
    blank.style.color = '#ffd54f';
    document.getElementById('fi-input').disabled = true;
    document.getElementById('fi-submit').disabled = true;
  }

  showTimeoutFeedback();
  saveAnswer(q.id, false, TOTAL_TIME * 1000, '');
  updateStreakBadge();
}

function updateTimerDisplay() {
  const fill = document.getElementById('timer-fill');
  const text = document.getElementById('timer-text');
  const wrap = document.getElementById('timer-wrap');

  const offset = TIMER_CIRCUMFERENCE * (1 - timeLeft / TOTAL_TIME);
  fill.setAttribute('stroke-dashoffset', offset);
  text.textContent = timeLeft;

  // Color based on time
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  if (timeLeft <= 8) {
    fill.setAttribute('stroke', '#ff4444');
    text.style.color = '#ff4444';
    wrap.classList.add('timer-warning');
  } else {
    fill.setAttribute('stroke', accent);
    text.style.color = accent;
    wrap.classList.remove('timer-warning');
  }
}

// ─── Streak Badge ───
function updateStreakBadge() {
  const badge = document.getElementById('streak-badge');
  if (streak >= 5) {
    badge.textContent = '🔥🔥 ×2';
  } else if (streak >= 3) {
    badge.textContent = '🔥 ×1.5';
  } else {
    badge.textContent = '';
  }
}

// ─── Progress Dots ───
function buildProgressDots(currentIdx) {
  const container = document.getElementById('progress-dots');
  container.innerHTML = '';
  for (let i = 0; i < 20; i++) {
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
  document.getElementById('funfact-text').textContent = r.funFact;
  showScreen('screen-funfact');
  stopMatrixRain();
}

// ─── Final Results ───
function showFinalResults() {
  stopTimer();
  stopMatrixRain();

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
  document.getElementById('final-score').textContent = score.toLocaleString();
  document.getElementById('final-correct').textContent = correctCount;
  document.getElementById('final-total').textContent = '20';
  document.getElementById('final-streak').textContent = maxStreak;
  document.getElementById('final-message').textContent = rankMsg;

  // Update Firebase
  db.ref('players/' + playerId).update({
    score: score,
    streak: maxStreak,
    rank: rankTitle
  });

  showScreen('screen-final');
}

// ─── Save Answer to Firebase ───
function saveAnswer(qId, correct, timeMs, value) {
  if (!playerId) return;
  db.ref('players/' + playerId + '/answers/q' + qId).set({
    value: value,
    correct: correct,
    timeMs: Math.round(timeMs)
  });
  db.ref('players/' + playerId).update({
    score: score,
    streak: streak
  });
}

// ─── Influence Bar (Round 3, updates from Firebase) ───
function updateInfluenceBar() {
  db.ref('players').once('value', snap => {
    const players = snap.val() || {};
    let proCorrect = 0, totalAnswered = 0;

    // Count correct answers for current round 3 questions
    Object.values(players).forEach(p => {
      if (!p.answers) return;
      for (let qi = 10; qi <= 14; qi++) {
        const a = p.answers['q' + qi];
        if (a) {
          totalAnswered++;
          if (a.correct) proCorrect++;
        }
      }
    });

    if (totalAnswered > 0) {
      const proPct = Math.round((proCorrect / totalAnswered) * 100);
      const proEl = document.getElementById('inf-pro');
      const antiEl = document.getElementById('inf-anti');
      if (proEl) proEl.style.width = proPct + '%';
      if (antiEl) antiEl.style.width = (100 - proPct) + '%';
    }
  });
}

// Update influence bar periodically during round 3
setInterval(() => {
  if (currentRound === 3) updateInfluenceBar();
}, 3000);
