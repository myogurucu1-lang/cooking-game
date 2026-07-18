// Date Night task pool — English (localized for US/UK, not a literal translation).
// Same ids/flags as taskPool.datenight.js. Localization notes:
//  - "30 santim" -> "twelve inches"; "el öpme (beyefendi/hanımefendi)" -> "old-Hollywood style";
//  - "dizi" -> "rom-com/movie"; "spiker" -> "game-show host". No untranslatable TR-culture tasks found.

const TASK_POOL_DATENIGHT_EN = [
  // ─── CATEGORY 1: COMPLIMENTS & SWEET WORDS (early) ───
  { id: 'dn-c01', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Three Things — {cook}, while doing this step, name the three things you love most about {challenger}.' },
  { id: 'dn-c02', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'First Impression — {cook}, tell {challenger} exactly what went through your mind the first time you saw them.' },
  { id: 'dn-c03', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Sing It — {cook}, pay {challenger} a compliment, but deliver it like a song lyric, melody included.' },
  { id: 'dn-c04', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'One Word — {cook}, describe {challenger} in a single word, then explain why.' },
  { id: 'dn-c05', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Secret Admirer — {cook}, reveal a little habit of {challenger}\'s that they think nobody notices — but you secretly adore.' },
  { id: 'dn-c06', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Official Announcement — {cook}, in your best game-show host voice: "Ladies and gentlemen, presenting the most beautiful human on Earth..."' },
  { id: 'dn-c07', category: 'iltifat', mode: 'both', safeOnly: true, phase: 'early', text: 'Look Into My Eyes — {cook}, pause the stirring, hold {challenger}\'s gaze for 5 seconds and pay them a compliment.' },
  { id: 'dn-c08', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Bad Poetry Night — {cook}, improvise a two-line love poem for {challenger}. The worse it is, the bigger the laugh.' },
  { id: 'dn-c09', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Thank-You Moment — {cook}, thank {challenger} for one thing they\'ve brought into your life.' },

  // ─── CATEGORY 2: MEMORIES & NOSTALGIA (early) ───
  { id: 'dn-a01', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'First Date — {cook}, share the tiniest detail you still remember from your first date.' },
  { id: 'dn-a02', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'Laughing Fit — {cook}, retell the moment you two laughed the hardest — and try to finish the story without laughing.' },
  { id: 'dn-a03', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'Hall of Shame — {cook}, confess the most embarrassing thing that ever happened to you in front of {challenger}.' },
  { id: 'dn-a04', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'The First Text — {cook}, try to recall the first message you ever sent {challenger} and say it out loud. Can\'t remember? Make it up — {challenger} sets the record straight.' },
  { id: 'dn-a05', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'Time Capsule — {cook}, finish this sentence: "Five years from now, the two of us will be..."' },
  { id: 'dn-a06', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'One More Time — {cook}, describe a moment together you wish you could relive.' },
  { id: 'dn-a07', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'That\'s When I Knew — {cook}, tell the exact moment you realized you were really into {challenger}.' },
  { id: 'dn-a08', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'Our Song — {cook}, pick the song that tells your story and hum a verse of it.' },

  // ─── CATEGORY 3: FLIRTY & FUN (mid) ───
  { id: 'dn-f01', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Slow-Motion Glance — {cook}, do a dramatic movie-style slow-motion hair flip and look at {challenger}.' },
  { id: 'dn-f02', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Rom-Com Lead — {cook}, do this step delivering dramatic lines like the lead in a romantic movie.' },
  { id: 'dn-f03', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'The Wink — {cook}, every time you make eye contact with {challenger} during this step, wink.' },
  { id: 'dn-f04', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'French Chef — {cook}, narrate this step in a French accent with plenty of "mon amour".' },
  { id: 'dn-f05', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Spoon Serenade — {cook}, turn your spoon into a microphone and sing {challenger} two lines of a love song.' },
  { id: 'dn-f06', category: 'flort', mode: 'both', safeOnly: true, phase: 'mid', text: 'Staring Contest — {cook} and {challenger}: 10 seconds, no laughing. The loser owes the winner a compliment.' },
  { id: 'dn-f07', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Secret Agent — {cook}, sneak three glances at {challenger} during this step without getting caught. Get caught, owe a compliment.' },
  { id: 'dn-f08', category: 'flort', mode: 'both', safeOnly: true, phase: 'mid', text: 'Tango Pose — {cook}, strike a dramatic tango pose before adding the ingredient.' },
  { id: 'dn-f09', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Cooking With Love — {cook}, do this step in full "I\'m not cooking dinner, I\'m cooking my love" mode — extra dramatic gestures required.' },

  // ─── CATEGORY 4: DO IT TOGETHER (mid) ───
  { id: 'dn-b01', category: 'beraber', mode: 'both', safeOnly: true, phase: 'mid', text: 'Four Hands — do this step together: {challenger} holds the ingredient, {cook} does the work.' },
  { id: 'dn-b02', category: 'beraber', mode: 'both', safeOnly: false, phase: 'mid', text: 'Taste Ceremony — {cook}, give {challenger} a taste with their eyes closed; they have to guess what it is.' },
  { id: 'dn-b03', category: 'beraber', mode: 'both', safeOnly: true, phase: 'mid', text: 'Mirror Game — for 30 seconds, {challenger} copies every single move {cook} makes.' },
  { id: 'dn-b04', category: 'beraber', mode: 'both', safeOnly: true, phase: 'mid', text: 'Dance Break — take a 15-second dance break between stirs. No music? Hum something together.' },
  { id: 'dn-b05', category: 'beraber', mode: 'both', safeOnly: false, phase: 'mid', text: 'Chef & Sous-Chef — for this step, {challenger} becomes the sous-chef: {cook} calls the orders, {challenger} executes.' },
  { id: 'dn-b06', category: 'beraber', mode: 'both', safeOnly: false, phase: 'mid', text: 'The Sniff Test — {cook}, have {challenger} smell a spice with their eyes closed and guess what it is.' },
  { id: 'dn-b07', category: 'beraber', mode: 'both', safeOnly: false, phase: 'mid', text: 'Count Together — for this stirring step, count out loud to 20 together, switching voices on every number.' },
  { id: 'dn-b08', category: 'beraber', mode: 'both', safeOnly: true, phase: 'mid', text: 'Hand in Hand — {challenger}, place your hand over {cook}\'s and do this stir together.' },

  // ─── CATEGORY 5: QUESTIONS & CONFESSIONS (mid) ───
  { id: 'dn-q01', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'A World Without You — {cook}, tell {challenger} what would be missing from your life without them.' },
  { id: 'dn-q02', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'First Jealousy — {cook}, confess the first time you ever felt jealous over {challenger}.' },
  { id: 'dn-q03', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'Secret Bragging — {cook}, share something about {challenger} that you brag about to other people.' },
  { id: 'dn-q04', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'Dream Trip — {cook}, describe your dream vacation with {challenger} in 20 seconds.' },
  { id: 'dn-q05', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'Never Change — {cook}, tell {challenger} one thing about them you hope never, ever changes.' },
  { id: 'dn-q06', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'True Confession — {cook}, admit something you secretly love about {challenger}\'s cooking or little habits.' },
  { id: 'dn-q07', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'I\'d Choose You Again — {cook}, finish the sentence: "I\'d choose you all over again, because..."' },
  { id: 'dn-q08', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'Superpower — {cook}, describe the "superpower" {challenger} gives you (e.g. "nothing feels hard when you\'re around").' },

  // ─── CATEGORY 6: LITTLE GESTURES (mid) ───
  { id: 'dn-j01', category: 'jest', mode: 'both', safeOnly: false, phase: 'mid', text: 'Five-Star Service — {cook}, serve {challenger} a drink like a fine-dining waiter — napkin over the arm and all.' },
  { id: 'dn-j02', category: 'jest', mode: 'both', safeOnly: true, phase: 'mid', text: 'Forehead Kiss — {cook}, before stirring the pot, plant a kiss on {challenger}\'s forehead.' },
  { id: 'dn-j03', category: 'jest', mode: 'both', safeOnly: true, phase: 'mid', text: 'Recharge Hug — during this waiting step, share a 10-second "battery recharge" hug.' },
  { id: 'dn-j04', category: 'jest', mode: 'both', safeOnly: true, phase: 'mid', text: 'Old Hollywood — {cook}, kiss {challenger}\'s hand like a classic old-Hollywood star.' },
  { id: 'dn-j05', category: 'jest', mode: 'both', safeOnly: false, phase: 'mid', text: 'Napkin Note — {cook}, write {challenger} a three-word note on a napkin and place it on the table. It stays secret until dinner is served.' },
  { id: 'dn-j06', category: 'jest', mode: 'both', safeOnly: false, phase: 'mid', text: 'A Toast — raise whatever glasses you have (water totally counts): "To us."' },

  // ─── CATEGORY 7: THE SPARK — tension tasks (late: final third of the recipe) ───
  { id: 'dn-k01', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'Whisper Service — {cook}, narrate what you\'re doing in this step by whispering it into {challenger}\'s ear.' },
  { id: 'dn-k02', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'Standing Close — {challenger}, stand right behind {cook} and watch over their shoulder. {cook} keeps cooking without breaking focus.' },
  { id: 'dn-k03', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'The Twelve-Inch Rule — explain this step from twelve inches apart, holding eye contact. First one to smile loses.' },
  { id: 'dn-k04', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'Slow Dance — while the food simmers, slow dance for 20 seconds. No music needed.' },
  { id: 'dn-k05', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'After Dinner — {cook}, finish the sentence "after dinner, my plan is..." in a mysterious tone. No details allowed.' },
  { id: 'dn-k06', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'Most Attractive — {cook}, tell {challenger} the feature you find most attractive about them — not personality, looks.' },
  { id: 'dn-k07', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'Massage Break — {challenger}, while the food rests, give {cook} a 15-second shoulder massage.' },
  { id: 'dn-k08', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'Crossed Fingers — add the ingredient together and let your hands cross; see who holds on longer.' },
  { id: 'dn-k09', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'Forbidden Glance — {cook}, no looking at {challenger} at all during this step. {challenger} may try to distract you (no touching).' },
  { id: 'dn-k10', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'First Attraction — {cook}, be honest: what was the very first thing that drew you to {challenger}?' },
  { id: 'dn-k11', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'Almost — offer {challenger} the tasting spoon, then pull it back at the last second. Twice. Third time\'s the charm.' },
  { id: 'dn-k12', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'Winner Takes It — a 10-second staring duel: the winner earns one small request from the loser for tonight.' },

  // ─── CATEGORY 8: TABLE & SERVICE (finale: last step) ───
  { id: 'dn-s01', category: 'sofra', mode: 'both', safeOnly: false, phase: 'finale', text: 'Chef\'s Table — {cook}, carry the plate to the table with full fine-dining flair and introduce the dish as "the chef\'s special".' },
  { id: 'dn-s02', category: 'sofra', mode: 'both', safeOnly: false, phase: 'finale', text: 'Candle Ceremony — light the candle together before sitting down (phone flashlight counts); {cook} makes a wish for the night.' },
  { id: 'dn-s03', category: 'sofra', mode: 'both', safeOnly: false, phase: 'finale', text: 'The Announcement — {challenger}, grab an imaginary microphone: "Tonight\'s special menu..." and invite {cook} and the dish to the table.' },
  { id: 'dn-s04', category: 'sofra', mode: 'both', safeOnly: false, phase: 'finale', text: 'First Bite Ritual — feed each other the first bite, then rate it using only your faces. No words allowed.' },
  { id: 'dn-s05', category: 'sofra', mode: 'both', safeOnly: false, phase: 'finale', text: 'Closing Credits — once you\'re seated, {cook} declares the one moment from tonight they\'ll remember most.' },
];

module.exports = { TASK_POOL_DATENIGHT_EN };
