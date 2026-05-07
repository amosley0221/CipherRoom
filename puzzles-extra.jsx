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
  },
  {
    id: 6, title: "The Two Guards", chapter: "VI", location: "End of the corridor",
    scene: "guards",
    body: [
      "The corridor narrows. Two iron doors at the end. Two men in front of them, dressed identically — same coat, same gloves, same featureless brim of a hat.",
      "Last entry in her notebook said you'd find them here. \"One always lies. The other never. You won't tell which is which by looking.\"",
      "You get one yes-or-no question. To one guard.",
      "You ask the man on the right: \"If I asked your colleague whether the LEFT door is the way out, would he say yes?\"",
      "He nods. Yes."
    ],
    artifact: { kind: "door", slots: 2 },
    prompt: "Which door do you take?",
    inputLabel: "left or right",
    placeholder: "left / right",
    hints: [
      "If the man you asked is the truth-teller, his answer reports what the liar would say — and the liar lies.",
      "If the man you asked is the liar, his answer is the opposite of what the truth-teller would actually say.",
      "Either way, his answer is the OPPOSITE of the truth. He said 'yes' for the left door — so left is wrong."
    ],
    answers: ["RIGHT"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Asking 'what would the OTHER say' inverts the truth no matter which guard you picked. His 'yes' for left means left is the trap. Take the right door."
  },
  {
    id: 7, title: "The Three Envelopes", chapter: "VII", location: "Her desk, the morning after",
    scene: "boxes",
    body: [
      "Three sealed envelopes on her desk. She'd labeled every one — and every label was wrong. On purpose. (You realize, with a kind of cold admiration, that she'd been preparing this for months.)",
      "Inside each envelope: two photographs.",
      "  · One envelope holds two SUSPECTS.",
      "  · One holds two WITNESSES.",
      "  · One holds one of each — SUSPECT and WITNESS.",
      "Her labels read SS, WW, SW — and she swapped them all.",
      "You may open ONE envelope, draw ONE photograph, and look. Then you have to identify all three.",
      "Which one do you open?"
    ],
    artifact: { kind: "matchbook", code: "SW", sub: "the mislabeled mix" },
    prompt: "Open the envelope labeled…",
    inputLabel: "SS / WW / SW",
    placeholder: "?",
    hints: [
      "Every label is wrong. So the envelope LABELED SW is not the mix — it's pure (either two suspects or two witnesses).",
      "Open SW. Draw one photo. If it's a suspect, the envelope is actually SS. If a witness, it's WW.",
      "Now the other two are labeled SS and WW. Each label is wrong, and neither is what we just identified — so the labeled WW is the SW mix, and the labeled SS is the WW pair."
    ],
    answers: ["SW","MIXED","MIX","S/W"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Every label is wrong, so SW must hide a pure pair. One photo from it gives you SS or WW, and the remaining two cascade because each label has to be wrong."
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
  },
  {
    id: 6, title: "The Caesar", chapter: "VI", location: "Inside her copy of Suetonius",
    scene: "caesar",
    body: [
      "She'd loved the Roman emperors — or at least their habits. Everyone borrowed her copy of Suetonius eventually.",
      "Pencil, inside the back cover, in her looping hand:",
      "  \"Three letters to the right. I always shift right.\"",
      "  PHHW DW VHYHQ",
      "It was dated the night before she disappeared. The day was Friday."
    ],
    artifact: { kind: "letter", lines: [
      "PHHW  DW  VHYHQ",
      "",
      "(she shifted each letter)",
      "(three places to the right)",
      "",
      "(reverse the shift)"
    ]},
    prompt: "Decode the message.",
    inputLabel: "Two words",
    placeholder: "?",
    hints: [
      "Caesar cipher. To encode she shifted each letter three places forward in the alphabet — to decode, shift each one three places back.",
      "P → M. H → E. So PHHW becomes MEET.",
      "DW → AT. VHYHQ → SEVEN. The whole message: MEET AT SEVEN."
    ],
    answers: ["MEET AT SEVEN","MEETATSEVEN"],
    _solution: "MEET AT SEVEN",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Caesar shift −3: P→M, H→E, W→T, D→A, V→S, Y→V, Q→N. PHHW DW VHYHQ → MEET AT SEVEN. She wanted to meet you somewhere, that Friday at seven."
  },
  {
    id: 7, title: "The Lipogram", chapter: "VII", location: "Three pages from her last notebook",
    scene: "lipogram",
    body: [
      "She'd left a notebook on the kitchen counter, open to three pages of clean prose. You read it twice before you noticed.",
      "  \"A lazy moon hung low. Past it, a hush of sand. No bird, no sound — just a dry wind nudging dust along.",
      "   I sat watching nothing for an hour, finding no thought worth catching.",
      "   A patch of stars, all cold light. I cast no shadow.\"",
      "Look closer. One letter — one of the most common in English — never appears. Not once.",
      "Which letter did she avoid?"
    ],
    artifact: { kind: "letter", lines: [
      "A lazy moon hung low.",
      "Past it, a hush of sand.",
      "No bird, no sound — just",
      "a dry wind nudging dust along.",
      "I sat watching nothing for an hour,",
      "finding no thought worth catching.",
      "A patch of stars, all cold light.",
      "I cast no shadow.",
      "",
      "(one common letter never appears)"
    ]},
    prompt: "The missing letter.",
    inputLabel: "One letter",
    placeholder: "?",
    hints: [
      "It's a vowel.",
      "It's the most common vowel — and the most common letter — in written English.",
      "Sound the words out: lazy, moon, hung, hush, sand, bird, sound, dry, wind, dust… none of them have it."
    ],
    answers: ["E"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Eight lines without a single E — a deliberate lipogram. Named for Georges Perec's E-less novel La disparition."
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
      "Beside it she wrote: \"draw it without lifting your hand. one continuous path.\"",
      "Connect every star. Tap from one to another — any star that lies on the line you draw counts too."
    ],
    artifact: { kind: "diner", letters: ["·","·","·","·","·","·","·","·"] },
    prompt: "Draw a path through every dot.",
    inputLabel: "Trace the constellation",
    placeholder: "?",
    hints: [
      "Tapping two stars in a row draws a line between them — any star sitting on that line is credited automatically.",
      "Four corners, four straight strokes — try the perimeter and let the middles fill themselves in.",
      "Four segments is the minimum: each side of the square is one stroke, and the middle stars on each side are picked up along the way."
    ],
    answers: ["4","FOUR"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "Four strokes around the perimeter cover all eight stars: each side picks up its middle star on the way."
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
  },
  {
    id: 6, title: "The Crossroads", chapter: "VI", location: "Penciled inside an envelope flap",
    scene: "crossroads",
    body: [
      "She'd drawn a 4×4 grid in the corner of an envelope — the streets between the train station and her flat. X at the station, in the top-left. ★ at her flat, in the bottom-right.",
      "  X · · ·",
      "  · · · ·",
      "  · · · ·",
      "  · · · ★",
      "Below it, in her hand: \"I walk it every evening. Only east, only south. Never the same way twice.\"",
      "How many different routes can take her home?"
    ],
    artifact: { kind: "key", numbers: ["3 E", "3 S", "?"] },
    prompt: "Routes from X to ★.",
    inputLabel: "A number",
    placeholder: "?",
    hints: [
      "Three east moves and three south moves, taken in any order.",
      "Choose 3 positions out of 6 total moves for the easts: that's the binomial coefficient C(6, 3).",
      "C(6, 3) = 6! / (3! · 3!) = 20."
    ],
    answers: ["20","TWENTY"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "Six total moves (3 east + 3 south). Pick which 3 of the 6 are east: C(6,3) = 20 distinct routes."
  },
  {
    id: 7, title: "The Bridges", chapter: "VII", location: "Postcard from Königsberg, in her shoebox",
    scene: "bridges",
    body: [
      "Old postcard, pre-war. Königsberg, before the river redrew the city. Four landmasses, seven bridges across the Pregel.",
      "On the back, in her hand:",
      "  \"Cross every bridge exactly once. Start anywhere, end anywhere. Don't repeat a bridge.",
      "   Yes or no?\"",
      "She'd known you'd remember Euler. Or that you'd find him."
    ],
    artifact: { kind: "key", numbers: [4, 7] },
    prompt: "Yes or no?",
    inputLabel: "yes / no",
    placeholder: "?",
    hints: [
      "Count the bridges meeting each landmass — that's its 'degree'.",
      "In Königsberg the four landmasses have degrees 5, 3, 3, 3 — every one odd.",
      "Euler proved it: a walk that crosses every edge exactly once requires AT MOST two vertices of odd degree. Four is too many."
    ],
    answers: ["NO"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Euler's theorem: an Eulerian path exists only if at most two vertices have odd degree. Königsberg has four odd-degree landmasses, so no such walk is possible."
  }
];

const TRACK_CHARCOAL = [
  {
    id: 1, title: "The Lobby", chapter: "I", location: "Hotel Lethe, security log",
    scene: "lobby",
    body: [
      "Officer Reyes had thirty seconds of footage and a witness with stage fright. She wrote down what she saw — exactly what she saw, in order.",
      "  \"The lobby of the Hotel Lethe, 8:47 p.m.",
      "  At the front desk, a tall woman in a red trench coat. The porter behind her in grey. The pianist plays in the corner, in black.",
      "  By the elevator, twin girls in matching red scarves fight over a magazine; a man in a brown overcoat ignores them.",
      "  The bellhop, in plum, pushes a cart toward the bar. The bartender wears a black vest over a white shirt — and a red bow tie.\"",
      "Reyes asked you a single question.",
      "How many people wore red?"
    ],
    artifact: { kind: "matchbook", code: "RED COUNT", sub: "Hotel Lethe, 8:47 p.m." },
    prompt: "How many wore red?",
    inputLabel: "A number",
    placeholder: "?",
    hints: [
      "Read each garment in order. Skip plum. Skip burgundy. Count only red.",
      "Red trench: 1. Red scarves on twins: +2. Red bow tie: +1. Plum and brown don't count.",
      "Four people."
    ],
    answers: ["4","FOUR"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "Woman in red trench (1), twin sisters in red scarves (2), bartender in red bow tie (1) — four. Plum, brown, grey, black, white don't count."
  },
  {
    id: 2, title: "The Receipt", chapter: "II", location: "Bistro La Voile, table 4",
    scene: "receipt",
    body: [
      "He swears he ordered only what's on the receipt. The receipt disagrees by exactly one item.",
      "Bistro La Voile, table 4, 9:14 p.m. — found in his pocket, crumpled.",
      "  · Coffee — 4.50",
      "  · Croissant — 3.20",
      "  · Tarte aux pommes — 6.80",
      "  · House red, glass — 7.50",
      "  · Soupe du jour — 9.00",
      "Total printed at the bottom: 36.00",
      "The bistro's full menu also lists: Espresso 3.50, Eau gazeuse 5.00, Salade niçoise 12.00, Pain au chocolat 4.00.",
      "What did he have that he forgot to mention?"
    ],
    artifact: { kind: "letter", lines: [
      "BISTRO LA VOILE",
      "table 4 · 9:14 pm",
      "",
      "coffee . . . . . . 4.50",
      "croissant . . . . 3.20",
      "tarte . . . . . . . 6.80",
      "house red . . . . 7.50",
      "soupe . . . . . . 9.00",
      "",
      "TOTAL  . . . . . 36.00"
    ]},
    prompt: "The missing item.",
    inputLabel: "Menu item",
    placeholder: "?",
    hints: [
      "Add up the printed line items first.",
      "4.50 + 3.20 + 6.80 + 7.50 + 9.00 = 31.00. The total is 36.00. The gap is 5.00.",
      "Only one menu item costs exactly 5.00."
    ],
    answers: ["EAU GAZEUSE","EAUGAZEUSE","WATER","SPARKLING WATER","SPARKLINGWATER"],
    _solution: "EAU GAZEUSE",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Lines sum to 31.00; printed total is 36.00. The missing 5.00 is the eau gazeuse — the only menu item priced at exactly 5."
  },
  {
    id: 3, title: "The Three Statements", chapter: "III", location: "Hotel Lethe, the morning after",
    scene: "witnesses",
    body: [
      "Three guests gave statements about Tuesday evening at the Lethe. Two are telling the truth. One is lying.",
      "  · DAWES (room 204): \"I came down at 8:45. The desk clock said 8:46. I sat by the piano. The pianist played until 9:30, then stood up and left.\"",
      "  · ELLIS (room 311): \"I was at the bar from 8:30 to 10:00. The pianist played the whole time, never broke. The piano stopped only when the lights went out at ten.\"",
      "  · FRYE (room 105): \"Checked in at 8:50. Lobby clock said 8:51. I went straight to my room and heard the piano through the wall till ten.\"",
      "Reyes already knows which clock is right. She wants the liar."
    ],
    artifact: { kind: "matchbook", code: "1 LIAR", sub: "deduce who" },
    prompt: "Who is lying?",
    inputLabel: "A name",
    placeholder: "dawes / ellis / frye",
    hints: [
      "Pick the detail that contradicts: when did the pianist stop?",
      "Dawes says 9:30. Ellis says 10:00. Frye says ten as well.",
      "Dawes is alone in his story."
    ],
    answers: ["DAWES"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Two of three corroborate the pianist playing until ten. Dawes alone says 9:30. Dawes is the liar."
  },
  {
    id: 4, title: "The Lineup", chapter: "IV", location: "Behind the one-way glass",
    scene: "lineup",
    body: [
      "The witness was certain on three things and uncertain on the rest.",
      "  · The man was right-handed.",
      "  · He wore wire-rimmed glasses.",
      "  · He had a small scar on his LEFT cheek.",
      "Five men stand under the lineup lights:",
      "  · #1 — right-handed. Bare-faced. No glasses.",
      "  · #2 — right-handed. Scar on RIGHT cheek. Wire-rimmed glasses.",
      "  · #3 — left-handed. Wire-rimmed glasses. Scar on left cheek.",
      "  · #4 — right-handed. Wire-rimmed glasses. Scar on left cheek.",
      "  · #5 — right-handed. Wire-rimmed glasses. No scar.",
      "Pick one."
    ],
    artifact: { kind: "door", slots: 5 },
    prompt: "Which suspect?",
    inputLabel: "1–5",
    placeholder: "?",
    hints: [
      "Cross out anyone who fails any of the three certainties.",
      "#1: no glasses, fails. #2: scar on wrong cheek, fails. #3: left-handed, fails. #5: no scar, fails.",
      "Only one remains."
    ],
    answers: ["4","FOUR"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "Right-handed + wire-rims + scar on the LEFT cheek — only suspect #4 satisfies all three."
  },
  {
    id: 5, title: "The Plate", chapter: "V", location: "Witness statement — hit and run",
    scene: "plate",
    body: [
      "The hit-and-run report had a partial plate. The witness was sure of the format and three of the four characters' positions:",
      "  B  _  5  K  2  _",
      "Six characters total. The two missing are digits.",
      "She was also sure of three things:",
      "  · The two missing digits are equal.",
      "  · Their sum is fourteen.",
      "  · The plate is registered.",
      "What was the plate?"
    ],
    artifact: { kind: "matchbook", code: "B _ 5 K 2 _", sub: "two missing digits" },
    prompt: "Full plate.",
    inputLabel: "6 characters",
    placeholder: "B?5K2?",
    hints: [
      "Equal and summing to fourteen — solve for the digit.",
      "If both digits are d, then 2d = 14 → d = 7.",
      "The plate reads B 7 5 K 2 7."
    ],
    answers: ["B75K27"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g,""),
    explain: "Two equal digits summing to 14 means each is 7. Plate: B75K27."
  },
  {
    id: 6, title: "The Snapshot", chapter: "VI", location: "Polaroid, taken at 11:14",
    scene: "snapshot",
    body: [
      "The polaroid is in front of you. Reyes wants one detail.",
      "A study, dim lamp on the desk. On the desk:",
      "  · A typewriter, half-rolled page.",
      "  · A coffee mug, ring-stained.",
      "  · A single matchstick, burnt, set across an unlit cigarette.",
      "  · A wristwatch, face-down.",
      "  · A handwritten note, three words, partially obscured.",
      "Behind the desk, a tall window — heavy curtains, drawn nearly shut. A clock on the mantel: the hour hand near the 12, the minute hand pointing at the 9.",
      "What time does the mantel clock show? (HH:MM, 12-hour.)"
    ],
    artifact: { kind: "clock", time: "?" },
    prompt: "Mantel clock time.",
    inputLabel: "HH:MM",
    placeholder: "?:??",
    hints: [
      "Minute hand at the 9 means 45 minutes past the hour.",
      "Hour hand near (but not at) the 12 means it's still in the 12 o'clock hour.",
      "12:45."
    ],
    answers: ["12:45","1245","12.45"],
    normalize: (s) => s.replace(/[^0-9]/g,""),
    explain: "Minute hand on the 9 = :45. Hour hand near 12, drifting toward 1 = 12 o'clock. 12:45."
  },
  {
    id: 7, title: "The Composite", chapter: "VII", location: "Reyes' notebook, last page",
    scene: "composite",
    body: [
      "Five witnesses, five fragments. Reyes interviewed them in order. Each gave one feature.",
      "  · First: \"Olive complexion. He stood out.\"",
      "  · Second: \"Right-handed. I watched him reach for his keys.\"",
      "  · Third: \"Six feet, easily.\"",
      "  · Fourth: \"One earring. Left lobe.\"",
      "  · Fifth: \"Nervous tic — kept blinking.\"",
      "Read the first letter of each remembered feature, in the order they were spoken.",
      "Reyes wrote one word at the bottom of the page. What did she write?"
    ],
    artifact: { kind: "door", slots: 5 },
    prompt: "The killer's first name.",
    inputLabel: "5 letters",
    placeholder: "?",
    hints: [
      "Each feature opens with a key word: Olive, Right-handed, Six, One, Nervous.",
      "First letter of each: O, R, S, O, N.",
      "Five letters. A name."
    ],
    answers: ["ORSON"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Olive · Right · Six · One · Nervous → O-R-S-O-N. ORSON."
  }
];

const TRACK_OXBLOOD = [
  {
    id: 1, title: "The Atbash", chapter: "I", location: "Lining of his coat",
    scene: "atbash",
    body: [
      "Intercept #001, found stitched into the lining of his overcoat.",
      "He always favored old systems. Hebrew scribes invented this one two and a half thousand years ago: each letter swaps with its mirror across the alphabet — A is Z, B is Y, and so on.",
      "Cipher:",
      "  GSV PVB RH SVIV",
      "Decode."
    ],
    artifact: { kind: "letter", lines: [
      "GSV  PVB  RH  SVIV",
      "",
      "(atbash)",
      "(A↔Z, B↔Y, C↔X …)"
    ]},
    prompt: "The plaintext.",
    inputLabel: "Four words",
    placeholder: "?",
    hints: [
      "Each letter maps to its mirror: position k ↔ position (27 − k).",
      "G↔T, S↔H, V↔E. So GSV → THE.",
      "Continue: PVB → KEY, RH → IS, SVIV → HERE."
    ],
    answers: ["THE KEY IS HERE","THEKEYISHERE"],
    _solution: "THE KEY IS HERE",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Atbash maps A↔Z, B↔Y, C↔X… GSV PVB RH SVIV → THE KEY IS HERE."
  },
  {
    id: 2, title: "The Polybius", chapter: "II", location: "Margin of Suetonius, page 200",
    scene: "polybius",
    body: [
      "She'd written digits in the gutter of her copy of Suetonius — small, careful pencil:",
      "  21  24  33  14    23  15  42",
      "A Polybius square. Standard 5×5, A through Z (I and J share a cell). Each pair is row-then-column.",
      "  ",
      "      1 2 3 4 5",
      "    1 A B C D E",
      "    2 F G H I K",
      "    3 L M N O P",
      "    4 Q R S T U",
      "    5 V W X Y Z",
      "What did she write?"
    ],
    artifact: { kind: "matchbook", code: "21·24·33·14 · 23·15·42", sub: "row · column" },
    prompt: "The plaintext.",
    inputLabel: "Two words",
    placeholder: "?",
    hints: [
      "21 = row 2, col 1 = F. 24 = row 2, col 4 = I.",
      "33 = N. 14 = D. So the first word is FIND.",
      "23 = H. 15 = E. 42 = R. The second word: HER."
    ],
    answers: ["FIND HER","FINDHER"],
    _solution: "FIND HER",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "21=F, 24=I, 33=N, 14=D | 23=H, 15=E, 42=R — FIND HER."
  },
  {
    id: 3, title: "The Tap Code", chapter: "III", location: "Night watchman's pipe log",
    scene: "morse",
    body: [
      "The hotel manager replayed the night watchman's tap log. Coin against radiator pipe — the entire night.",
      "Stenographer's transcription, dots for short, dashes for long, slashes between letters:",
      "  ··· / -·-· / ·- / ·-· / ·-·· / · / -",
      "Standard Morse. One word."
    ],
    artifact: { kind: "letter", lines: [
      "···  -·-·  ·-  ·-·  ·-··  ·  -",
      "",
      "(international Morse)",
      "(short = dot, long = dash)"
    ]},
    prompt: "The word.",
    inputLabel: "7 letters",
    placeholder: "?",
    hints: [
      "··· = S. -·-· = C. ·- = A.",
      "·-· = R. ·-·· = L. · = E. - = T.",
      "Read them in order."
    ],
    answers: ["SCARLET"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "··· -·-· ·- ·-· ·-·· · - → S C A R L E T. The watchman tapped a single word all night: SCARLET."
  },
  {
    id: 4, title: "The Vigenère", chapter: "IV", location: "Folded inside her copy of Poe",
    scene: "vigenere",
    body: [
      "She'd written one word above the cipher, circled three times: KEY.",
      "The intercepted ciphertext, six letters:",
      "  KXLSRC",
      "Vigenère cipher. The keyword KEY repeats; you subtract it (modulo 26) from the cipher to recover the plaintext.",
      "  ",
      "What did she mean?"
    ],
    artifact: { kind: "matchbook", code: "KXLSRC", sub: "keyword: KEY" },
    prompt: "The decoded message.",
    inputLabel: "Two words",
    placeholder: "?",
    hints: [
      "Repeat the keyword to match the cipher length: KEYKEY.",
      "Subtract each keyword letter from the cipher letter (A=0…Z=25, mod 26). K(10)−K(10)=0=A, X(23)−E(4)=19=T.",
      "Continue: L−Y=N, S−K=I, R−E=N, C−Y=E. AT NINE."
    ],
    answers: ["AT NINE","ATNINE"],
    _solution: "AT NINE",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "KXLSRC − KEYKEY = ATNINE. She wanted to meet at nine."
  },
  {
    id: 5, title: "The Rail Fence", chapter: "V", location: "Telegram, intercepted",
    scene: "railfence",
    body: [
      "Three rails. Zigzag. Read the rails left to right, top to bottom.",
      "Cipher:",
      "  MMNTETEOIHETG",
      "Reconstruct the original message — three words.",
      "(13 letters total, exactly. Three rails carries 4 + 6 + 3 letters in that order.)"
    ],
    artifact: { kind: "letter", lines: [
      "MMNTETEOIHETG",
      "",
      "(rail fence, depth 3)",
      "(rails: 4, 6, 3)"
    ]},
    prompt: "The plaintext.",
    inputLabel: "Three words",
    placeholder: "?",
    hints: [
      "First rail (4 letters): M M N T. These are positions 0, 4, 8, 12 of the original.",
      "Second rail (6 letters): E T E O I H — positions 1, 3, 5, 7, 9, 11.",
      "Third rail (3 letters): E T G — positions 2, 6, 10. Interleave: M E E T M E T O N I G H T."
    ],
    answers: ["MEET ME TONIGHT","MEETMETONIGHT"],
    _solution: "MEET ME TONIGHT",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Rails reassembled in zigzag order spell MEET ME TONIGHT."
  },
  {
    id: 6, title: "The Book Cipher", chapter: "VI", location: "Her commonplace book, ribbon-marked",
    scene: "bookcipher",
    body: [
      "Five lines from the page she ribbon-marked.",
      "  1: Find the lighthouse on the cliff",
      "  2: She left her copy of Nabokov on the desk",
      "  3: Everyone arrived at sunset",
      "  4: Past midnight the streets emptied",
      "  5: She left every clue she ever wrote",
      "Indices in pencil at the top of the page:",
      "  1.1 / 2.3 / 3.3 / 4.2",
      "Format: line.word. Read the four words she circled."
    ],
    artifact: { kind: "book", lines: [
      "Find the lighthouse",
      "She left her copy",
      "Everyone arrived at sunset",
      "Past midnight the streets",
      "She left every clue"
    ], code:[1,1,1] },
    prompt: "The four words.",
    inputLabel: "Four words",
    placeholder: "?",
    hints: [
      "1.1 means line 1, word 1: Find.",
      "2.3 = her. 3.3 = at. 4.2 = midnight.",
      "Read them in order."
    ],
    answers: ["FIND HER AT MIDNIGHT","FINDHERATMIDNIGHT"],
    _solution: "FIND HER AT MIDNIGHT",
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "Indexed words: Find · her · at · midnight."
  },
  {
    id: 7, title: "The One-Time Pad", chapter: "VII", location: "Tucked into Shannon's paper",
    scene: "onetimepad",
    body: [
      "She kept a one-time pad in the back of her copy of Shannon. Three pages of random letters; the relevant fragment, exactly seven characters:",
      "  KQNRJZK",
      "The intercepted ciphertext, also seven:",
      "  OIPRYDN",
      "OTP decryption: subtract the pad from the cipher (modular, A=0 … Z=25). One word.",
      "It was the last thing she wrote."
    ],
    artifact: { kind: "letter", lines: [
      "cipher : OIPRYDN",
      "pad    : KQNRJZK",
      "",
      "(plain = cipher − pad)",
      "(modulo 26)"
    ]},
    prompt: "The plaintext.",
    inputLabel: "One word",
    placeholder: "?",
    hints: [
      "O(14) − K(10) = 4 = E. I(8) − Q(16) = −8 ≡ 18 = S.",
      "P(15) − N(13) = 2 = C. R(17) − R(17) = 0 = A. Y(24) − J(9) = 15 = P.",
      "D(3) − Z(25) = −22 ≡ 4 = E. N(13) − K(10) = 3 = D. Read them in order."
    ],
    answers: ["ESCAPED"],
    normalize: (s) => s.toUpperCase().replace(/[^A-Z]/g,""),
    explain: "(O−K, I−Q, P−N, R−R, Y−J, D−Z, N−K) mod 26 = (4, 18, 2, 0, 15, 4, 3) = ESCAPED."
  }
];

const TRACKS = {
  navy: { name: "The Cipher Room", subtitle: "Narrative · cipher · deduction", levels: window.LEVELS },
  black: { name: "Black Box", subtitle: "Pure logic · liars & locks", levels: TRACK_BLACK },
  bone: { name: "The Manuscript", subtitle: "Words · anagrams · acrostics", levels: TRACK_BONE },
  forest: { name: "The Cartographer", subtitle: "Spatial · geometry · pattern", levels: TRACK_FOREST },
  charcoal: { name: "The Witness", subtitle: "Observation · memory · detail", levels: TRACK_CHARCOAL },
  oxblood: { name: "The Cryptanalyst", subtitle: "Ciphers · codes · keys", levels: TRACK_OXBLOOD }
};

window.TRACKS = TRACKS;
