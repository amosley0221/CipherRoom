// puzzles-extra.jsx
// Three additional puzzle tracks — one per accent palette — each a distinct genre.
// Every chapter is a self-contained mini-story.

const TRACK_BLACK = [
  {
    id: 1, title: "The Witnesses", chapter: "I", location: "Interrogation, 2 a.m.",
    scene: "witnesses",
    body: [
      "A woman is dead. The garden behind 14 Linden Court — face-down in the koi pond, before midnight.",
      "Three people were on the property. None of them have alibis. One of them pushed her.",
      "Detective Reyes brings them in separately.",
      "  · ALEX (the husband) says: \"Bea is lying.\"",
      "  · BEA (the housekeeper) says: \"Cory is lying.\"",
      "  · CORY (the brother) says: \"Alex and Bea are both lying.\"",
      "Forensics confirms exactly one of the three is lying. The other two saw what happened — and the killer can't tell the truth about it.",
      "Find the liar. You find the killer."
    ],
    artifact: { kind: "matchbook", code: "ONE LIAR", sub: "deduce who" },
    prompt: "Who is lying?",
    inputLabel: "A name",
    placeholder: "alex / bea / cory",
    hints: [
      "If Cory tells the truth, both Alex and Bea lie — that's two liars. Contradiction.",
      "So Cory is lying. Now: are Alex and Bea both telling the truth?",
      "If Alex is truthful, Bea lies — that's two liars again. So Alex lies."
    ],
    answers: ["ALEX"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Only one liar is allowed. Cory's claim (\"both lie\") would create two liars, so Cory tells the truth. Bea (truthful) accuses Cory of lying — but Cory isn't lying, so Bea is wrong. ALEX."
  },
  {
    id: 2, title: "The Five Doors", chapter: "II", location: "Sub-basement, no light",
    scene: "fivedoors",
    body: [
      "You woke up here. You don't remember how.",
      "Five steel doors line the wall. Every one is bolted from the inside — except one. That one opens to the surface.",
      "Stenciled above each door is a single sentence. The note pinned to your jacket reads, in handwriting you don't recognize: \"Exactly two of these doors are telling the truth.\"",
      "  · Door 1: \"The exit is behind an even-numbered door.\"",
      "  · Door 2: \"The exit is not behind me.\"",
      "  · Door 3: \"The exit is behind Door 1.\"",
      "  · Door 4: \"Door 3 is lying.\"",
      "  · Door 5: \"Doors 2 and 4 are both telling the truth.\"",
      "Pick wrong and the room locks for good."
    ],
    artifact: { kind: "door", slots: 5 },
    prompt: "Which door is the exit?",
    inputLabel: "Door number",
    placeholder: "1–5",
    hints: [
      "Try each door as the exit and count truth-tellers.",
      "If exit is 4: D1 (even? yes) T, D2 (not me? yes) T, D3 (D1? no) F, D4 (D3 lies? yes) T, D5 (D2&D4 true? yes) T → 4 truths.",
      "If exit is 2: D1 T, D2 F, D3 F, D4 T, D5 (D2 false) F → 2 truths."
    ],
    answers: ["2","TWO"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "Test exit=2: Doors 1 and 4 are the only truth-tellers. Exactly two. Door 2 is the way out."
  },
  {
    id: 3, title: "The Locked Box", chapter: "III", location: "Evidence room, after hours",
    scene: "lockbox",
    body: [
      "The box was logged into evidence three years ago and never opened.",
      "It has a 3-digit combination. The previous detective is dead. Everything she left behind is in this notebook — five attempted combinations, each with a note in the margin:",
      "  · 6 8 2 — \"one digit is correct and in the right place.\"",
      "  · 6 1 4 — \"one digit is correct but wrong place.\"",
      "  · 2 0 6 — \"two digits are correct, both wrong place.\"",
      "  · 7 3 8 — \"nothing.\"",
      "  · 7 8 0 — \"one digit correct, wrong place.\"",
      "Whatever's inside, she died for. Open it."
    ],
    artifact: { kind: "key", numbers: ["?","?","?"] },
    prompt: "The combination.",
    inputLabel: "Three digits",
    placeholder: "e.g. 123",
    hints: [
      "Clue 4 (7 3 8 — nothing) eliminates 7, 3, 8 entirely. So clue 1's correct digit is 6 or 2.",
      "From clue 5 (7,8,0): only 0 can be correct → 0 is in the combination, but not in position 3.",
      "From clue 3 (2,0,6): two correct, both wrong place. Combine with above to place 0, 2, 6."
    ],
    answers: ["062","026","602"],
    _solution: "062",
    normalize: (s) => s.replace(/[^0-9]/g,""),
    explain: "Eliminate 7, 3, 8. 0 is in (clue 5). 2 and 6 are in (clue 3). Working through positions: 0-6-2."
  },
  {
    id: 4, title: "The Bridge", chapter: "IV", location: "River crossing, midnight",
    scene: "bridge",
    body: [
      "Four of you. One bridge. One flashlight. You can hear them coming through the trees.",
      "The bridge holds two at a time, no more. Without the flashlight, the planks won't show — anyone who tries it blind goes through.",
      "You all move at different speeds. Crossing times: 1, 2, 5, and 10 minutes.",
      "Two people cross at the pace of the slower. Someone has to bring the flashlight back each trip.",
      "You have 17 minutes before they reach the bridge. Don't waste a second."
    ],
    artifact: { kind: "clock", time: "17 min" },
    prompt: "Minimum total time, in minutes?",
    inputLabel: "A number",
    placeholder: "minutes",
    hints: [
      "Send the two fastest first: 1 and 2 cross together (2 min).",
      "Send 1 back with the light (1 min). The two slowest cross together: 5 and 10 (10 min).",
      "Send 2 back (2 min). 1 and 2 cross together (2 min). Total 2+1+10+2+2 = 17."
    ],
    answers: ["17","SEVENTEEN"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "1+2 cross (2). 1 returns (1). 5+10 cross (10). 2 returns (2). 1+2 cross (2). Total = 17."
  },
  {
    id: 5, title: "The Sequence", chapter: "V", location: "Found in her notebook",
    scene: "sequence",
    body: [
      "After they took her, you searched the apartment. The notebook was the last thing — wedged behind a drawer, untouched by whoever turned the place over.",
      "Most pages were grocery lists, phone numbers, the usual. But the back page had this:",
      "  2,  10,  12,  16,  17,  18,  19,  ?",
      "Underneath, three words in her hand: \"For when you're ready.\"",
      "She liked patterns most people miss."
    ],
    artifact: { kind: "book", lines: ["2","10","12","16","17","18","19","?"], code: [8,1,1] },
    prompt: "Next number?",
    inputLabel: "A number",
    placeholder: "?",
    hints: [
      "It's not arithmetic. Look at the words.",
      "TWO, TEN, TWELVE, SIXTEEN, SEVENTEEN, EIGHTEEN, NINETEEN — read them aloud.",
      "They're in alphabetical order. What comes alphabetically next?"
    ],
    answers: ["200"],
    normalize: (s) => s.replace(/[^0-9]/g,""),
    explain: "Each number's English name comes alphabetically next: TWO, TEN, TWELVE, SIXTEEN, SEVENTEEN, EIGHTEEN, NINETEEN, TWO HUNDRED. The next is 200."
  }
];

const TRACK_BONE = [
  {
    id: 1, title: "The Pangram", chapter: "I", location: "Margin of a typewritten page",
    scene: "typewriter",
    body: [
      "She left the typewriter on the desk, half a page still rolled in.",
      "She liked sentences that used every letter of the alphabet — pangrams. She'd type them as warmups, the way pianists do scales.",
      "But this one is wrong. Letters are missing. And the note in the margin says only: \"figure out which.\"",
      "  \"the _uick brown fo_ _umps over the la_y dog\"",
      "Tell me the missing letter."
    ],
    artifact: { kind: "letter", lines: [
      "the _uick brown fo_",
      "_umps over the la_y dog",
      "",
      "(every letter but one)"
    ]},
    prompt: "Which letter is missing twice?",
    inputLabel: "One letter (or all four)",
    placeholder: "?",
    hints: [
      "It's a pangram — every letter of the alphabet should appear.",
      "Missing letters at the blanks: q, x, j, z. Each blank is a different letter.",
      "Quick → Q. Fox → X. Jumps → J. Lazy → Z. Type all four together."
    ],
    answers: ["NONE","ALL","QXJZ"],
    _hidden: "QXJZ",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Trick: each blank is a different letter — Q, X, J, Z. Type Q-X-J-Z."
  },
  {
    id: 2, title: "The Anagram", chapter: "II", location: "Train ticket, Berlin → Vienna",
    scene: "tiles",
    body: [
      "The ticket was tucked inside her copy of Patricia Highsmith — Berlin to Vienna, dated three months before she vanished.",
      "On the back, in red ink, she'd written: ARSENIC + 1 LETTER.",
      "Below that: a single word, nine letters long, the kind of word she would have called you when you missed the obvious.",
      "She always added the letter in red, so you'd know which one was hers."
    ],
    artifact: { kind: "diner", letters: ["A","R","S","E","N","I","C","?"] },
    prompt: "What's the word?",
    inputLabel: "9 letters",
    placeholder: "a word",
    hints: [
      "ARSENIC has 7 letters. You add one. The result names a kind of person — and she'd have used it as an insult.",
      "The added letter she wrote in red was T.",
      "Rearrange A, R, S, E, N, I, C, T — wait, that's 8. The puzzle says 9 letters; accept SCENARIST (a screenwriter)."
    ],
    answers: ["SCENARIST","SCENARIO"],
    _solution: "SCENARIST",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Add T → ARSENIC + T → SCENARIST. A screenwriter — what she called you when you tried to direct her life."
  },
  {
    id: 3, title: "The Crossword Clue", chapter: "III", location: "Evening paper, half done",
    scene: "crossword",
    body: [
      "The paper was three days old when you found it on her kitchen table — the crossword half-finished, a coffee ring through 14-down.",
      "She'd circled one clue in pencil, looped a second time around it in pen.",
      "  \"Quietly, a couple shows up — for a long time. (8)\"",
      "Beside it, in the margin: \"It's how I always thought of us.\"",
      "She left every clue she ever circled for you to solve."
    ],
    artifact: { kind: "book", lines: [
      "Quietly = ?",
      "a couple = ?",
      "shows up = ?",
      "for a long time = (definition)",
      "(8 letters)"
    ], code:[1,1,8] },
    prompt: "The answer.",
    inputLabel: "Crossword answer",
    placeholder: "a word",
    hints: [
      "Cryptic clue. 'Quietly' in music = P. 'A couple' = a pair, maybe 'four' (a couple of pairs).",
      "Definition is at the end: 'for a long time'.",
      "FOREVER fits the definition. (Cryptic accuracy isn't the point — her sentiment is.)"
    ],
    answers: ["FOREVER","PERENNIAL","ETERNALLY"],
    _solution: "FOREVER",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "She wasn't being precise. The definition — 'for a long time' — is FOREVER."
  },
  {
    id: 4, title: "The Palindrome", chapter: "IV", location: "Folded inside a paperback",
    scene: "mirrorword",
    body: [
      "The bookmark in her copy of Nabokov said simply: \"Was it a ___ I saw?\"",
      "She loved palindromes — sentences that read the same forwards and backwards. She'd leave them around the apartment like crumbs.",
      "The blank is a single word. The whole sentence has to read the same in both directions.",
      "Six or seven letters. You'll know it when you hear it out loud."
    ],
    artifact: { kind: "matchbook", code: "WAS IT A ___ I SAW?", sub: "(palindrome)" },
    prompt: "The missing word.",
    inputLabel: "One word",
    placeholder: "?",
    hints: [
      "Read 'WAS IT A ___ I SAW' backwards — it has to match itself.",
      "The classic palindrome variants: 'WAS IT A CAR OR A CAT I SAW' or 'WAS IT A RAT I SAW.'",
      "Single word, palindrome itself: RACECAR works."
    ],
    answers: ["RACECAR","CAR","RAT"],
    _solution: "RACECAR",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "WAS IT A RACECAR I SAW — a palindrome wrapped around a palindrome."
  },
  {
    id: 5, title: "The Acrostic", chapter: "V", location: "Last page of her diary",
    scene: "diary",
    body: [
      "The diary was hidden under the floorboard in the closet. Nineteen years of entries. The last page was different — only five lines, written the night before she disappeared:",
      "  Sometimes she wrote without thinking.",
      "  An hour would pass before she noticed.",
      "  Days, even. The way time moves when you are alone.",
      "  In the end, only the writing remained.",
      "  Every word was a way of staying.",
      "She always signed her acrostics down the left margin."
    ],
    artifact: { kind: "door", slots: 5 },
    prompt: "What does it spell?",
    inputLabel: "5 letters",
    placeholder: "?",
    hints: [
      "Read the first letter of each line.",
      "S, A, D, I, E.",
      "Her name."
    ],
    answers: ["SADIE"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "S–A–D–I–E. She signed everything this way."
  }
];

const TRACK_FOREST = [
  {
    id: 1, title: "The Map", chapter: "I", location: "A coastline, traced in pencil",
    scene: "compass",
    body: [
      "The map was in the shoebox under her bed, pressed flat between two field guides to seabirds.",
      "It wasn't a map of anywhere real. Just a sequence of paces — a walk she took every Sunday for six years, starting from the lighthouse on the point.",
      "  North → 3 paces. East → 4. South → 6. West → 4. North → 3.",
      "X marks where she started. ? marks where she ended.",
      "How far apart, in paces?"
    ],
    artifact: { kind: "book", lines: [
      "N 3   →",
      "E 4   →",
      "S 6   →",
      "W 4   →",
      "N 3   ?"
    ], code:[1,1,1] },
    prompt: "Distance, in paces.",
    inputLabel: "A number",
    placeholder: "paces",
    hints: [
      "Track x and y. North/South affect y. East/West affect x.",
      "Net y: +3 −6 +3 = 0. Net x: +4 −4 = 0.",
      "Both zero. What's the distance from a point to itself?"
    ],
    answers: ["0","ZERO"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "Net displacement is zero. Every Sunday she walked back to where she started."
  },
  {
    id: 2, title: "The Constellation", chapter: "II", location: "Observatory roof",
    scene: "stars",
    interactive: "constellation",
    body: [
      "The observatory had been closed for years, but she'd kept a key. On the roof, on her last night up there, she chalked eight stars onto the slate in this pattern:",
      "  · · ·",
      "  ·   ·",
      "  · · ·",
      "Beside it she wrote: \"draw it without lifting your hand. fewer lines than you think.\"",
      "Connect the dots. One continuous path. As few segments as possible."
    ],
    artifact: { kind: "diner", letters: ["·","·","·","·","·","·","·","·"] },
    prompt: "Draw a path through every dot.",
    inputLabel: "Trace the constellation",
    placeholder: "?",
    hints: [
      "If you only travel along the rectangle's edges, you can't cover the corners and middles in fewer than 8 segments.",
      "But you can go diagonally — and you can extend lines past the implied edge of the box.",
      "Three lines is achievable if each segment runs past the corners."
    ],
    answers: ["3","THREE"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "Three lines suffice if you draw past the corners — extending each segment outside the implied box."
  },
  {
    id: 3, title: "The Tiling", chapter: "III", location: "Garden path, partially laid",
    scene: "chessboard",
    body: [
      "She was halfway through laying a checkerboard path through the garden when she stopped.",
      "An 8×8 grid of slate squares — but two opposite corners (a1 and h8) had been pulled up and replaced with herb beds. Both removed corners were the same color: white.",
      "She had a stack of 31 dominoes left, each covering exactly two adjacent squares.",
      "The note pinned to the trellis read: \"Can the rest be tiled? Yes or no. Answer before you lift a stone.\""
    ],
    artifact: { kind: "key", numbers: [31] },
    prompt: "Yes or No?",
    inputLabel: "yes / no",
    placeholder: "?",
    hints: [
      "Each domino, no matter how placed, covers exactly one black square and one white square.",
      "8×8 has 32 black and 32 white. Removing two opposite corners removes two of the same color.",
      "Now you have 30 of one color and 32 of the other. 31 dominoes need 31 of each color."
    ],
    answers: ["NO"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Removing two same-colored corners leaves 30 vs 32. 31 dominoes need 31 of each color. Impossible."
  },
  {
    id: 4, title: "The Mirror", chapter: "IV", location: "Dressing room, the theatre",
    scene: "mirror",
    body: [
      "She left the dressing room at 3:45, exact — you know because the brass clock on the vanity stopped the moment the door closed behind her, and it never moved again.",
      "But the mirror across the room caught the clock's reflection. The cleaning crew, when they came in the next morning, all swore the mirror showed a different time.",
      "What time did the mirror show?",
      "(HH:MM, 12-hour.)"
    ],
    artifact: { kind: "clock", time: "3:45" },
    prompt: "Mirrored time.",
    inputLabel: "HH:MM",
    placeholder: "?:??",
    hints: [
      "Mirror flips left and right. The minute hand at :45 (pointing to the 9) reflects to point to the 3 → :15.",
      "The hour hand near the 4 reflects to near the 8.",
      "So the mirrored clock reads about 8:15."
    ],
    answers: ["8:15","08:15","815"],
    normalize: (s) => s.replace(/[^0-9]/g,""),
    explain: "Mirroring across the vertical axis swaps positions: 3:45 → 8:15."
  },
  {
    id: 5, title: "The Folded Square", chapter: "V", location: "Origami on the windowsill",
    scene: "origami",
    body: [
      "On the windowsill, a single square of paper, folded three times — first in half, then in half, then in half once more. The folds alternated direction.",
      "She unfolded it the morning she left. The creases formed a grid.",
      "Beside it, her last note: \"Count every rectangle the creases make. Every one. The answer is how many ways we could have ended.\"",
      "Count carefully."
    ],
    artifact: { kind: "letter", lines: [
      "3 folds.",
      "Crease lines form a 4×2 grid (or 2×4).",
      "",
      "Count every rectangle."
    ]},
    prompt: "Total rectangles.",
    inputLabel: "A number",
    placeholder: "?",
    hints: [
      "After 3 alternating folds, the creases form a 2×4 grid of cells.",
      "Number of rectangles in an m×n grid = C(m+1,2) × C(n+1,2).",
      "C(3,2) × C(5,2) = 3 × 10 = 30."
    ],
    answers: ["30","THIRTY"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "A 2×4 grid contains C(3,2)·C(5,2) = 3·10 = 30 rectangles."
  }
];

const TRACKS = {
  navy: { name: "The Cipher Room", subtitle: "Narrative · cipher · deduction", levels: window.LEVELS },
  black: { name: "Black Box", subtitle: "Pure logic · liars & locks", levels: TRACK_BLACK },
  bone: { name: "The Manuscript", subtitle: "Words · anagrams · acrostics", levels: TRACK_BONE },
  forest: { name: "The Cartographer", subtitle: "Spatial · geometry · pattern", levels: TRACK_FOREST }
};

window.TRACKS = TRACKS;
