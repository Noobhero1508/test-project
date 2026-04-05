// ═══════════════════════════════════════════════════════════
//  GLOBAL AGENT MISSION — Question Bank  (Updated)
// ═══════════════════════════════════════════════════════════

// ─── Round 1 · Breaking News · Phrasal Verbs (5 questions) ─
const QUESTIONS_R1 = [
  {
    id: 'r1q0',
    round: 1,
    type: "mcq",
    topic: "Intel Check",
    question: 'A mysterious new virus has appeared in Sector 7. Citizens are starting to "get sick" with it. Which phrasal verb means "to become sick with an illness"?',
    options: [
      "Lay off",
      "Come down with",
      "Bring about",
      "Put up with"
    ],
    answer: 1,
    explanation: 'Think about how your energy goes "down" when you are sick. "Come down with" = bị mắc bệnh. Ex: "She came down with the flu."'
  },
  {
    id: 'r1q1',
    round: 1,
    type: "mcq",
    topic: "Scenario Analysis",
    question: 'Economic crisis! A major tech corporation is forced to fire its workers to save money. What is the correct term for "firing employees for economic reasons"?',
    options: [
      "Come up with",
      "Wipe out",
      "Go without",
      "Lay off"
    ],
    answer: 3,
    explanation: 'When you remove someone from their job, you "lay" them "off". "Lay off" = cho thôi việc vì lý do kinh tế.'
  },
  {
    id: 'r1q2',
    round: 1,
    type: "mcq",
    topic: "Comms Intercept",
    question: 'You intercept a classified message. You need to tell your partner this highly surprising news. Which conversational strategy should you use to start your sentence?',
    options: [
      "You'd think...",
      "Can you believe...",
      "Well, that's another story.",
      "It just goes to show you..."
    ],
    answer: 1,
    explanation: '"Can you believe..." = Bạn có tin được không... — dùng để chia sẻ tin tức gây ngạc nhiên. Ex: "Can you believe they closed the border?"'
  },
  {
    id: 'r1q3',
    round: 1,
    type: "mcq",
    topic: "Comms Strategy",
    question: 'The mission failed, but nobody got hurt. To shift the conversation from a negative fact to a positive perspective, you say: "We lost the target, but _____________, we gathered useful data."',
    options: [
      "On the bright side...",
      "You'd think...",
      "That's another story...",
      "Can you believe..."
    ],
    answer: 0,
    explanation: '"Bright" means full of light, hope, and positivity. "On the bright side" = Nhìn vào mặt tích cực — dùng để chuyển hướng sang điểm tốt.'
  },
  {
    id: 'r1q4',
    round: 1,
    type: "fillin",
    topic: "Decryption Required",
    question: 'Our objective is to completely destroy the enemy\'s computer virus. Type the missing word: WIPE _ _ _',
    blankBefore: "Our objective: WIPE",
    blankAfter: "the enemy's virus.",
    answer: "out",
    hintLetters: ["o"],
    explanation: '"Wipe out" = tiêu diệt hoàn toàn. Hint: 3-letter preposition — exact opposite of "IN". Ex: "The flood wiped out the village."'
  }
];

// ─── Round 2 · Trade Floor · Economics (5 questions) ────────
const QUESTIONS_R2 = [
  {
    id: 'r2q0',
    round: 2,
    type: "mcq",
    topic: "Market Intel",
    question: 'Target Country A is buying millions of cars produced in other nations and bringing them inside their borders. Goods brought INTO a country are called:',
    options: [
      "Exports",
      "Imports",
      "Prosperity",
      "Income"
    ],
    answer: 1,
    explanation: 'Focus on the prefix "Im-", which sounds like "In". "Imports" = hàng nhập khẩu — hàng hóa được mua từ nước ngoài và đưa vào trong nước.'
  },
  {
    id: 'r2q1',
    round: 2,
    type: "mcq",
    topic: "Corporate Strategy",
    question: 'A company in New York wants to save money, so they hire online workers in Asia to do their programming. Finding workers from an outside source is called:',
    options: [
      "Homogenization",
      "Fair-trade",
      "Outsourcing",
      "Standard of living"
    ],
    answer: 2,
    explanation: '"Outsourcing" = thuê ngoài — thuê lao động từ nguồn bên ngoài, thường ở nước khác để tiết kiệm chi phí.'
  },
  {
    id: 'r2q2',
    round: 2,
    type: "mcq",
    topic: "Cultural Observation",
    question: 'You travel undercover to 5 different countries, but every street looks exactly the same. They all have the same global coffee shops. This process of diverse cultures becoming exactly the same is called:',
    options: [
      "Homogenization",
      "Infrastructure",
      "Prosperity",
      "Investment"
    ],
    answer: 0,
    explanation: 'The prefix "Homo-" means "same" or "identical". "Homogenization" = đồng nhất hóa — quá trình các nền văn hóa đa dạng trở nên giống nhau.'
  },
  {
    id: 'r2q3',
    round: 2,
    type: "mcq",
    topic: "City Scan",
    question: 'To transport secret cargo, we need good roads, bridges, and fast telecommunications. The physical networks and systems that keep a country running are known as its:',
    options: [
      "Wages",
      "Employment rate",
      "Exports",
      "Infrastructure"
    ],
    answer: 3,
    explanation: '"Infrastructure" = cơ sở hạ tầng — hệ thống đường sá, cầu cống, viễn thông giúp duy trì hoạt động của một quốc gia.'
  },
  {
    id: 'r2q4',
    round: 2,
    type: "fillin",
    topic: "Decryption Required",
    question: 'You intercept a trade document guaranteeing honest wages and safe working conditions for poor farmers in developing nations. This ethical business model is called: _ _ _ _ - TRADE.',
    blankBefore: "This ethical business model is called:",
    blankAfter: "-TRADE.",
    answer: "fair",
    hintLetters: ["f"],
    explanation: '"Fair-trade" = thương mại công bằng. Hint: In sports, playing by the rules without cheating is called "___ play". Answer: FAIR.'
  }
];

// ─── Round 4 · Culture Shock · Adaptation (5 questions) ─────
const QUESTIONS_R4 = [
  {
    id: 'r4q0',
    round: 4,
    type: "mcq",
    topic: "Psych Assessment — Idiom",
    stage: "honeymoon",
    question: 'During your first week in the foreign city, you don\'t know the language or the customs. You feel completely uncomfortable, like you don\'t belong here. You feel like a:',
    options: [
      "Bird in a cage",
      "Cat on a hot roof",
      "Fish out of water",
      "Dog in the street"
    ],
    answer: 2,
    explanation: '"Fish out of water" = Cá ra khỏi nước — cảm giác hoàn toàn không thuộc về nơi này. Imagine an animal taken entirely out of its natural environment!'
  },
  {
    id: 'r4q1',
    round: 4,
    type: "mcq",
    topic: "Psych Assessment — Idiom",
    stage: "frustration",
    question: 'A foreign agent tells you a terrifying lie, then suddenly laughs and says he was only joking. The idiom for "joking/tricking someone" is "Pulling someone\'s ________".',
    options: [
      "Arm",
      "Hair",
      "Ear",
      "Leg"
    ],
    answer: 3,
    explanation: '"Pulling someone\'s leg" = trêu đùa / đánh lừa ai đó. This is a fixed idiom — always "leg", never another body part!'
  },
  {
    id: 'r4q2',
    round: 4,
    type: "mcq",
    topic: "Psych Assessment — Idiom",
    stage: "depression",
    question: 'Two local politicians are arguing about globalization. You refuse to choose a side and remain undecided/neutral. The idiom for this is "Sitting on the ________".',
    options: [
      "Fence",
      "Wall",
      "Table",
      "Roof"
    ],
    answer: 0,
    explanation: '"Sitting on the fence" = không đứng về phía nào, trung lập. What wooden structure separates two neighbors\' yards? You are sitting right in the middle of it!'
  },
  {
    id: 'r4q3',
    round: 4,
    type: "mcq",
    topic: "Debate Protocol",
    stage: "acceptance",
    question: 'An enemy journalist writes an article claiming "Globalization is terrible." Your mission is to write an essay arguing against their opinion using strong evidence. The academic term for "arguing against an opposing view" is:',
    options: [
      "Summarizing",
      "Rebutting",
      "Agreeing",
      "Brainstorming"
    ],
    answer: 1,
    explanation: '"Rebutting" = phản bác — đưa ra lập luận và bằng chứng để chống lại quan điểm đối lập. A key skill in academic debate!'
  },
  {
    id: 'r4q4',
    round: 4,
    type: "fillin",
    topic: "The Final Boss",
    stage: "acceptance",
    question: 'The feeling of confusion, anxiety, and isolation you experience when moving to a completely different cultural environment is officially known as "Culture _______". Type the missing word: S _ _ _ K',
    blankBefore: 'This feeling is officially known as "Culture',
    blankAfter: '".',
    answer: "shock",
    hintLetters: ["s"],
    explanation: '"Culture Shock" = sốc văn hóa. Hint: A 5-letter word — what happens when you touch a broken electrical wire. Also: a sudden, intense feeling of surprise or trauma.'
  }
];

// ─── Round 3 Pool · Debate Stage · AI Security Protocol ─────
// 20 questions — system randomly selects 10 per session
const ROUND3_POOL = [
  // ── Q11: Syntax Hack — wipe out ──
  {
    id: 'r3p0',
    round: 3,
    type: "mcq",
    topic: "Syntax Hack — Directive 1",
    question: '[Syntax Hack] Target: "wipe out" (2 words). Pronoun: "it". Choose the correct AI syntax:\n\nDirective 1: For 2-word verbs, if the object is a pronoun, you MUST trap it in the MIDDLE!',
    options: [
      "Wipe out it",
      "Wipe it out"
    ],
    answer: 1,
    explanation: 'Directive 1: 2-word separable verbs MUST have pronoun in the MIDDLE. ✅ "Wipe IT out" — never "Wipe out IT".'
  },
  // ── Q12: Syntax Hack — lay off ──
  {
    id: 'r3p1',
    round: 3,
    type: "mcq",
    topic: "Syntax Hack — Directive 1",
    question: '[Syntax Hack] Target: "lay off" (2 words). Pronoun: "them".\n\nDirective 1: For 2-word verbs + pronoun → trap it in the MIDDLE!',
    options: [
      "Lay off them",
      "Lay them off"
    ],
    answer: 1,
    explanation: 'Directive 1: "Lay THEM off" ✅ — the pronoun goes BETWEEN the two words. "Lay off them" ❌ is incorrect.'
  },
  // ── Q13: Syntax Hack — carry out ──
  {
    id: 'r3p2',
    round: 3,
    type: "mcq",
    topic: "Syntax Hack — Directive 1",
    question: '[Syntax Hack] Target: "carry out" (to execute a plan — 2 words). Pronoun: "it".\n\nDirective 1 applies. Choose correctly:',
    options: [
      "Carry it out",
      "Carry out it"
    ],
    answer: 0,
    explanation: '"Carry IT out" ✅ — pronoun trapped in the MIDDLE per Directive 1. "Carry out it" ❌ violates the rule.'
  },
  // ── Q14: Syntax Hack — bring about ──
  {
    id: 'r3p3',
    round: 3,
    type: "mcq",
    topic: "Syntax Hack — Directive 1",
    question: '[Syntax Hack] Target: "bring about" (to cause a change — 2 words). Pronoun: "it".\n\nApply Directive 1:',
    options: [
      "Bring it about",
      "Bring about it"
    ],
    answer: 0,
    explanation: '"Bring IT about" ✅ — 2-word verb + pronoun → pronoun in the MIDDLE. "Bring about it" ❌ is wrong.'
  },
  // ── Q15: Security Alert — come up with ──
  {
    id: 'r3p4',
    round: 3,
    type: "mcq",
    topic: "Security Alert — Directive 2",
    question: '[Security Alert!] Target: "come up with" (to invent an idea — 3 words).\n\nDirective 2: 3-word verbs are LOCKED. They can NEVER be separated!',
    options: [
      "Come up with a plan",
      "Come up a plan with"
    ],
    answer: 0,
    explanation: 'Directive 2: 3-word phrasal verbs are LOCKED — never separated! ✅ "Come up with a plan". ❌ "Come up a plan with" violates Directive 2.'
  },
  // ── Q16: Security Alert — put up with ──
  {
    id: 'r3p5',
    round: 3,
    type: "mcq",
    topic: "Security Alert — Directive 2",
    question: '[Security Alert!] Target: "put up with" (to tolerate — 3 words). Pronoun: "it".\n\nDirective 2: 3-word verbs are LOCKED. Pronoun goes at the END!',
    options: [
      "Put up it with",
      "Put up with it"
    ],
    answer: 1,
    explanation: '"Put up with IT" ✅ — 3-word verbs are LOCKED, pronoun ALWAYS goes at the END. "Put up IT with" ❌ violates Directive 2.'
  },
  // ── Q17: System Exception — go without ──
  {
    id: 'r3p6',
    round: 3,
    type: "mcq",
    topic: "System Exception",
    question: '[System Exception!] "Go without" (to live lacking something) has 2 words but it CANNOT be separated. Choose the correct syntax:',
    options: [
      "Go without it",
      "Go it without"
    ],
    answer: 0,
    explanation: '"Go without" is a special INSEPARABLE 2-word verb — even with a pronoun, the pronoun goes at the END. ✅ "Go without it".'
  },
  // ── Q18: Identify Malware ──
  {
    id: 'r3p7',
    round: 3,
    type: "mcq",
    topic: "Identify Malware",
    question: '[Identify Malware] Find the INCORRECT sentence in the system:',
    options: [
      "We will lay them off.",
      "We will wipe out it.",
      "We will carry it out."
    ],
    answer: 1,
    explanation: '"We will wipe out it." ❌ MALWARE DETECTED — violates Directive 1! Correct: "We will wipe IT out." — pronoun must go in the MIDDLE of a 2-word verb.'
  },
  // ── Q19: Noun Protocol ──
  {
    id: 'r3p8',
    round: 3,
    type: "mcq",
    topic: "Noun Protocol",
    question: '[Noun Protocol] If the object is a normal noun like "the mission" (NOT a pronoun), what is the rule for a 2-word verb?',
    options: [
      "Carry out the mission. (At the end)",
      "Carry the mission out. (In the middle)",
      "Both A and B are correct!"
    ],
    answer: 2,
    explanation: 'With a regular NOUN object, BOTH positions are correct for separable 2-word verbs: "Carry out the mission" ✅ AND "Carry the mission out" ✅. Only PRONOUNS MUST go in the middle!'
  },
  // ── Q20: Vocabulary — run out of ──
  {
    id: 'r3p9',
    round: 3,
    type: "mcq",
    topic: "Vocabulary File",
    question: '[Vocabulary File] The base has zero supplies left. Which phrase means "to have nothing left"?',
    options: [
      "Run out of",
      "Come down with"
    ],
    answer: 0,
    explanation: '"Run out of" = hết sạch, không còn gì. Ex: "We\'ve run out of ammunition!" "Come down with" = mắc bệnh — different meaning!'
  },
  // ── Q21: Economics — Prosperity ──
  {
    id: 'r3p10',
    round: 3,
    type: "mcq",
    topic: "Economics File",
    question: '[Economics File] What is the definition of "Prosperity"?',
    options: [
      "Economic success and great wealth.",
      "Extreme poverty and a failing economy."
    ],
    answer: 0,
    explanation: '"Prosperity" = sự thịnh vượng — trạng thái kinh tế thành công và giàu có. Opposite: poverty (nghèo khó).'
  },
  // ── Q22: Economics — Standard of living ──
  {
    id: 'r3p11',
    round: 3,
    type: "mcq",
    topic: "Economics File",
    question: '[Economics File] The level of wealth, comfort, and goods available to a citizen is their:',
    options: [
      "Investment",
      "Standard of living"
    ],
    answer: 1,
    explanation: '"Standard of living" = mức sống — mức độ giàu có, tiện nghi và hàng hóa mà một người dân có thể tiếp cận được.'
  },
  // ── Q23: Economics — Unemployment rate ──
  {
    id: 'r3p12',
    round: 3,
    type: "mcq",
    topic: "Economics File",
    question: '[Economics File] The percentage of people who DO NOT have a job is the:',
    options: [
      "Unemployment rate",
      "Employment rate"
    ],
    answer: 0,
    explanation: '"Unemployment rate" = tỷ lệ thất nghiệp — % người KHÔNG có việc làm. "Employment rate" = tỷ lệ có việc làm (opposite).'
  },
  // ── Q24: Economics — Wages ──
  {
    id: 'r3p13',
    round: 3,
    type: "mcq",
    topic: "Economics File",
    question: '[Economics File] Money paid regularly (hourly/weekly) for work is called:',
    options: [
      "Infrastructure",
      "Wages"
    ],
    answer: 1,
    explanation: '"Wages" = tiền lương — tiền được trả đều đặn (theo giờ/tuần) cho công việc. "Infrastructure" = cơ sở hạ tầng — completely different!'
  },
  // ── Q25: Audio Analysis — Rising intonation ──
  {
    id: 'r3p14',
    round: 3,
    type: "mcq",
    topic: "Audio Analysis — Intonation",
    question: '[Audio Analysis] If an agent asks a Tag Question and their voice goes UP (Rising Intonation ↗): "You\'re from London, aren\'t you? ↗" — it means:',
    options: [
      "They are not sure and really want to know the answer.",
      "They are 100% sure."
    ],
    answer: 0,
    explanation: 'Rising intonation (↗) in tag questions = GENUINE QUESTION — the speaker is NOT sure and wants confirmation. They are asking sincerely!'
  },
  // ── Q26: Audio Analysis — Falling intonation ──
  {
    id: 'r3p15',
    round: 3,
    type: "mcq",
    topic: "Audio Analysis — Intonation",
    question: '[Audio Analysis] If an agent\'s voice goes DOWN (Falling Intonation ↘): "It\'s cold today, isn\'t it? ↘" — it means:',
    options: [
      "They have no idea.",
      "They already know it\'s true and expect you to agree."
    ],
    answer: 1,
    explanation: 'Falling intonation (↘) in tag questions = STATEMENT seeking agreement — the speaker already KNOWS the answer and just expects confirmation!'
  },
  // ── Q27: Comm Strategy — You'd think ──
  {
    id: 'r3p16',
    round: 3,
    type: "mcq",
    topic: "Comm Strategy",
    question: '[Comm Strategy] You are disappointed with old technology. Which phrase expresses frustration in this modern age?',
    options: [
      "You\'d think... (in this modern age, they would fix this!)",
      "Well, that\'s another story."
    ],
    answer: 0,
    explanation: '"You\'d think..." = Người ta sẽ nghĩ rằng... — dùng để bày tỏ sự thất vọng vì điều gì đó lẽ ra phải được cải thiện nhưng chưa được.'
  },
  // ── Q28: Comm Strategy — That's another story ──
  {
    id: 'r3p17',
    round: 3,
    type: "mcq",
    topic: "Comm Strategy",
    question: '[Comm Strategy] You want to acknowledge that you are smoothly changing the subject of the conversation. You say:',
    options: [
      "But on the bright side...",
      "Well, that\'s another story."
    ],
    answer: 1,
    explanation: '"Well, that\'s another story" = À, đó lại là chuyện khác rồi — dùng để chuyển chủ đề một cách tự nhiên, nhận thức được sự thay đổi.'
  },
  // ── Q29: Comm Strategy — It just goes to show ──
  {
    id: 'r3p18',
    round: 3,
    type: "mcq",
    topic: "Comm Strategy",
    question: '[Comm Strategy] You want to emphasize a point or prove that you were right all along. You say:',
    options: [
      "It just goes to show you...",
      "Can you believe..."
    ],
    answer: 0,
    explanation: '"It just goes to show you..." = Điều đó chứng tỏ rằng... — dùng để nhấn mạnh một điểm hoặc chứng minh rằng bạn đã đúng từ đầu.'
  },
  // ── Q30: Identify Malware — Final Firewall ──
  {
    id: 'r3p19',
    round: 3,
    type: "mcq",
    topic: "Final Firewall",
    question: '[Identify Malware] Final Firewall Question! Which sentence is grammatically WRONG?',
    options: [
      "I can\'t put up with the noise.",
      "I can\'t put the noise up with."
    ],
    answer: 1,
    explanation: '"I can\'t put the noise up with." ❌ MALWARE! Violates Directive 2 — "put up with" is a 3-word LOCKED verb. It can NEVER be separated. ✅ "I can\'t put up with the noise."'
  }
];

// ─── Random picker for Round 3 (10 from 20) ───────────────
function getRandomRound3Questions() {
  const pool = [...ROUND3_POOL];
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 10);
}

// ─── Build full QUESTIONS array for a session ─────────────
// Returns: R1(5) + R2(5) + R3_selected(10) + R4(5) = 25
function buildSessionQuestions(round3Selected) {
  return [
    ...QUESTIONS_R1,
    ...QUESTIONS_R2,
    ...round3Selected,
    ...QUESTIONS_R4
  ];
}

// Legacy QUESTIONS array (uses first 10 Round 3 questions, overwritten at game start)
let QUESTIONS = buildSessionQuestions(ROUND3_POOL.slice(0, 10));

// Round metadata
const ROUNDS = {
  1: {
    name: "Breaking News",
    subtitle: "Phrasal Verbs · Global Issues",
    icon: "📺",
    theme: "breaking-news",
    funFactTitle: "🚨 [DECLASSIFIED INTEL: AI AND JOBS] 🚨",
    funFactBody: "Did you know? AI is changing the world fast. Because of this, some companies have to lay off workers. But on the bright side, humans have come up with millions of new tech jobs. AI might wipe out old tasks, but it creates a new future!"
  },
  2: {
    name: "Trade Floor",
    subtitle: "Economics · Global Trade",
    icon: "📈",
    theme: "trade-floor",
    funFactTitle: "🚨 [DECLASSIFIED INTEL: THE GLOBAL SMARTPHONE] 🚨",
    funFactBody: "Did you know? No single country can build a smartphone alone! Companies rely on outsourcing and imports from over 40 different countries to make just one phone. Without global infrastructure like the internet and shipping networks, your phone would not exist!"
  },
  3: {
    name: "Debate Stage",
    subtitle: "AI Security Protocol · Grammar Firewall",
    icon: "⚖️",
    theme: "debate-arena",
    funFactTitle: "🚨 [DECLASSIFIED INTEL: DYING LANGUAGES] 🚨",
    funFactBody: "Did you know? Globalization connects us, but it causes homogenization (cultures becoming exactly the same). Right now, one human language dies every 14 days! Luckily, scientists are using AI to translate and save these rare languages before they disappear forever."
  },
  4: {
    name: "Culture Shock",
    subtitle: "Adaptation · Idioms · Debate",
    icon: "🌏",
    theme: "culture-shock",
    funFactTitle: "",
    funFactBody: "Psychologist Kalervo Oberg was the first person to describe 'culture shock' in 1960. Idioms like 'fish out of water', 'pulling someone's leg', and 'sitting on the fence' are used every day — even by native speakers who don't realize they're using figurative language!"
  }
};

// Culture shock stages for Round 4
const CULTURE_STAGES = {
  honeymoon:   { name: "Honeymoon",    emoji: "🌅", bg: "#1a1400", accent: "#f9c74f", moodPct: 90, desc: "Everything is exciting and new!" },
  frustration: { name: "Frustration",  emoji: "😤", bg: "#1a0800", accent: "#f4521e", moodPct: 35, desc: "Small differences start to irritate." },
  depression:  { name: "Depression",   emoji: "😔", bg: "#0d1117", accent: "#7b8fa1", moodPct: 15, desc: "Feeling lost and homesick." },
  acceptance:  { name: "Acceptance",   emoji: "🤝", bg: "#0a1a0d", accent: "#4caf50", moodPct: 80, desc: "Finding balance and adapting." }
};
