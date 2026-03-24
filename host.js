/* ═══════════════════════════════════════════════════════════
   GLOBAL AGENT MISSION — Host Control Logic
   ═══════════════════════════════════════════════════════════ */

let hostCurrentQ = 0;
let hostCurrentRound = 1;
let sessionRef = db.ref('session');
let playersRef = db.ref('players');

// ─── Initialize Session ───
function initSession() {
  // Clear old data and reset session
  playersRef.remove().then(() => {
    console.log('[HOST] Old players cleared');
  }).catch(err => {
    console.error('[HOST] Error clearing players:', err);
  });

  sessionRef.set({
    status: 'waiting',
    currentQuestion: 0,
    currentRound: 1,
    timerStart: 0,
    showAnswer: false
  }).then(() => {
    console.log('[HOST] Session initialized successfully');
  }).catch(err => {
    console.error('[HOST] Error initializing session:', err);
    alert('Firebase connection failed! Check your database URL and rules.');
  });

  // Update status indicator
  updateHostStatus('waiting');

  // Listen for players joining
  playersRef.on('value', snap => {
    const players = snap.val() || {};
    const count = Object.keys(players).length;
    document.getElementById('player-count').textContent = count;
    console.log('[HOST] Players update:', count, 'connected');

    const grid = document.getElementById('host-player-grid');
    grid.innerHTML = '';
    Object.values(players).forEach(p => {
      const chip = document.createElement('span');
      chip.className = 'hp-chip';
      chip.textContent = p.name;
      grid.appendChild(chip);
    });

    // Update leaderboard if game in progress
    updateLeaderboard(players);
  }, err => {
    console.error('[HOST] Error listening to players:', err);
  });
}

// ─── Update Status Indicator ───
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

// ─── Start Game ───
function hostStartGame() {
  hostCurrentQ = 0;
  hostCurrentRound = 1;

  sessionRef.update({
    status: 'playing',
    currentQuestion: 0,
    currentRound: 1,
    timerStart: firebase.database.ServerValue.TIMESTAMP,
    showAnswer: false
  });

  updateHostStatus('playing');
  document.getElementById('host-lobby').classList.add('hidden');
  document.getElementById('host-game').classList.remove('hidden');

  loadHostQuestion(0);
}

// ─── Load Question on Host ───
function loadHostQuestion(qIdx) {
  const q = QUESTIONS[qIdx];
  if (!q) return;

  const round = q.round;
  hostCurrentRound = round;
  const qInRound = qIdx - (round - 1) * 5;

  document.getElementById('host-q-meta').textContent =
    `Round ${round} · ${ROUNDS[round].name} · Q${qInRound + 1} of 5 · ${q.topic}`;

  document.getElementById('host-q-text').textContent = q.question;

  let answerText;
  if (q.type === 'fillin') {
    answerText = `Fill-in answer: "${q.answer}"`;
  } else {
    const letters = ['A', 'B', 'C', 'D'];
    answerText = `Correct: ${letters[q.answer]}) ${q.options[q.answer]}`;
  }
  document.getElementById('host-q-answer').textContent = answerText;

  // Show answer stats
  updateAnswerStats(qIdx);

  // Enable buttons
  document.getElementById('host-next-btn').disabled = false;
  document.getElementById('host-reveal-btn').disabled = false;
}

// ─── Update Answer Stats ───
function updateAnswerStats(qIdx) {
  playersRef.once('value', snap => {
    const players = snap.val() || {};
    let totalAnswered = 0, correctCount = 0, totalTime = 0;

    Object.values(players).forEach(p => {
      if (!p.answers) return;
      const a = p.answers['q' + qIdx];
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
      statsEl.innerHTML = `${totalAnswered} answered · ${pct}% correct · Avg ${avgTime}s`;
    } else {
      statsEl.innerHTML = 'Waiting for answers...';
    }
  });
}

// Refresh stats every 2s
setInterval(() => {
  if (hostCurrentQ >= 0 && hostCurrentQ < 20) {
    updateAnswerStats(hostCurrentQ);
  }
}, 2000);

// ─── Next Question ───
function hostNextQuestion() {
  hostCurrentQ++;

  if (hostCurrentQ >= 20) {
    // Game over
    endGame();
    return;
  }

  const q = QUESTIONS[hostCurrentQ];
  const prevRound = hostCurrentRound;
  const newRound = q.round;

  if (newRound !== prevRound) {
    // End of a round — check if it was Round 3 (show team results)
    if (prevRound === 3) {
      showHostTeamResults();
      return;
    }
    // Check if entering Round 3 (show fun fact then team selection)
    showHostFunFact(prevRound);
    return;
  }

  // Same round, next question
  sessionRef.update({
    currentQuestion: hostCurrentQ,
    currentRound: newRound,
    timerStart: firebase.database.ServerValue.TIMESTAMP,
    showAnswer: false
  });

  loadHostQuestion(hostCurrentQ);
}

// ─── Reveal Answer ───
function hostRevealAnswer() {
  sessionRef.update({ showAnswer: true });
  document.getElementById('host-reveal-btn').disabled = true;
}

// ─── Fun Fact Screen ───
function showHostFunFact(round) {
  sessionRef.update({ status: 'between_rounds' });
  updateHostStatus('between_rounds');

  document.getElementById('host-game').classList.add('hidden');
  document.getElementById('host-funfact').classList.remove('hidden');
  document.getElementById('host-funfact-text').textContent = ROUNDS[round].funFact;
}

// ─── Continue to Next Round ───
function hostNextRound() {
  document.getElementById('host-funfact').classList.add('hidden');

  const q = QUESTIONS[hostCurrentQ];
  const nextRound = q.round;

  // If entering Round 3, show team selection first
  if (nextRound === 3) {
    document.getElementById('host-team-selection').classList.remove('hidden');
    sessionRef.update({ status: 'team_selection' });
    updateHostStatus('team_selection');
    startHostTeamListener();
    return;
  }

  // Normal round transition
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

// ─── Team Listener (counts) ───
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

// ─── Start Round 3 (after team selection) ───
function hostStartRound3() {
  teamListenerActive = false;
  document.getElementById('host-team-selection').classList.add('hidden');
  document.getElementById('host-game').classList.remove('hidden');

  hostCurrentRound = 3;

  sessionRef.update({
    status: 'playing',
    currentQuestion: hostCurrentQ,
    currentRound: 3,
    timerStart: firebase.database.ServerValue.TIMESTAMP,
    showAnswer: false
  });

  updateHostStatus('playing');
  loadHostQuestion(hostCurrentQ);
}

// ─── Show Team Results (after Round 3) ───
function showHostTeamResults() {
  sessionRef.update({ status: 'team_results' });
  updateHostStatus('team_results');

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
      document.getElementById('host-tr-subtitle').textContent = 'IT\'S A TIE!';
    }
  });
}

// ─── Continue After Team Results → Round 4 ───
function hostContinueAfterTeam() {
  document.getElementById('host-team-results').classList.add('hidden');

  // Show fun fact for Round 3 first
  showHostFunFact(3);
}

// ─── Leaderboard ───
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

// ─── End Game ───
function endGame() {
  sessionRef.update({ status: 'ended' });
  updateHostStatus('ended');

  document.getElementById('host-game').classList.add('hidden');
  document.getElementById('host-funfact').classList.add('hidden');
  document.getElementById('host-final').classList.remove('hidden');

  // Build podium & rankings
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

// ─── Podium ───
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

// ─── Full Ranking Table ───
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

// ─── Class Statistics ───
function buildClassStats(sorted) {
  const container = document.getElementById('host-class-stats');
  if (sorted.length === 0) { container.innerHTML = ''; return; }

  // Hardest question (lowest correct %)
  let hardestQ = 0, hardestPct = 100;
  for (let qi = 0; qi < 20; qi++) {
    let total = 0, correct = 0;
    sorted.forEach(p => {
      if (p.answers && p.answers['q' + qi]) {
        total++;
        if (p.answers['q' + qi].correct) correct++;
      }
    });
    if (total > 0) {
      const pct = Math.round((correct / total) * 100);
      if (pct < hardestPct) { hardestPct = pct; hardestQ = qi + 1; }
    }
  }

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
    <div><span class="cs-val">Q${hardestQ} (${hardestPct}%)</span>Hardest Question</div>
    <div><span class="cs-val">${topStreakName} 🔥×${topStreak}</span>Highest Streak</div>
    <div><span class="cs-val">${fastestName} — ${(fastestTime / 1000).toFixed(1)}s</span>Fastest Answer</div>`;
}

// ─── Init on Load ───
window.addEventListener('DOMContentLoaded', initSession);
