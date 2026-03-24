// All 20 questions for Global Agent Mission
const QUESTIONS = [
  // ═══════════════════════════════════════════════
  // ROUND 1 — BREAKING NEWS (Phrasal Verbs)
  // ═══════════════════════════════════════════════
  {
    id: 0,
    round: 1,
    type: "mcq",
    topic: "Phrasal verb meaning",
    question: '"Wipe out" most closely means ___?',
    options: [
      "to improve slowly",
      "to destroy completely",
      "to report to the media",
      "to hire new workers"
    ],
    answer: 1,
    explanation: '"Wipe out" = xóa sổ hoàn toàn. Ex: "The flood wiped out entire villages."'
  },
  {
    id: 1,
    round: 1,
    type: "mcq",
    topic: "Phrasal verb in context",
    question: "The new trade deal will ___ thousands of new jobs in the region.",
    options: [
      "come down with",
      "wipe out",
      "bring about",
      "lay off"
    ],
    answer: 2,
    explanation: '"Bring about" = gây ra, dẫn đến. Dùng cho sự kiện tích cực hoặc tiêu cực.'
  },
  {
    id: 2,
    round: 1,
    type: "fillin",
    topic: "Phrasal verb",
    question: 'The tsunami ___________ thousands of coastal villages overnight.',
    blankBefore: "The tsunami",
    blankAfter: "thousands of coastal villages overnight.",
    answer: "wiped out",
    hintLetters: ["w", "o"],
    explanation: '"Wipe out" = phá hủy hoàn toàn, dùng cho thảm họa tự nhiên hoặc kinh tế.'
  },
  {
    id: 3,
    round: 1,
    type: "mcq",
    topic: "Correct usage",
    question: 'Which sentence uses "come down with" CORRECTLY?',
    options: [
      "The company came down with 200 workers.",
      "She came down with a bad cold after the trip.",
      "They came down with the new policy last week.",
      "He came down with the stock market."
    ],
    answer: 1,
    explanation: '"Come down with" chỉ dùng cho bệnh tật, không dùng cho kinh tế.'
  },
  {
    id: 4,
    round: 1,
    type: "mcq",
    topic: "Global issues vocabulary",
    question: "According to News Report 2 in the unit, what was the general public attitude toward globalization?",
    options: [
      "Mostly negative — fear of job loss",
      "Mixed — both positive and negative views",
      "Mostly positive — support for open markets",
      "Indifferent — no strong opinion"
    ],
    answer: 1,
    explanation: "Bài nghe Lesson 1 mô tả thái độ đa chiều của người dân."
  },

  // ═══════════════════════════════════════════════
  // ROUND 2 — TRADE FLOOR (Economics)
  // ═══════════════════════════════════════════════
  {
    id: 5,
    round: 2,
    type: "mcq",
    topic: "Separability rule",
    question: "Which sentence is grammatically CORRECT?",
    options: [
      "She turned off the lights before leaving.",
      "She turned the off lights before leaving.",
      "She off turned the lights before leaving.",
      "She turned the lights before leaving off."
    ],
    answer: 0,
    explanation: 'Separable phrasal verb: "Turn off the lights" = "Turn the lights off" — cả hai đều đúng. Với pronoun: PHẢI tách — "Turn them off".'
  },
  {
    id: 6,
    round: 2,
    type: "mcq",
    topic: "Separability with pronoun",
    question: '"She brought ___ her old memories." — Which is correct?',
    options: [
      "She brought up her old memories.",
      "She brought her old up memories.",
      "She brought her up old memories.",
      "Both A and B are correct."
    ],
    answer: 0,
    explanation: 'Với danh từ, cả hai vị trí đều được: "brought up her memories" hoặc "brought her memories up". Với đại từ PHẢI tách: "brought them up".'
  },
  {
    id: 7,
    round: 2,
    type: "fillin",
    topic: "Economic vocabulary",
    question: 'The rate of people without jobs in the region is called the ___________.',
    blankBefore: "The rate of people without jobs in the region is called the",
    blankAfter: ".",
    answer: "unemployment rate",
    hintLetters: ["u", "r"],
    explanation: "Unemployment rate = tỷ lệ thất nghiệp. Một trong các chỉ số kinh tế vĩ mô cơ bản."
  },
  {
    id: 8,
    round: 2,
    type: "mcq",
    topic: "Economic vocabulary matching",
    question: "When a country SELLS its products to other countries, those products are called:",
    options: [
      "imports",
      "investments",
      "exports",
      "tariffs"
    ],
    answer: 2,
    explanation: "Export = xuất khẩu (bán ra ngoài). Import = nhập khẩu (mua từ ngoài vào)."
  },
  {
    id: 9,
    round: 2,
    type: "mcq",
    topic: "Context + vocabulary",
    question: "Vietnam's coffee industry has benefited greatly from ___ to Europe and the US.",
    options: [
      "imports",
      "unemployment",
      "investments",
      "exports"
    ],
    answer: 3,
    explanation: "Việt Nam bán cà phê ra nước ngoài = export (xuất khẩu)."
  },

  // ═══════════════════════════════════════════════
  // ROUND 3 — DEBATE STAGE (Pros & Cons)
  // ═══════════════════════════════════════════════
  {
    id: 10,
    round: 3,
    type: "mcq",
    topic: "Pro or Con identification",
    question: '"Globalization reduces poverty in developing countries." This statement is a(n):',
    options: [
      "Disadvantage of globalization",
      "Advantage of globalization",
      "Neither — it's a neutral fact",
      "False claim not mentioned in the unit"
    ],
    answer: 1,
    explanation: "Bài đọc Lesson 3 đề cập globalization giúp giảm nghèo ở các nước đang phát triển."
  },
  {
    id: 11,
    round: 3,
    type: "mcq",
    topic: "Vocabulary definition",
    question: '"Cultural uniformity" refers to:',
    options: [
      "A country enforcing one official language",
      "Different cultures becoming increasingly similar worldwide",
      "Diversity increasing across all world regions",
      "A nation protecting its traditional exports"
    ],
    answer: 1,
    explanation: "Cultural uniformity = đồng nhất văn hóa. Một hệ quả của toàn cầu hóa."
  },
  {
    id: 12,
    round: 3,
    type: "fillin",
    topic: "Globalization vocabulary",
    question: 'Globalization can ___________ the gap between rich and poor countries.',
    blankBefore: "Globalization can",
    blankAfter: "the gap between rich and poor countries.",
    answer: "widen",
    hintLetters: ["w"],
    explanation: '"Widen the gap" = mở rộng khoảng cách. Đây là một nhược điểm của toàn cầu hóa.'
  },
  {
    id: 13,
    round: 3,
    type: "mcq",
    topic: "NOT a disadvantage",
    question: "Which of the following is NOT listed as a disadvantage of globalization in the unit?",
    options: [
      "Widens the gap between rich and poor",
      "Threatens small local businesses",
      "Increases access to diverse goods and services",
      "May lead to cultural uniformity"
    ],
    answer: 2,
    explanation: "Việc tăng tiếp cận hàng hóa đa dạng là một LỢI ÍCH, không phải bất lợi."
  },
  {
    id: 14,
    round: 3,
    type: "mcq",
    topic: "English as global language",
    question: "According to Lesson 3 listening, which is a RISK of English becoming the dominant global language?",
    options: [
      "It makes international business easier",
      "It allows people from different countries to communicate",
      "It may threaten and overshadow other languages and cultures",
      "It increases the number of English speakers worldwide"
    ],
    answer: 2,
    explanation: "Bài nghe Lesson 3 đề cập rủi ro tiếng Anh thống trị và lấn át các ngôn ngữ + văn hóa khác."
  },

  // ═══════════════════════════════════════════════
  // ROUND 4 — CULTURE SHOCK (4 Stages)
  // ═══════════════════════════════════════════════
  {
    id: 15,
    round: 4,
    type: "mcq",
    topic: "Stage identification",
    stage: "honeymoon",
    question: '"I just arrived in Japan and everything is wonderful — the food, the people, the culture! I feel so lucky to be here." Which stage of culture shock is this?',
    options: [
      "Frustration Stage",
      "Acceptance Stage",
      "Depression Stage",
      "Honeymoon Stage"
    ],
    answer: 3,
    explanation: "Honeymoon Stage = giai đoạn trăng mật. Mọi thứ đều mới mẻ và thú vị."
  },
  {
    id: 16,
    round: 4,
    type: "mcq",
    topic: "Correct sequence",
    stage: "honeymoon",
    question: "What is the CORRECT order of the four stages of culture shock?",
    options: [
      "Frustration → Honeymoon → Acceptance → Depression",
      "Honeymoon → Frustration → Depression → Acceptance",
      "Honeymoon → Depression → Frustration → Acceptance",
      "Acceptance → Honeymoon → Depression → Frustration"
    ],
    answer: 1,
    explanation: "Thứ tự đúng: Trăng mật → Thất vọng → Trầm cảm → Chấp nhận."
  },
  {
    id: 17,
    round: 4,
    type: "fillin",
    topic: "Advice for culture shock",
    stage: "frustration",
    question: 'The difficulty of communicating in a foreign country is known as a language ___________.',
    blankBefore: "The difficulty of communicating in a foreign country is known as a language",
    blankAfter: ".",
    answer: "barrier",
    hintLetters: ["b"],
    explanation: "Language barrier = rào cản ngôn ngữ. Nguyên nhân chính gây ra Frustration Stage."
  },
  {
    id: 18,
    round: 4,
    type: "mcq",
    topic: "Essay structure",
    stage: "depression",
    question: "In a 4-paragraph counter-argument essay about globalization, what should paragraph 2 contain?",
    options: [
      "Your main argument supporting globalization",
      "The opposing viewpoint you are arguing against",
      "Your conclusion and final recommendation",
      "Statistics and data only"
    ],
    answer: 1,
    explanation: "Cấu trúc: P1: Introduction | P2: Opposing view | P3: Your counter-argument | P4: Conclusion"
  },
  {
    id: 19,
    round: 4,
    type: "mcq",
    topic: "Acceptance stage",
    stage: "acceptance",
    question: "Which behavior BEST describes someone in the Acceptance Stage of culture shock?",
    options: [
      "Finding everything in the new country exciting and amazing",
      "Feeling frustrated by small cultural differences every day",
      "Feeling homesick and isolated, wanting to go back home",
      "Beginning to adapt and find balance between home and new culture"
    ],
    answer: 3,
    explanation: "Acceptance Stage = bắt đầu thích nghi, tìm được sự cân bằng giữa văn hóa cũ và mới."
  }
];

// Round metadata
const ROUNDS = {
  1: {
    name: "Breaking News",
    subtitle: "Phrasal Verbs & Global Issues",
    icon: "📺",
    theme: "breaking-news",
    funFact: "Starbucks hiện có hơn 35,000 cửa hàng tại hơn 80 quốc gia trên thế giới — bắt đầu từ một cửa hàng nhỏ ở Seattle năm 1971."
  },
  2: {
    name: "Trade Floor",
    subtitle: "Separable Phrasal Verbs & Economics",
    icon: "📈",
    theme: "trade-floor",
    funFact: "Việt Nam là một trong 10 nước xuất khẩu hàng đầu thế giới về cà phê, dệt may, và điện tử — toàn cầu hóa đã biến đổi nền kinh tế Việt Nam hoàn toàn trong 30 năm qua."
  },
  3: {
    name: "Debate Stage",
    subtitle: "Pros & Cons of Globalization",
    icon: "⚖️",
    theme: "debate-arena",
    funFact: "Theo World Bank, toàn cầu hóa đã giúp hơn 1 tỷ người thoát khỏi đói nghèo từ 1990 đến 2015 — nhưng đồng thời, 1% người giàu nhất thế giới sở hữu nhiều tài sản hơn 50% dân số còn lại cộng lại."
  },
  4: {
    name: "Culture Shock",
    subtitle: "4 Stages & Adaptation",
    icon: "🌏",
    theme: "culture-shock",
    funFact: "Nhà tâm lý học Kalervo Oberg là người đầu tiên mô tả 'culture shock' vào năm 1960. Ngày nay, các chương trình du học đều bắt buộc training về 4 giai đoạn này trước khi học sinh lên đường."
  }
};

// Culture shock stages for Round 4
const CULTURE_STAGES = {
  honeymoon:   { name: "Honeymoon",    emoji: "🌅", bg: "#1a1400", accent: "#f9c74f", moodPct: 90, desc: "Everything is exciting and new!" },
  frustration: { name: "Frustration",  emoji: "😤", bg: "#1a0800", accent: "#f4521e", moodPct: 35, desc: "Small differences start to irritate." },
  depression:  { name: "Depression",   emoji: "😔", bg: "#0d1117", accent: "#7b8fa1", moodPct: 15, desc: "Feeling lost and homesick." },
  acceptance:  { name: "Acceptance",   emoji: "🤝", bg: "#0a1a0d", accent: "#4caf50", moodPct: 80, desc: "Finding balance and adapting." }
};
