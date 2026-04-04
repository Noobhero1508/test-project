// ═══════════════════════════════════════════════════════════
//  GLOBAL AGENT MISSION — Question Bank
// ═══════════════════════════════════════════════════════════

// ─── Round 1, 2, 4 Questions (fixed, 5 each) ───────────────
const QUESTIONS_R1 = [
  {
    id: 'r1q0',
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
    id: 'r1q1',
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
    id: 'r1q2',
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
    id: 'r1q3',
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
    id: 'r1q4',
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
  }
];

const QUESTIONS_R2 = [
  {
    id: 'r2q0',
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
    id: 'r2q1',
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
    id: 'r2q2',
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
    id: 'r2q3',
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
    id: 'r2q4',
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
  }
];

const QUESTIONS_R4 = [
  {
    id: 'r4q0',
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
    id: 'r4q1',
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
    id: 'r4q2',
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
    id: 'r4q3',
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
    id: 'r4q4',
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

// ─── Round 3 Pool (20 câu, random 10 mỗi ván) ─────────────
const ROUND3_POOL = [
  // ── Nhóm 1: Advantage / Disadvantage nhận biết ──
  {
    id: 'r3p0',
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
    id: 'r3p1',
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
    id: 'r3p2',
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
    id: 'r3p3',
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
    id: 'r3p4',
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
  // ── Nhóm 2: Vocabulary mới ──
  {
    id: 'r3p5',
    round: 3,
    type: "mcq",
    topic: "Globalization definition",
    question: 'Which BEST defines "globalization"?',
    options: [
      "The process of a country becoming independent from others",
      "The process of economies, cultures and societies becoming more connected",
      "Importing more goods than a country exports",
      "Governments reducing taxes on local businesses"
    ],
    answer: 1,
    explanation: "Globalization = quá trình các nền kinh tế, văn hóa và xã hội kết nối chặt chẽ hơn."
  },
  {
    id: 'r3p6',
    round: 3,
    type: "mcq",
    topic: "Economic advantage",
    question: "Which is a CLEAR economic advantage of globalization for developing countries?",
    options: [
      "Loss of local cultural identity",
      "Increased unemployment due to foreign competition",
      "Access to foreign investment and technology",
      "Rising prices of domestic goods"
    ],
    answer: 2,
    explanation: "FDI (Foreign Direct Investment) và chuyển giao công nghệ là lợi ích kinh tế cốt lõi của toàn cầu hóa."
  },
  {
    id: 'r3p7',
    round: 3,
    type: "fillin",
    topic: "Trade vocabulary",
    question: 'When countries remove trade barriers and allow free exchange of goods, this is called free ___________.',
    blankBefore: "When countries remove trade barriers and allow free exchange of goods, this is called free",
    blankAfter: ".",
    answer: "trade",
    hintLetters: ["t"],
    explanation: "Free trade = thương mại tự do. Nền tảng của toàn cầu hóa kinh tế."
  },
  {
    id: 'r3p8',
    round: 3,
    type: "mcq",
    topic: "Cultural disadvantage",
    question: 'Local traditions and arts disappearing due to global pop culture spreading is an example of:',
    options: [
      "Cultural exchange",
      "Cultural uniformity threatening local identity",
      "International cooperation",
      "Economic development"
    ],
    answer: 1,
    explanation: "Toàn cầu hóa có thể xóa bỏ văn hóa địa phương khi văn hóa đại chúng toàn cầu lan rộng."
  },
  {
    id: 'r3p9',
    round: 3,
    type: "mcq",
    topic: "PRO globalization argument",
    question: "Which is the STRONGEST PRO-globalization argument from the unit?",
    options: [
      "It leads to job losses in developed countries",
      "It promotes cultural uniformity",
      "It raises living standards and reduces poverty globally",
      "It increases the power of multinational corporations only"
    ],
    answer: 2,
    explanation: "PRO: Tăng mức sống và giảm nghèo toàn cầu là luận điểm mạnh nhất ủng hộ toàn cầu hóa."
  },
  // ── Nhóm 3: Context & Application ──
  {
    id: 'r3p10',
    round: 3,
    type: "mcq",
    topic: "ANTI argument",
    question: "Which argument would an ANTI-globalization speaker use MOST effectively?",
    options: [
      "Globalization creates jobs in developing countries",
      "Multinational corporations exploit cheap labor and damage local industries",
      "Technology spreads faster thanks to globalization",
      "People can travel and work abroad more freely"
    ],
    answer: 1,
    explanation: "ANTI: Các tập đoàn đa quốc gia bóc lột lao động giá rẻ và phá hoại công nghiệp địa phương là lập luận phản đối mạnh nhất."
  },
  {
    id: 'r3p11',
    round: 3,
    type: "mcq",
    topic: "Counter-argument technique",
    question: 'In a debate, after stating the opposing side\'s view, you should start your counter-argument with:',
    options: [
      '"Furthermore,"',
      '"However,"',
      '"In addition,"',
      '"Similarly,"'
    ],
    answer: 1,
    explanation: '"However" = tuy nhiên. Dùng để chuyển từ luận điểm đối lập sang phản luận của mình.'
  },
  {
    id: 'r3p12',
    round: 3,
    type: "fillin",
    topic: "Key debate word",
    question: 'While globalization creates jobs in some areas, it can cause ___________ in others as factories move abroad.',
    blankBefore: "While globalization creates jobs in some areas, it can cause",
    blankAfter: "in others as factories move abroad.",
    answer: "unemployment",
    hintLetters: ["u"],
    explanation: "Unemployment = thất nghiệp. Hệ quả tiêu cực khi các nhà máy chuyển sang nước có lao động rẻ hơn."
  },
  {
    id: 'r3p13',
    round: 3,
    type: "mcq",
    topic: "Globalization & Environment",
    question: "One environmental CON of globalization mentioned in the unit is:",
    options: [
      "Faster communication between countries",
      "Increased carbon emissions from international shipping and production",
      "Higher quality goods for consumers",
      "Easier access to clean energy technology"
    ],
    answer: 1,
    explanation: "Vận chuyển hàng hóa quốc tế và sản xuất toàn cầu làm tăng lượng khí thải carbon."
  },
  {
    id: 'r3p14',
    round: 3,
    type: "mcq",
    topic: "Globalization benefits",
    question: "Which of these is a social BENEFIT of globalization?",
    options: [
      "More cultural uniformity worldwide",
      "Exploitation of workers in poorer countries",
      "Greater cultural exchange and understanding between nations",
      "Loss of traditional local practices"
    ],
    answer: 2,
    explanation: "Trao đổi văn hóa và hiểu biết lẫn nhau giữa các quốc gia là lợi ích xã hội quan trọng."
  },
  // ── Nhóm 4: True / False style & advanced ──
  {
    id: 'r3p15',
    round: 3,
    type: "mcq",
    topic: "Multinational corporations",
    question: 'A multinational corporation (MNC) is a company that:',
    options: [
      "Only sells products in its home country",
      "Is owned by more than two governments",
      "Operates in multiple countries across the world",
      "Trades only between two neighboring countries"
    ],
    answer: 2,
    explanation: "MNC = tập đoàn đa quốc gia, hoạt động kinh doanh tại nhiều quốc gia trên thế giới."
  },
  {
    id: 'r3p16',
    round: 3,
    type: "mcq",
    topic: "Globalization & inequality",
    question: '"The benefits of globalization are NOT equally shared." This is an argument:',
    options: [
      "PRO globalization",
      "ANTI globalization",
      "Neutral / statistical observation",
      "Not related to globalization"
    ],
    answer: 1,
    explanation: "Lợi ích không được chia sẻ đều = bất bình đẳng, đây là lập luận CHỐNG toàn cầu hóa."
  },
  {
    id: 'r3p17',
    round: 3,
    type: "fillin",
    topic: "Key term",
    question: 'The process of countries becoming more open to international trade and investment is called ___________.',
    blankBefore: "The process of countries becoming more open to international trade and investment is called",
    blankAfter: ".",
    answer: "globalization",
    hintLetters: ["g"],
    explanation: "Globalization = toàn cầu hóa. Khái niệm trung tâm của Unit 10."
  },
  {
    id: 'r3p18',
    round: 3,
    type: "mcq",
    topic: "Debate structure",
    question: "In the Lesson 3 debate, the PRO side's MAIN argument was that globalization:",
    options: [
      "Destroys local cultures and languages",
      "Creates unfair competition for small businesses",
      "Promotes economic growth and raises living standards",
      "Increases dependency on foreign countries"
    ],
    answer: 2,
    explanation: "PRO team chính luận: Toàn cầu hóa thúc đẩy tăng trưởng kinh tế và nâng cao mức sống."
  },
  {
    id: 'r3p19',
    round: 3,
    type: "mcq",
    topic: "Concession language",
    question: 'Which phrase is used to CONCEDE a point before giving a counter-argument?',
    options: [
      '"Absolutely not,"',
      '"While it is true that... , however..."',
      '"On the other hand... therefore..."',
      '"In conclusion,"'
    ],
    answer: 1,
    explanation: '"While it is true that... however..." là cấu trúc nhượng bộ chuẩn trong debate và bài luận phản biện.'
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

// Legacy QUESTIONS array (uses first 5 Round 3 questions, overwritten at game start)
let QUESTIONS = buildSessionQuestions(ROUND3_POOL.slice(0, 10));

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
