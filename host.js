/* ═══════════════════════════════════════════════════════════
   GLOBAL AGENT MISSION — Host Control Logic
   ═══════════════════════════════════════════════════════════ */

let hostCurrentQ = 0;       // index into session QUESTIONS array
let hostCurrentRound = 1;
let hostAnswerRevealed = false;
let round3QuestionCount = 0; // 0-9 within Round 3
let sessionRef = db.ref('session');
let playersRef = db.ref('players');

// Round 3 battle update interval
let r3BattleInterval = null;

// ─── Initialize Session ───────────────────────────────────
function initSession() {
  playersRef.remove().catch(err => console.error('[HOST] Error clearing players:', err));

  sessionRef.set({
    status: 'waiting',
    currentQuestion: 0,
    currentRound: 1,
    timerStart: 0,
    showAnswer: false,
    round3Questions: null
  }).catch(err => {
    console.error('[HOST] Error initializing session:', err);
    alert('Firebase connection failed! Check your database URL and rules.');
  });

  updateHostStatus('waiting');

  // Listen for players joining
  playersRef.on('value', snap => {
    const players = snap.val() || {};
    const count = Object.keys(players).length;
    document.getElementById('player-count').textContent = count;

    const grid = document.getElementById('host-player-grid');
    grid.innerHTML = '';
    Object.values(players).forEach(p => {
      const chip = document.createElement('span');
      chip.className = 'hp-chip';
      chip.textContent = p.name;
      grid.appendChild(chip);
    });

    // Update leaderboard if game panel visible
    if (!document.getElementById('host-game').classList.contains('hidden')) {
      updateLeaderboard(players);
    }
    // Update Round 4 leaderboard (round4Score)
    if (hostCurrentRound === 4) {
      updateRound4Leaderboard(players);
    }
  }, err => console.error('[HOST] Error listening to players:', err));
}

// ─── Update Status Indicator ─────────────────────────────
function updateHostStatus(status) {
  const dot = document.getElementById('host-status-dot');
  const text = document.getElementById('host-status-text');
  dot.className = 'status-dot ' + status;
  const labels = {
    waiting: 'WAITING FOR PLAYERS',
    playing: 'GAME IN PROGRESS',
    between_rounds: 'BETWEEN ROUNDS',
    team_selection: 'TEAM SELECTION',
    team_results: 'TEAM RESULTS',
    ended: 'GAME ENDED'
  };
  text.textContent = labels[status] || status.toUpperCase();
}

// ─── Start Game ──────────────────────────────────────────
function hostStartGame() {
  hostCurrentQ = 0;
  hostCurrentRound = 1;
  hostAnswerRevealed = false;

  // Pick 10 random Round 3 questions and save to Firebase
  const r3Selected = getRandomRound3Questions();
  // Rebuild global QUESTIONS for host (needed for loadHostQuestion)
  QUESTIONS = buildSessionQuestions(r3Selected);

  // Save round3 question IDs to Firebase so players sync
  const r3Ids = r3Selected.map(q => q.id);

  sessionRef.update({
    status: 'playing',
    currentQuestion: 0,
    currentRound: 1,
    timerStart: firebase.database.ServerValue.TIMESTAMP,
    showAnswer: false,
    round3Questions: r3Ids
  });

  updateHostStatus('playing');
  document.getElementById('host-lobby').classList.add('hidden');
  document.getElementById('host-game').classList.remove('hidden');

  loadHostQuestion(0);
}

// ─── Load Question on Host ───────────────────────────────
function loadHostQuestion(qIdx) {
  const q = QUESTIONS[qIdx];
  if (!q) return;

  hostAnswerRevealed = false;
  const round = q.round;
  hostCurrentRound = round;

  // Calculate question number within round
  const qInRound = getQInRound(qIdx, round);
  const totalInRound = round === 3 ? 10 : 5;

  // Update meta
  document.getElementById('host-q-meta').textContent =
    `Round ${round} · ${ROUNDS[round].name} · Q${qInRound + 1} of ${totalInRound} · ${q.topic}`;
  document.getElementById('host-q-text').textContent = q.question;

  // Render question body WITHOUT revealing answer
  renderHostQuestion(q);

  // Update stats
  updateAnswerStats(qIdx);

  // Enable buttons
  document.getElementById('host-next-btn').disabled = false;
  document.getElementById('host-reveal-btn').disabled = false;

  // Round 4: show badge on leaderboard
  const badge = document.getElementById('host-lb-badge');
  if (round === 4) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ─── Render question (MCQ or Fill-in) without answer ─────
function renderHostQuestion(q) {
  const container = document.getElementById('host-q-display');
  container.innerHTML = '';

  if (q.type === 'mcq') {
    const grid = document.createElement('div');
    grid.className = 'host-mcq-grid';
    // Support variable option counts (2, 3, or 4)
    const optCount = q.options.length;
    if (optCount <= 2) {
      grid.style.gridTemplateColumns = '1fr 1fr';
    } else if (optCount === 3) {
      grid.style.gridTemplateColumns = '1fr 1fr 1fr';
    }
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, i) => {
      const btn = document.createElement('div');
      btn.className = 'host-opt-btn';
      btn.id = 'host-opt-' + i;
      btn.innerHTML = `<span class="opt-letter">${letters[i]}</span><span>${opt}</span>`;
      grid.appendChild(btn);
    });
    container.appendChild(grid);
  } else {
    // Fill-in
    const wrap = document.createElement('div');
    wrap.className = 'host-fillin-display';
    wrap.innerHTML = `${q.blankBefore} <span class="host-fi-blank" id="host-fi-blank">___________</span> ${q.blankAfter}`;
    container.appendChild(wrap);
  }
}

// ─── Reveal Answer (called by button) ────────────────────
function hostRevealAnswer() {
  if (hostAnswerRevealed) return;
  hostAnswerRevealed = true;

  const q = QUESTIONS[hostCurrentQ];
  if (!q) return;

  // Update Firebase so players also see answer
  sessionRef.update({ showAnswer: true });
  document.getElementById('host-reveal-btn').disabled = true;
  if (document.getElementById('r3-reveal-btn')) {
    document.getElementById('r3-reveal-btn').disabled = true;
  }

  // Visually highlight correct answer on host screen
  if (q.type === 'mcq') {
    const correctBtn = document.getElementById('host-opt-' + q.answer);
    if (correctBtn) correctBtn.classList.add('revealed-correct');
  } else {
    const blank = document.getElementById('host-fi-blank');
    if (blank) {
      blank.textContent = q.answer;
      blank.classList.add('revealed');
    }
  }
}

// ─── Calculate question index within a round ─────────────
function getQInRound(qIdx, round) {
  // R1: 0-4, R2: 5-9, R3: 10-19, R4: 20-24
  if (round === 1) return qIdx;
  if (round === 2) return qIdx - 5;
  if (round === 3) return qIdx - 10;
  if (round === 4) return qIdx - 20;
  return qIdx;
}

// ─── Update Answer Stats ─────────────────────────────────
function updateAnswerStats(qIdx) {
  const q = QUESTIONS[qIdx];
  if (!q) return;

  playersRef.once('value', snap => {
    const players = snap.val() || {};
    let totalAnswered = 0, correctCount = 0, totalTime = 0;

    Object.values(players).forEach(p => {
      if (!p.answers) return;
      const a = p.answers[q.id];
      if (a) {
        totalAnswered++;
        if (a.correct) correctCount++;
        totalTime += a.timeMs;
      }
    });

    const statsEl = document.getElementById('host-q-stats');
    if (totalAnswered > 0) {
      const pct = Math.round((correctCount / totalAnswered) * 100);
      const avgTime = (totalTime / totalAnswered / 1000).toFixed(1);
      const statsText = `${totalAnswered} answered · ${pct}% correct · Avg ${avgTime}s`;
      if (statsEl) statsEl.innerHTML = statsText;

      // Also update Round 3 battle stats
      const r3Stats = document.getElementById('r3-answer-stats');
      if (r3Stats && hostCurrentRound === 3) r3Stats.innerHTML = statsText;
    } else {
      if (statsEl) statsEl.innerHTML = 'Waiting for answers...';
    }
  });
}

// Refresh stats every 2s
setInterval(() => {
  if (hostCurrentQ >= 0 && QUESTIONS[hostCurrentQ]) {
    updateAnswerStats(hostCurrentQ);
  }
}, 2000);

// ─── Next Question ───────────────────────────────────────
function hostNextQuestion() {
  hostCurrentQ++;
  hostAnswerRevealed = false;

  const totalQ = QUESTIONS.length; // 25 total
  if (hostCurrentQ >= totalQ) {
    endGame();
    return;
  }

  const q = QUESTIONS[hostCurrentQ];
  const newRound = q.round;
  const prevRound = hostCurrentRound;

  if (newRound !== prevRound) {
    // Round transition
    if (prevRound === 3) {
      showHostTeamResults();
      return;
    }
    showHostFunFact(prevRound);
    return;
  }

  // Same round — update Firebase & load
  sessionRef.update({
    currentQuestion: hostCurrentQ,
    currentRound: newRound,
    timerStart: firebase.database.ServerValue.TIMESTAMP,
    showAnswer: false
  });

  if (newRound === 3) {
    // Update question counter for battle view
    round3QuestionCount++;
    const counter = document.getElementById('r3-q-counter');
    if (counter) counter.textContent = `Question ${round3QuestionCount} / 10`;
    // Reset reveal btn
    const r3Rev = document.getElementById('r3-reveal-btn');
    if (r3Rev) r3Rev.disabled = false;
  } else {
    loadHostQuestion(hostCurrentQ);
  }
}

// ─── Fun Fact Screen ─────────────────────────────────────
function showHostFunFact(round) {
  sessionRef.update({ status: 'between_rounds' });
  updateHostStatus('between_rounds');

  // Hide all panels
  document.getElementById('host-game').classList.add('hidden');
  document.getElementById('host-round3-battle').classList.add('hidden');
  document.getElementById('host-funfact').classList.remove('hidden');
  document.getElementById('host-funfact-text').textContent = ROUNDS[round].funFact;
}

// ─── Continue to Next Round ──────────────────────────────
function hostNextRound() {
  document.getElementById('host-funfact').classList.add('hidden');

  const q = QUESTIONS[hostCurrentQ];
  const nextRound = q.round;

  if (nextRound === 3) {
    // Show team selection
    document.getElementById('host-team-selection').classList.remove('hidden');
    sessionRef.update({ status: 'team_selection' });
    updateHostStatus('team_selection');
    startHostTeamListener();
    return;
  }

  // Normal round (R4 after R3 results → fun fact → here)
  document.getElementById('host-game').classList.remove('hidden');
  hostCurrentRound = nextRound;

  sessionRef.update({
    status: 'playing',
    currentQuestion: hostCurrentQ,
    currentRound: hostCurrentRound,
    timerStart: firebase.database.ServerValue.TIMESTAMP,
    showAnswer: false
  });

  updateHostStatus('playing');
  loadHostQuestion(hostCurrentQ);
}

// ─── Team Listener (counts in selection screen) ──────────
let teamListenerActive = false;
function startHostTeamListener() {
  if (teamListenerActive) return;
  teamListenerActive = true;
  playersRef.on('value', snap => {
    const players = snap.val() || {};
    let proCount = 0, antiCount = 0;
    Object.values(players).forEach(p => {
      if (p.team === 'pro') proCount++;
      else if (p.team === 'anti') antiCount++;
    });
    const proEl = document.getElementById('host-pro-count');
    const antiEl = document.getElementById('host-anti-count');
    if (proEl) proEl.textContent = proCount;
    if (antiEl) antiEl.textContent = antiCount;
  });
}

// ─── Start Round 3 (show battle view) ────────────────────
function hostStartRound3() {
  teamListenerActive = false;
  document.getElementById('host-team-selection').classList.add('hidden');

  // Show battle view instead of normal game panel
  document.getElementById('host-round3-battle').classList.remove('hidden');

  hostCurrentRound = 3;
  round3QuestionCount = 1;
  const counter = document.getElementById('r3-q-counter');
  if (counter) counter.textContent = `Question 1 / 10`;

  sessionRef.update({
    status: 'playing',
    currentQuestion: hostCurrentQ,
    currentRound: 3,
    timerStart: firebase.database.ServerValue.TIMESTAMP,
    showAnswer: false
  });

  updateHostStatus('playing');

  // Start live battle updates
  startR3BattleUpdates();
}

// ─── Round 3 Battle View — Live Updates ─────────────────
function startR3BattleUpdates() {
  updateR3Battle(); // immediate first update
  if (r3BattleInterval) clearInterval(r3BattleInterval);
  r3BattleInterval = setInterval(updateR3Battle, 3000);
}

function stopR3BattleUpdates() {
  if (r3BattleInterval) {
    clearInterval(r3BattleInterval);
    r3BattleInterval = null;
  }
}

function updateR3Battle() {
  playersRef.once('value', snap => {
    const players = snap.val() || {};

    let proScore = 0, antiScore = 0;
    const proPlayers = [], antiPlayers = [];

    Object.values(players).forEach(p => {
      if (p.team === 'pro') {
        proScore += (p.teamScore || 0);
        proPlayers.push({ name: p.name, score: p.teamScore || 0 });
      } else if (p.team === 'anti') {
        antiScore += (p.teamScore || 0);
        antiPlayers.push({ name: p.name, score: p.teamScore || 0 });
      }
    });

    // Sort highest → lowest
    proPlayers.sort((a, b) => b.score - a.score);
    antiPlayers.sort((a, b) => b.score - a.score);

    // Update scores
    document.getElementById('r3-pro-score').textContent = proScore.toLocaleString();
    document.getElementById('r3-anti-score').textContent = antiScore.toLocaleString();

    // Update influence bar
    const total = proScore + antiScore || 1;
    const proPct = Math.round(proScore / total * 100);
    const antiPct = 100 - proPct;
    document.getElementById('r3-inf-pro').style.width = proPct + '%';
    document.getElementById('r3-inf-anti').style.width = antiPct + '%';
    document.getElementById('r3-pro-pct').textContent = proPct + '%';
    document.getElementById('r3-anti-pct').textContent = antiPct + '%';

    // Update member counts
    document.getElementById('r3-pro-count').textContent = proPlayers.length;
    document.getElementById('r3-anti-count').textContent = antiPlayers.length;

    // Render PRO member list
    const proCol = document.getElementById('r3-pro-members');
    const proHeader = proCol.querySelector('.r3-col-header'); // keep header
    // Remove existing rows
    proCol.querySelectorAll('.r3-member-row').forEach(r => r.remove());
    proPlayers.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'r3-member-row pro-row';
      row.innerHTML = `
        <span class="r3-member-rank">${i + 1}</span>
        <span class="r3-member-name">${p.name}</span>
        <span class="r3-member-score">${p.score.toLocaleString()}</span>`;
      proCol.appendChild(row);
    });

    // Render ANTI member list
    const antiCol = document.getElementById('r3-anti-members');
    antiCol.querySelectorAll('.r3-member-row').forEach(r => r.remove());
    antiPlayers.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'r3-member-row anti-row';
      row.innerHTML = `
        <span class="r3-member-score">${p.score.toLocaleString()}</span>
        <span class="r3-member-name">${p.name}</span>
        <span class="r3-member-rank">${i + 1}</span>`;
      antiCol.appendChild(row);
    });
  });
}

// ─── Show Team Results (after Round 3) ───────────────────
function showHostTeamResults() {
  stopR3BattleUpdates();
  sessionRef.update({ status: 'team_results' });
  updateHostStatus('team_results');

  document.getElementById('host-round3-battle').classList.add('hidden');
  document.getElementById('host-game').classList.add('hidden');
  document.getElementById('host-team-results').classList.remove('hidden');

  playersRef.once('value', snap => {
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

    document.getElementById('host-tr-pro-score').textContent = proScore.toLocaleString();
    document.getElementById('host-tr-anti-score').textContent = antiScore.toLocaleString();
    document.getElementById('host-tr-pro-members').textContent = proCount + ' agents';
    document.getElementById('host-tr-anti-members').textContent = antiCount + ' agents';

    const total = proScore + antiScore || 1;
    document.getElementById('host-tr-inf-pro').style.width = Math.round(proScore / total * 100) + '%';
    document.getElementById('host-tr-inf-anti').style.width = Math.round(antiScore / total * 100) + '%';

    if (proScore > antiScore) {
      document.getElementById('host-tr-subtitle').textContent = '🌐 PRO GLOBALIZATION WINS!';
    } else if (antiScore > proScore) {
      document.getElementById('host-tr-subtitle').textContent = '🛡️ ANTI GLOBALIZATION WINS!';
    } else {
      document.getElementById('host-tr-subtitle').textContent = "IT'S A TIE!";
    }
  });
}

// ─── Continue After Team Results → Round 4 ───────────────
function hostContinueAfterTeam() {
  document.getElementById('host-team-results').classList.add('hidden');
  showHostFunFact(3); // Show round 3 fun fact before round 4
}

// ─── Leaderboard (Round 1/2) ─────────────────────────────
function updateLeaderboard(players) {
  const list = document.getElementById('host-lb-list');
  if (!list) return;

  const sorted = Object.entries(players)
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  list.innerHTML = '';
  sorted.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="lb-rank">${i + 1}</span>
      <span class="lb-name">${p.name}</span>
      <span class="lb-score">${(p.score || 0).toLocaleString()}</span>`;
    list.appendChild(li);
  });
}

// ─── Round 4 Leaderboard (by round4Score) ────────────────
function updateRound4Leaderboard(players) {
  const list = document.getElementById('host-lb-list');
  if (!list) return;

  const sorted = Object.entries(players)
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (b.round4Score || 0) - (a.round4Score || 0));

  list.innerHTML = '';
  sorted.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="lb-rank">${i + 1}</span>
      <span class="lb-name">${p.name}</span>
      <span class="lb-score" style="color:#e491b0">${(p.round4Score || 0).toLocaleString()}</span>`;
    list.appendChild(li);
  });
}

// ─── End Game ─────────────────────────────────────────────
function endGame() {
  stopR3BattleUpdates();
  sessionRef.update({ status: 'ended' });
  updateHostStatus('ended');

  document.getElementById('host-game').classList.add('hidden');
  document.getElementById('host-round3-battle').classList.add('hidden');
  document.getElementById('host-funfact').classList.add('hidden');
  document.getElementById('host-final').classList.remove('hidden');

  playersRef.once('value', snap => {
    const players = snap.val() || {};
    const sorted = Object.entries(players)
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    buildPodium(sorted);
    buildFullRanking(sorted);
    buildClassStats(sorted);
  });
}

// ─── Podium ──────────────────────────────────────────────
function buildPodium(sorted) {
  const podium = document.getElementById('host-podium');
  const placements = [
    { idx: 1, cls: 'second', num: '🥈' },
    { idx: 0, cls: 'first', num: '🥇' },
    { idx: 2, cls: 'third', num: '🥉' }
  ];

  podium.innerHTML = '';
  placements.forEach(p => {
    const player = sorted[p.idx];
    if (!player) return;

    const div = document.createElement('div');
    div.className = 'podium-place ' + p.cls;
    div.innerHTML = `
      <div class="podium-num">${p.num}</div>
      <div class="podium-name">${player.name}</div>
      <div class="podium-score">${(player.score || 0).toLocaleString()} pts</div>`;
    podium.appendChild(div);
  });
}

// ─── Full Ranking Table ───────────────────────────────────
function buildFullRanking(sorted) {
  const container = document.getElementById('host-ranking');
  let html = `<table>
    <thead><tr><th>RANK</th><th>NAME</th><th>SCORE</th><th>RANK TITLE</th></tr></thead>
    <tbody>`;

  sorted.forEach((p, i) => {
    let rankTitle, rankIcon;
    const s = p.score || 0;
    if (s >= 9000) { rankTitle = 'Global Director'; rankIcon = '👑'; }
    else if (s >= 6000) { rankTitle = 'Elite Agent'; rankIcon = '🥇'; }
    else if (s >= 3000) { rankTitle = 'Senior Agent'; rankIcon = '🥈'; }
    else { rankTitle = 'Junior Agent'; rankIcon = '🥉'; }

    html += `<tr>
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td style="font-family:var(--mono);font-weight:700">${s.toLocaleString()}</td>
      <td>${rankIcon} ${rankTitle}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// ─── Class Statistics ─────────────────────────────────────
function buildClassStats(sorted) {
  const container = document.getElementById('host-class-stats');
  if (sorted.length === 0) { container.innerHTML = ''; return; }

  // Hardest question
  const allQIds = QUESTIONS.map(q => q.id);
  let hardestQId = allQIds[0], hardestPct = 100;
  allQIds.forEach(qid => {
    let total = 0, correct = 0;
    sorted.forEach(p => {
      if (p.answers && p.answers[qid]) {
        total++;
        if (p.answers[qid].correct) correct++;
      }
    });
    if (total > 0) {
      const pct = Math.round((correct / total) * 100);
      if (pct < hardestPct) { hardestPct = pct; hardestQId = qid; }
    }
  });
  const hardestQ = QUESTIONS.find(q => q.id === hardestQId);
  const hardestLabel = hardestQ ? hardestQ.topic : hardestQId;

  // Highest streak
  let topStreakName = '-', topStreak = 0;
  sorted.forEach(p => {
    if ((p.streak || 0) > topStreak) {
      topStreak = p.streak;
      topStreakName = p.name;
    }
  });

  // Fastest answer
  let fastestName = '-', fastestTime = Infinity;
  sorted.forEach(p => {
    if (!p.answers) return;
    Object.values(p.answers).forEach(a => {
      if (a.correct && a.timeMs < fastestTime) {
        fastestTime = a.timeMs;
        fastestName = p.name;
      }
    });
  });

  container.innerHTML = `
    <div><span class="cs-val">"${hardestLabel}" (${hardestPct}%)</span>Hardest Question</div>
    <div><span class="cs-val">${topStreakName} 🔥×${topStreak}</span>Highest Streak</div>
    <div><span class="cs-val">${fastestName} — ${fastestTime === Infinity ? '-' : (fastestTime / 1000).toFixed(1) + 's'}</span>Fastest Answer</div>`;
}

// ─── Init on Load ─────────────────────────────────────────
window.addEventListener('DOMContentLoaded', initSession);
