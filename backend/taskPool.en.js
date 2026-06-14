// English challenger task pool — culturally adapted (not a literal translation).
// Turkey-specific tasks are replaced with equivalents that work for English speakers.
// category: eglence | rol | sunum | dikkat  (matches mobile CATEGORY_CONFIG)
// mode: 'both' | 'gundelik' | 'sef'
// safeOnly: true → only give during a step with no knife/hot oil/fire

const TASK_POOL_EN = [
  // ─── ROLE / IMPERSONATION ───
  { id: 'r01', category: 'rol', mode: 'both', safeOnly: false, text: 'Narrate that step like a live sports commentator ("And he grabs the... sorry, the onion!")' },
  { id: 'r02', category: 'rol', mode: 'both', safeOnly: false, text: 'Announce the step like a TV news anchor with a "BREAKING NEWS" intro, in a serious voice' },
  { id: 'r03', category: 'rol', mode: 'both', safeOnly: false, text: 'Do a food vlogger impression: start with "Welcome back to my channel, everyone!" and explain the step to your subscribers' },
  { id: 'r04', category: 'rol', mode: 'both', safeOnly: false, text: 'Speak in a robotic, choppy voice during the step ("ON-ION. BE-ING. CHOPPED.")' },
  { id: 'r05', category: 'rol', mode: 'both', safeOnly: false, text: 'Sing the names of the ingredients you use in a long, dramatic opera voice' },
  { id: 'r06', category: 'rol', mode: 'both', safeOnly: false, text: 'Speak in an exaggerated pirate accent during the step ("Arr, hand me that onion, matey!")' },
  { id: 'r07', category: 'rol', mode: 'both', safeOnly: false, text: 'Speak in a slow, laid-back cowboy / Western drawl during the step' },
  { id: 'r08', category: 'rol', mode: 'both', safeOnly: false, text: 'Talk like you are presenting to the MasterChef judges — bold and technical' },
  { id: 'r09', category: 'rol', mode: 'both', safeOnly: false, text: 'Narrate like a nature documentary, referring to yourself in the third person ("And the chef approaches the onion in its natural habitat...")' },
  { id: 'r10', category: 'rol', mode: 'both', safeOnly: false, text: 'Deliver the step like a dramatic Shakespearean actor on stage' },
  { id: 'r11', category: 'rol', mode: 'both', safeOnly: false, text: 'Give yourself directions like a GPS voice ("In 300 grams, turn left... you have reached the tomato paste.")' },
  { id: 'r12', category: 'rol', mode: 'both', safeOnly: false, text: 'Present the state of the pan/pot like a weather forecaster ("Scattered sizzling expected in the pan!")' },
  { id: 'r13', category: 'rol', mode: 'both', safeOnly: false, text: 'Do the step using the voice of a cartoon character you like' },
  { id: 'r14', category: 'rol', mode: 'both', safeOnly: false, text: 'Do an over-the-top Italian chef accent ("Mamma mia! This tomato is bellissimo!")' },
  { id: 'r15', category: 'rol', mode: 'both', safeOnly: false, text: 'Announce each ingredient like a stadium announcer ("Now entering the field... the ONIOOON!")' },
  { id: 'r16', category: 'rol', mode: 'both', safeOnly: false, text: 'Critique your own moves like a sports pundit ("Bad call there — I would have added that paste much later.")' },

  // ─── FUN ───
  { id: 'e01', category: 'eglence', mode: 'both', safeOnly: false, text: 'Do that step while dancing' },
  { id: 'e02', category: 'eglence', mode: 'both', safeOnly: false, text: 'Make up and sing a two-line song about the dish you are cooking' },
  { id: 'e03', category: 'eglence', mode: 'both', safeOnly: false, text: 'Before using an ingredient, do an emotional farewell scene with it ("Goodbye, onion. We will never forget your sacrifice.")' },
  { id: 'e04', category: 'eglence', mode: 'both', safeOnly: false, text: 'Give yourself a silly chef title and refer to yourself by it during the step ("The Potato King now adds the salt!")' },
  { id: 'e05', category: 'eglence', mode: 'both', safeOnly: false, text: 'Say "Mmm, magnificent!" out loud every time you stir' },
  { id: 'e06', category: 'eglence', mode: 'both', safeOnly: false, text: 'Cheer for yourself throughout the step' },
  { id: 'e07', category: 'eglence', mode: 'both', safeOnly: false, text: 'Add "chef!" to the end of every sentence during that step' },
  { id: 'e08', category: 'eglence', mode: 'both', safeOnly: false, text: 'Tell a funny kitchen-disaster story (burning, spilling, overflowing) in a funny voice' },
  { id: 'e09', category: 'eglence', mode: 'both', safeOnly: false, text: 'When you finish the step, strike a victory pose and freeze like a statue for 3 seconds' },
  { id: 'e10', category: 'eglence', mode: 'both', safeOnly: false, text: 'Give an ingredient a name and address it by that name during the step ("Ms. Tomato, you are up!")' },
  { id: 'e11', category: 'eglence', mode: 'both', safeOnly: false, text: 'When you finish the step, hum a made-up commercial jingle for the dish' },
  { id: 'e12', category: 'eglence', mode: 'both', safeOnly: false, text: 'Tell a completely made-up, absurd origin story for the dish ("This dish was first invented by aliens in 1962...")' },
  { id: 'e13', category: 'eglence', mode: 'both', safeOnly: false, text: 'Start every sentence with "Legendary!" during that step' },
  { id: 'e14', category: 'eglence', mode: 'both', safeOnly: false, text: 'Pretend the kitchen is a restaurant and call out to imaginary customers ("Pasta for table 12, coming up!")' },
  { id: 'e15', category: 'eglence', mode: 'both', safeOnly: false, text: 'Say the name of the dish in a rap rhythm' },
  { id: 'e16', category: 'eglence', mode: 'both', safeOnly: false, text: 'Snap your fingers and say "That is it!" now and then during the step' },
  { id: 'e17', category: 'eglence', mode: 'both', safeOnly: false, text: 'Try to describe what you are doing three times fast, like a tongue twister' },
  { id: 'e18', category: 'eglence', mode: 'both', safeOnly: false, text: 'Give your kitchen tools a pep talk like teammates ("Pan, heat up! Spoon, get ready!")' },
  { id: 'e19', category: 'eglence', mode: 'both', safeOnly: false, text: 'Rehearse your award acceptance speech for when the dish is done ("I owe this award to my mother...")' },
  { id: 'e20', category: 'eglence', mode: 'both', safeOnly: false, text: 'Say "And... voilà!" like a magician every time you add an ingredient' },

  // ─── PLATING ───
  { id: 's01', category: 'sunum', mode: 'sef', safeOnly: false, text: 'Plating: leave empty space on the plate, add height, and present it like you are serving the judges' },
  { id: 's02', category: 'sunum', mode: 'both', safeOnly: false, text: 'Make up a fancy restaurant menu name and an ad slogan for the dish ("Mediterranean Breeze: a vacation in one bite!")' },
  { id: 's03', category: 'sunum', mode: 'sef', safeOnly: false, text: 'Before serving, present the dish with a 15-second formal introduction speech' },
  { id: 's04', category: 'sunum', mode: 'both', safeOnly: false, text: 'Put the plate up for auction like an auctioneer ("Who will give me 100 for this masterpiece?! Going once, going twice!")' },
  { id: 's05', category: 'sunum', mode: 'both', safeOnly: false, text: 'Put a 5-star restaurant price on the dish and seriously explain why it costs that much' },
  { id: 's06', category: 'sunum', mode: 'sef', safeOnly: false, text: 'Switch into a waiter role and serve the plate to the table while praising the dish extravagantly' },
  { id: 's07', category: 'sunum', mode: 'sef', safeOnly: false, text: 'Introduce the imaginary judges who will score the dish, one by one ("To my right, the world-famous critic...")' },

  // ─── FOCUS / SKILL ───
  { id: 'd01', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Do one task in that step with your non-dominant hand' },
  { id: 'd02', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Do a whole step using only one hand' },
  { id: 'd03', category: 'dikkat', mode: 'both', safeOnly: true, text: 'Stir for 10 seconds with your eyes closed' },
  { id: 'd04', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Set a banned word for the step (e.g., saying "salt" is forbidden; if you slip, sing a short song)' },
  { id: 'd05', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Do not say "I" for the whole step (if you do, you get another rule added)' },
  { id: 'd06', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Count every stir out loud ("One! Two! Three!")' },
  { id: 'd07', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Answer any question only with "yes" or "no" during the step' },
  { id: 'd08', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Beatbox a rhythm with your mouth and stir to the beat' },
  { id: 'd09', category: 'dikkat', mode: 'both', safeOnly: true, text: 'Try not to laugh until you finish the step (the Challenger may try to make you laugh!)' },
  { id: 'd10', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Announce the location of every ingredient you grab ("Salt, transferring from cupboard to counter!")' },
  { id: 'd11', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Try to use three unrelated words (chosen by the Challenger) in your sentences during the step' },
];

module.exports = { TASK_POOL_EN };
