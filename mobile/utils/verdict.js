// Oyun sonu skoru, rütbe ve komik "jüri yorumu" — tamamen client-side, backend yok.
// Skor: adım tamamlama oranı + zorluk bonusu + görev sayısı bonusu.

export function getResultScore(completedSteps, totalSteps, difficulty, totalTasks) {
  var ratio = totalSteps > 0 ? completedSteps / totalSteps : 0;
  var base = Math.round(ratio * 1000);
  var difficultyBonus = difficulty === 'sef' ? 500 : 250;
  var taskBonus = (totalTasks || 0) * 40;
  return base + difficultyBonus + taskBonus;
}

// Tamamlama oranına göre rütbe katmanı
export function getRankTier(completedSteps, totalSteps) {
  var ratio = totalSteps > 0 ? completedSteps / totalSteps : 0;
  if (ratio >= 1) return 'legend';
  if (ratio >= 0.75) return 'master';
  if (ratio >= 0.4) return 'cook';
  return 'rookie';
}

var RANKS = {
  tr: {
    legend: { emoji: '👑', title: 'Mutfak Efsanesi' },
    master: { emoji: '🌟', title: 'Usta Şef' },
    cook: { emoji: '🍳', title: 'Aşçı' },
    rookie: { emoji: '🔥', title: 'Cesur Çırak' },
  },
  en: {
    legend: { emoji: '👑', title: 'Kitchen Legend' },
    master: { emoji: '🌟', title: 'Master Chef' },
    cook: { emoji: '🍳', title: 'Cook' },
    rookie: { emoji: '🔥', title: 'Brave Rookie' },
  },
};

export function getRankLabel(tier, lang) {
  var table = RANKS[lang === 'en' ? 'en' : 'tr'];
  return table[tier] || table.cook;
}

var VERDICTS = {
  tr: {
    legend: [
      '{cook} mutfağı dağıttı! Jüri ayakta alkışlıyor. 👏',
      'Michelin müfettişleri {cook} için yola çıktı bile. ⭐',
      'Kusursuz! {cook} bu işi ekmek parası yapabilir. 🍞',
      'Jüri tek kelime etti: şahane. {cook} resmen şef oldu. 👨‍🍳',
    ],
    master: [
      '{cook} gayet iyi iş çıkardı, jüri memnun. 😎',
      'Birkaç ufak pürüz ama {cook} tabağı kurtardı. 👌',
      'Lezzet yerinde! {cook} bir dahaki sefere zirveye oynar. 🚀',
      'Jüri başını salladı: helal {cook}. 🙌',
    ],
    cook: [
      '{cook} idare etti, en azından mutfak ayakta. 😅',
      'Yenir mi? Yenir. Şaheser mi? Orası tartışılır. {cook} 🍽️',
      'Jüri kaşığı bıraktı: fena değil {cook}, fena değil. 🤔',
      '{cook} bitirdi, gerisi teferruat. 😏',
    ],
    rookie: [
      '{cook} cesurdu, sonuç... cesaret işte. 😂',
      'Mutfak bir savaş alanı, {cook} sağ çıktı, o da bir başarı. 🔥',
      'Jüri itfaiyeyi aradı ama {cook}\'u sevdi. ❤️🚒',
      'Önemli olan katılmak! {cook} bir dahakine kopartır. 💪',
    ],
  },
  en: {
    legend: [
      '{cook} crushed it! The judges are on their feet. 👏',
      'Michelin inspectors are already on their way for {cook}. ⭐',
      'Flawless. {cook} could do this for a living. 🍞',
      'The verdict is in: chef-level work, {cook}. 👨‍🍳',
    ],
    master: [
      '{cook} did great — the judges are pleased. 😎',
      'A few rough edges, but {cook} saved the plate. 👌',
      'Solid flavor! {cook} is one step from the top. 🚀',
      'The judges nodded in approval: well done, {cook}. 🙌',
    ],
    cook: [
      '{cook} pulled it off — the kitchen survived. 😅',
      'Edible? Yes. Masterpiece? Debatable. Nice try, {cook}. 🍽️',
      'The judges shrugged: not bad, {cook}, not bad. 🤔',
      '{cook} finished. The rest is just details. 😏',
    ],
    rookie: [
      '{cook} was brave. The result... was also brave. 😂',
      'The kitchen is a battlefield, and {cook} walked out alive. 🔥',
      'The judges called the fire department but loved {cook}. ❤️🚒',
      'It is all about taking part! {cook} will nail it next time. 💪',
    ],
  },
};

// Performansa göre rastgele komik jüri yorumu (seed verilirse deterministik)
export function pickVerdict(tier, lang, cookName, seed) {
  var table = VERDICTS[lang === 'en' ? 'en' : 'tr'];
  var pool = table[tier] || table.cook;
  var idx = (typeof seed === 'number' ? seed : Math.floor(Math.random() * 100000)) % pool.length;
  return pool[idx].replace(/\{cook\}/g, cookName || (lang === 'en' ? 'The chef' : 'Şef'));
}
