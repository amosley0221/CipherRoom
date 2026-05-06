// puzzles.jsx
// The puzzle library. Each level is a short noir vignette + a puzzle.
// Original mechanics — combinations of cipher decoding, deduction, lateral thinking,
// reading-the-clues, and spatial inspection of the 3D scene.

const PUZZLES = [
  // ─── L1 — warmup. lateral. simple. ─────────────────────────────────────
  {
    id: 1,
    title: "The Letter",
    chapter: "I",
    location: "39 Hawthorn Lane · 11:47 p.m.",
    scene: "letter",
    body: [
      "She left the door unlocked. That was the first thing I noticed.",
      "On the desk, a sealed envelope and a glass of water — half full, half not.",
      "The letter inside is one line long.",
      "“If you are reading this, you already know the answer. Look only at the FIRST letter of every word — including this one — and tell me my name.”"
    ],
    artifact: {
      kind: "note",
      text: "If You Are Reading This You Already Know The Answer Look Only At The First Letter Of Every Word Including This One And Tell Me My Name"
    },
    inputLabel: "Her name",
    placeholder: "type a name",
    answer: ["IYARTYAKTALOATFLOEWITOATMN", "IYARTYAKTALOATFLOEWITOATMN".toLowerCase()],
    // We deliberately accept the literal first-letter string — the puzzle is *seeing* it.
    accept: (val) => {
      const v = val.replace(/[^a-zA-Z]/g,"").toUpperCase();
      // The first letters of the bold sentence spell out IYARTYAKTALOATFLOEWITOATMN
      // BUT cleverly, the FIRST letter of every word *including this one* of the
      // *quoted instruction itself* spells: IYARTYAKTALOATFLOEWITOATMN.
      // The trick: read instead the first letters of the body's first sentence:
      // "She left the door unlocked. That was the first thing I noticed." -> SLTDU TWTFTIN
      // Real answer is found in the artifact line: "Her name is hidden where light reads first."
      // We make answer = "SLTDUTWTFTIN" => no. Keep simple: name is SADIE — first letters of:
      // "She" "Always" ... we'll surface in the note text below.
      return ["SADIE","sadie"].includes(val.trim().toLowerCase()) || ["SADIE","sadie"].includes(val.trim());
    },
    // override artifact to make the puzzle solvable & elegant
    _override: true,
    artifactFinal: {
      kind: "note",
      lines: [
        "Stranger,",
        "",
        "Should",
        "Anyone",
        "Discover",
        "I",
        "Existed —",
        "",
        "tell them I was kind."
      ]
    },
    hints: [
      "The letter is shaped like a list, not a paragraph. Why?",
      "Read down the left margin.",
      "The first letter of each indented line spells her name."
    ],
    answers: ["SADIE"],
    explain: "Read the first letter of each indented line: S–A–D–I–E."
  },

  // ─── L2 — caesar cipher in a matchbook ───────────────────────────────
  {
    id: 2,
    title: "The Matchbook",
    chapter: "II",
    location: "The Blue Hour · back booth",
    scene: "matchbook",
    body: [
      "The bartender slid it across without a word.",
      "Inside the matchbook, scratched in pencil:",
      "“PHHW PH DW PLGQLJKW. EULQJ WKH NHB.”",
      "Below it — a single number, circled three times: 3."
    ],
    inputLabel: "Decoded message",
    placeholder: "the message",
    hints: [
      "The 3 is doing more work than it looks.",
      "Each letter has been shifted forward in the alphabet.",
      "Shift each letter back by 3. P → M, H → E, …"
    ],
    answers: ["MEET ME AT MIDNIGHT BRING THE KEY","MEETMEATMIDNIGHTBRINGTHEKEY"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Caesar cipher, shift –3. PHHW → MEET. The whole thing decodes to MEET ME AT MIDNIGHT BRING THE KEY."
  },

  // ─── L3 — number-to-letter ladder, sequence on a key ─────────────────
  {
    id: 3,
    title: "The Key",
    chapter: "III",
    location: "Locker 207, Union Station",
    scene: "key",
    body: [
      "The key was warm. Someone had been holding it.",
      "Engraved along the shaft, almost too faint to read:",
      "  19 · 20 · 1 · 18 · 20",
      "And on the bow, in tiny capitals: “WHERE THIS BEGINS, SO DOES SHE.”"
    ],
    inputLabel: "The word on the key",
    placeholder: "one word",
    hints: [
      "Five numbers. Five letters.",
      "1 = A, 2 = B, 3 = C…",
      "19 → S. Keep going."
    ],
    answers: ["START"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "A=1, B=2 … 19·20·1·18·20 → S·T·A·R·T."
  },

  // ─── L4 — clock face, time logic ─────────────────────────────────────
  {
    id: 4,
    title: "The Stopped Clock",
    chapter: "IV",
    location: "Apartment 4B · the kitchen",
    scene: "clock",
    body: [
      "The grandfather clock had stopped at exactly 4:20.",
      "On the floor beside it, a torn page from a notebook:",
      "  “The hour hand always lies. The minute hand always tells the truth — but only after midnight.”",
      "  “The actual time is the angle between them, in degrees, divided by ten.”"
    ],
    inputLabel: "The actual time (a number)",
    placeholder: "a number",
    hints: [
      "At 4:20 the minute hand points at 4 (120°). The hour hand sits 1/3 past the 4 (130°).",
      "The angle between them is 10°.",
      "Divide by ten."
    ],
    answers: ["1","ONE"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "Minute hand at 4 = 120°. Hour hand at 4:20 = 130°. Difference 10°. Divide by ten → 1."
  },

  // ─── L5 — anagram embedded in narrative ──────────────────────────────
  {
    id: 5,
    title: "The Diner",
    chapter: "V",
    location: "Sal's, off Route 9",
    scene: "diner",
    body: [
      "She ordered black coffee and a slice of pie she didn't touch.",
      "When she left, three things stayed on the table:",
      "  a napkin marked with the letters  R · A · E · D · L · N · G · I",
      "  a single dime, tails up,",
      "  and the receipt, which read: “you already know what to do.”",
      "What was the napkin trying to say?"
    ],
    inputLabel: "The word",
    placeholder: "one word",
    hints: [
      "Eight letters. Rearrange them.",
      "It's something you do with a book — and with a clue.",
      "Starts with R."
    ],
    answers: ["READING"],
    // 8 letters: R A E D L N G I — actually ENGRAILD? no.
    // R A E D L N G I — that's 8 letters. Word: DARLINGE? no. Anagram: LEADING + R? nope.
    // Sort: A D E G I L N R = "DARLINGE"? A D E G I L N R → "GERALDIN" / "DARLINGE"
    // Real word from those 8 letters: "LARDENING" no. Let me drop one letter; clue says 7 letters.
    _fix: true,
    answersFinal: ["READING"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "The eight letters rearrange to A WARNING — wait no. The seven letters R·A·E·D·I·N·G rearrange to READING. (The L is a decoy — note the lowercase 'l' on the napkin really being a 1.)"
  },

  // ─── L6 — book cipher / line + word index ────────────────────────────
  {
    id: 6,
    title: "The Library",
    chapter: "VI",
    location: "Carrel 14, third floor",
    scene: "book",
    body: [
      "She'd left the book open on the desk. A bookmark and three numbers, written in red:",
      "  4 · 2 · 3",
      "The page reads:",
      "  1  The fog came in on cat feet that night",
      "  2  and the city slept through everything.",
      "  3  By morning, only the lighthouse remembered.",
      "  4  Some doors stay closed for a reason.",
      "  5  Others ask to be opened, gently."
    ],
    inputLabel: "The word",
    placeholder: "one word",
    hints: [
      "Three numbers: line, word, …?",
      "Line 4. Word 2. Letter 3.",
      "Line 4: 'Some doors stay closed for a reason.' Word 2 is 'doors'. Letter 3 is …"
    ],
    answers: ["O"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Line 4, word 2, letter 3: 'doors' → O."
  },

  // ─── L7 — final. multi-step. assemble previous answers. ──────────────
  {
    id: 7,
    title: "The Door",
    chapter: "VII",
    location: "Where it always was",
    scene: "door",
    body: [
      "You're standing in front of it. The door has no handle, only a five-character lock.",
      "Carved above:",
      "  “Take what she signed, the time she stopped at,",
      "   the verb she rearranged, the letter she hid.”",
      "Then, in smaller script:",
      "  “In that order. No spaces.”"
    ],
    inputLabel: "Combination",
    placeholder: "5 characters",
    hints: [
      "Pull from earlier chapters — the name, the number, the verb, the letter.",
      "I (Sadie) + IV (1) + V (READING) + VI (O)? That's too many.",
      "Take only the first letter of the name, the digit, the first letter of the verb, and the letter: S · 1 · R · O — plus the 'start' from chapter III. STAR1? No — the line says 'in that order': name, time, verb, letter. So: S · 1 · R · O. Four characters. Add T from the engraved key (chapter III: where this BEGINS). S T 1 R O."
    ],
    answers: ["S1TRO","ST1RO","STIRO","STROI","S1RO","ST1ROI"],
    // Real intended: S (Sadie's initial) · 1 (the time) · R (Reading's initial) · O (the letter)
    // Plus T (chapter III "where this begins") — but order from poem: name, time, verb, letter = 4. Add 5th: chapter III ("the key that began it") = "T".
    // We'll accept: S1RTO and S1TRO and S T (where begins) … too fiddly.
    // Simplify: poem says four items but five-character lock. The hidden fifth: order says "in that order" — the answer is literally the first letter of each clue's TITLE.
    _final: true,
    answersFinal: ["LMKSDB"],
    explain: "Letter, Matchbook, Key, Stopped clock, Diner, Book → first letters L·M·K·S·D·B."
  }
];

// Final clean version of the puzzle list — used by the engine.
// (The above is annotated for design reasoning. Below is the source of truth.)
const LEVELS = [
  {
    id: 1,
    title: "The Letter",
    chapter: "I",
    location: "39 Hawthorn Lane · 11:47 p.m.",
    scene: "letter",
    body: [
      "She left the door unlocked. That was the first thing I noticed.",
      "On the desk: a sealed envelope, a half-empty glass, a smell of cedar.",
      "The letter inside was strangely shaped — like a list, not a paragraph.",
      "It said only this:"
    ],
    artifact: { kind: "letter", lines: [
      "Stranger,",
      "",
      "Should",
      "Anyone",
      "Discover",
      "I",
      "Existed —",
      "",
      "tell them I was kind.",
      "",
      "— "
    ]},
    prompt: "What was her name?",
    inputLabel: "Her name",
    placeholder: "a name",
    hints: [
      "The shape of the letter is the puzzle. Why are some lines indented and one-word-long?",
      "Read down the left margin of the indented lines.",
      "S … A … D … I … E."
    ],
    answers: ["SADIE"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "The first letters of the indented one-word lines spell SADIE."
  },

  {
    id: 2,
    title: "The Matchbook",
    chapter: "II",
    location: "The Blue Hour · back booth",
    scene: "matchbook",
    body: [
      "The bartender slid it across without a word.",
      "Inside, in pencil, smudged but legible:",
      "Below it, a single number circled three times — a 3."
    ],
    artifact: { kind: "matchbook", code: "PHHW PH DW PLGQLJKW", sub: "— S." },
    prompt: "What does it say?",
    inputLabel: "Decoded message",
    placeholder: "the message",
    hints: [
      "The 3 is doing more work than it looks.",
      "Shift each letter — backward this time — by three.",
      "P → M, H → E, H → E, W → T … "
    ],
    answers: ["MEET ME AT MIDNIGHT","MEETMEATMIDNIGHT"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Caesar shift –3. PHHW PH DW PLGQLJKW → MEET ME AT MIDNIGHT."
  },

  {
    id: 3,
    title: "The Key",
    chapter: "III",
    location: "Locker 207, Union Station",
    scene: "key",
    body: [
      "The key was warm. Someone had been holding it.",
      "Engraved along the shaft, almost too faint to read:",
      "And on the bow, in capitals so small they might have been a threat:",
      "“WHERE THIS BEGINS, SO DOES SHE.”"
    ],
    artifact: { kind: "key", numbers: [19,20,1,18,20] },
    prompt: "What word does the key spell?",
    inputLabel: "The word on the key",
    placeholder: "one word",
    hints: [
      "Five numbers. Five letters.",
      "A=1, B=2, C=3 …",
      "19 is S. Keep going."
    ],
    answers: ["START"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "A=1 … 19·20·1·18·20 → S·T·A·R·T."
  },

  {
    id: 4,
    title: "The Stopped Clock",
    chapter: "IV",
    location: "Apartment 4B · the kitchen",
    scene: "clock",
    body: [
      "The grandfather clock had stopped at exactly four-twenty.",
      "Beside it, a torn page from a notebook, in her handwriting:",
      "“The hour hand always lies. The minute hand always tells the truth — but only after midnight.”",
      "“The real time is the angle between them, in degrees, divided by ten.”"
    ],
    artifact: { kind: "clock", time: "4:20" },
    prompt: "What is the real time?",
    inputLabel: "A single number",
    placeholder: "a number",
    hints: [
      "Where does the minute hand point at :20? At the 4 — that's 120°.",
      "The hour hand at 4:20 sits one-third past the 4 — that's 130°.",
      "Difference: 10°. Now divide."
    ],
    answers: ["1","ONE"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "Minute hand at the 4 → 120°. Hour hand at 4:20 → 130°. Diff = 10°. /10 = 1."
  },

  {
    id: 5,
    title: "The Diner",
    chapter: "V",
    location: "Sal's, off Route 9",
    scene: "diner",
    body: [
      "She ordered black coffee and a slice of pie she didn't touch.",
      "When she left, three things stayed on the table:",
      "  · a napkin marked with the letters  R · A · E · D · I · N · G",
      "  · a single dime, tails up,",
      "  · and a receipt that read: “you already know what to do.”",
      "What was the napkin trying to say?"
    ],
    artifact: { kind: "diner", letters: ["R","A","E","D","I","N","G"] },
    prompt: "Rearrange the letters.",
    inputLabel: "The word",
    placeholder: "one word",
    hints: [
      "Seven letters. One word.",
      "Something you're doing right now.",
      "Starts with R."
    ],
    answers: ["READING"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "R·A·E·D·I·N·G rearranges to READING. You've been doing it the whole time."
  },

  {
    id: 6,
    title: "The Library",
    chapter: "VI",
    location: "Carrel 14, third floor",
    scene: "book",
    body: [
      "She'd left the book open on the desk. A bookmark sat on the page, and three numbers were written on it in red ink:",
      "  4 · 2 · 3"
    ],
    artifact: { kind: "book", lines: [
      "The fog came in on cat feet that night",
      "and the city slept through everything.",
      "By morning, only the lighthouse remembered.",
      "Some doors stay closed for a reason.",
      "Others ask to be opened, gently."
    ], code: [4,2,3] },
    prompt: "Find the letter she left for you.",
    inputLabel: "A single letter",
    placeholder: "one letter",
    hints: [
      "Three numbers, three things to count.",
      "Line, then word, then letter.",
      "Line 4: 'Some doors stay closed for a reason.' Word 2: 'doors'. Letter 3 is…"
    ],
    answers: ["O"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Line 4 → 'Some doors stay closed for a reason.' Word 2 → 'doors'. Letter 3 → O."
  },

  {
    id: 7,
    title: "The Door",
    chapter: "VII",
    location: "Where it always was",
    scene: "door",
    body: [
      "You're standing in front of it. The door has no handle — just six brass dials, each cut with the alphabet.",
      "Above the dials, carved deep:",
      "“Six chapters, six titles. Take the first letter of each, in order. The door knows the rest.”"
    ],
    artifact: { kind: "door", slots: 6 },
    prompt: "Open the door.",
    inputLabel: "Six letters",
    placeholder: "L M K S D B",
    hints: [
      "Six chapters precede this one. Each had a name.",
      "The Letter, The Matchbook, The Key, The Stopped Clock, The Diner, The Library.",
      "L · M · K · S · D · L."
    ],
    answers: ["LMKSDL"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Letter · Matchbook · Key · Stopped Clock · Diner · Library → L·M·K·S·D·L. The door opens."
  }
];

window.LEVELS = LEVELS;
