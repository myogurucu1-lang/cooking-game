const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { TASK_POOL } = require('./taskPool');
const { TASK_POOL_EN } = require('./taskPool.en');
require('dotenv').config();

// Seed'e bağlı deterministik RNG — aynı seed aynı aday listesini üretir
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Havuzdan her istek için rastgele aday alt kümesi seç (dile göre havuz)
function sampleTasks(difficulty, seed, language) {
  const pool = language === 'en' ? TASK_POOL_EN : TASK_POOL;
  const rng = mulberry32((seed >>> 0) || 12345);
  const eligible = pool.filter(t => t.mode === 'both' || t.mode === difficulty);

  const shuffled = eligible.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const count = difficulty === 'sef' ? 14 : 12;
  let picked = shuffled.slice(0, count);

  // Şef modunda son görev sunum olmalı: en az 2 sunum adayı garantile
  if (difficulty === 'sef') {
    const sunumCount = picked.filter(t => t.category === 'sunum').length;
    if (sunumCount < 2) {
      const extraSunum = shuffled.slice(count).filter(t => t.category === 'sunum').slice(0, 2 - sunumCount);
      const nonSunum = picked.filter(t => t.category !== 'sunum');
      picked = nonSunum.slice(0, count - sunumCount - extraSunum.length)
        .concat(picked.filter(t => t.category === 'sunum'))
        .concat(extraSunum);
    }
  }

  return picked;
}

const app = express();
const PORT = process.env.PORT || 3001;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Render/Railway gibi proxy arkasında gerçek istemci IP'sini gör — yoksa
// rate limit tüm kullanıcılar için tek IP üzerinden (global) çalışır
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Gerçek istemci IP'si başına dakikada 30 istek — her kullanıcı kendi kovası.
// 'trust proxy' açık olduğu için req.ip zaten X-Forwarded-For'daki gerçek
// istemci IP'sini verir; varsayılan keyGenerator IPv6'yı da doğru ele alır
// (özel keyGenerator IPv6 ValidationError'a yol açıyordu, kaldırıldı).
const recipeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek. Lütfen biraz bekleyin.' },
});
app.use('/api/', recipeLimiter);

// Basit uygulama imzası: APP_SECRET tanımlıysa istemci x-app-key başlığı göndermek zorunda
app.use('/api/', (req, res, next) => {
  if (process.env.APP_SECRET && req.get('x-app-key') !== process.env.APP_SECRET) {
    return res.status(401).json({ error: 'Yetkisiz istek' });
  }
  next();
});

// Açıkça uygunsuz/küfür içeren girdileri AI'a göndermeden, anında ele.
// (Yiyecek olmayan "sandalye/masa" gibi girdileri prompt içindeki geçerlilik kuralı yakalar.)
const BLOCKED_WORDS = [
  // Türkçe (girdi normalize edilir: ı→i, ş→s, ğ→g, ü→u, ö→o, ç→c)
  'yarrak', 'yarak', 'yarrag', 'yaragi', 'sik', 'siktir', 'sikis', 'sikim', 'sikeyim',
  'am', 'amcik', 'amina', 'amik', 'aminako', 'amini', 'orospu', 'oruspu', 'orospucocugu',
  'pic', 'kahpe', 'pezevenk', 'gavat', 'kavat', 'ibne', 'ibik', 'oc', 'got', 'gotveren',
  'bok', 'boktan', 'pipi', 'pippi', 'tassak', 'dalyarak', 'penis', 'vajina', 'porno',
  'surtuk', 'kaltak', 'meme', 'siciim', 'siceyim',
  // English
  'fuck', 'shit', 'dick', 'pussy', 'cock', 'bitch', 'asshole', 'cunt', 'porn', 'sex',
  'vagina', 'tits', 'boobs', 'fag', 'nigger',
];
function containsBlockedContent(text) {
  let norm = String(text).toLowerCase()
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
  const tokens = norm.split(/[^a-z]+/).filter(Boolean);
  return tokens.some((tok) => BLOCKED_WORDS.indexOf(tok) !== -1);
}

// Girdi doğrulama: tip + uzunluk sınırları (prompt şişirme/injection yüzeyini daraltır)
function validateRecipeInput(body) {
  const isStr = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
  if (!isStr(body.ingredients, 300)) return 'Geçersiz malzeme listesi (en fazla 300 karakter)';
  if (!isStr(body.cookName, 40) || !isStr(body.challengerName, 40)) return 'Geçersiz isim';
  if (body.difficulty !== 'gundelik' && body.difficulty !== 'sef') return 'Geçersiz zorluk seviyesi';
  const validList = (l) => l === undefined || (Array.isArray(l) && l.length <= 20 && l.every((x) => typeof x === 'string' && x.length <= 120));
  if (!validList(body.previousRecipes) || !validList(body.previousTasks)) return 'Geçersiz geçmiş listesi';
  return null;
}

app.get('/health', (req, res) => {
  // Anahtar teşhisi: tam anahtarı ASLA göstermeyiz, sadece var mı + uzunluk +
  // maskeli baş/son (Render env'inin doğru yüklendiğini uzaktan doğrulamak için)
  const k = process.env.GOOGLE_AI_API_KEY || '';
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    keyLoaded: k.length > 0,
    keyLength: k.length,
    keyPrefix: k ? k.slice(0, 3) : null,
    keySuffix: k ? k.slice(-3) : null,
  });
});

// Teşhis: Render'ın kendi IP'sinden Gemini'ye minimal bir çağrı yapıp Google'ın
// HAM yanıtını/hatasını döndürür. (app-secret ile korunur.) Kök nedeni
// (faturalandırma/bölge/kısıtlama) tam hata metninden anlamak için geçici araç.
app.get('/api/diag-gemini', async (req, res) => {
  const key = process.env.GOOGLE_AI_API_KEY || '';
  const base = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const payload = JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] });
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
  const tryFetch = async (label, url, headers) => {
    try {
      const r = await fetch(url, { method: 'POST', headers, body: payload });
      const t = await r.text();
      return { label, status: r.status, kind: t.indexOf('Error 403 (Forbidden)') !== -1 ? 'HTML-robot' : (t.indexOf('"candidates"') !== -1 ? 'OK-json' : 'other'), snippet: t.slice(0, 200) };
    } catch (e) { return { label, error: String((e && e.message) || e).slice(0, 200) }; }
  };
  const results = [];
  // A: query param ?key= (baseline)
  results.push(await tryFetch('A_querykey', base + '?key=' + encodeURIComponent(key), { 'Content-Type': 'application/json' }));
  // B: x-goog-api-key header + tarayıcı User-Agent
  results.push(await tryFetch('B_header_ua', base, { 'Content-Type': 'application/json', 'x-goog-api-key': key, 'User-Agent': UA }));
  res.json({ results });
});

app.post('/api/recipe', async (req, res) => {
  try {
    const { ingredients, difficulty, cookName, challengerName, variationSeed, attemptNumber, previousRecipes, previousTasks } = req.body || {};
    const language = (req.body && req.body.language === 'en') ? 'en' : 'tr';

    const validationError = validateRecipeInput(req.body || {});
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Küfür/uygunsuz girdi → AI'a hiç gitmeden reddet
    if (containsBlockedContent(ingredients)) {
      return res.status(400).json({ error: 'invalid_ingredients' });
    }

    // PII maskeleme: isimler loglanmaz
    console.log('🤖 AI İsteği:', { ingredients: ingredients.substring(0, 60), difficulty, attemptNumber, prevRecipes: (previousRecipes || []).length, prevTasks: (previousTasks || []).length });

    // İstemci bağlantıyı kopardıysa 2. Gemini çağrısını boşa yapma
    let clientGone = false;
    res.on('close', () => { if (!res.writableEnded) clientGone = true; });

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 16384,
        // Sef modu: iddiali tarif secimi icin dusunme butcesi ac; gundelik hizli kalsin
        thinkingConfig: { thinkingBudget: difficulty === 'sef' ? 2048 : 0 },
      }
    });

    const prompt = buildPrompt(ingredients, difficulty, cookName, challengerName, variationSeed, attemptNumber, previousRecipes, previousTasks, language);

    // AI bazen bozuk/eksik JSON döndürebiliyor: 2 deneme hakkı ver
    let parsedData = null;
    let lastError = null;
    let invalidInput = false;
    for (let attempt = 1; attempt <= 2 && !parsedData && !clientGone; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const fullText = result.response.text();
        console.log(`📝 AI RAW (deneme ${attempt}, ilk 300):`, fullText.substring(0, 300));

        const cleanJson = extractJSON(fullText);
        const candidate = JSON.parse(cleanJson);

        // AI girdiyi geçersiz buldu (yiyecek değil / uygunsuz) → tarif üretmedi
        if (candidate.invalid === true) {
          invalidInput = true;
          break;
        }

        if (!candidate.recipe || !candidate.recipe.name || !Array.isArray(candidate.recipe.steps) || candidate.recipe.steps.length === 0) {
          throw new Error('Tarif alanları eksik');
        }
        // Her adımın metni string olmalı — istemcide render crash'ini önler
        if (!candidate.recipe.steps.every((s) => s && typeof s.instruction === 'string' && s.instruction.length > 0)) {
          throw new Error('Adım metinleri eksik/bozuk');
        }
        if (!Array.isArray(candidate.challengerTasks)) {
          candidate.challengerTasks = [];
        }
        parsedData = candidate;
      } catch (attemptError) {
        lastError = attemptError;
        console.error(`⚠️ Deneme ${attempt} başarısız:`, attemptError.message);
      }
    }

    if (clientGone) {
      console.log('⏹️ İstemci vazgeçti, yanıt gönderilmedi');
      return;
    }
    if (invalidInput) {
      console.log('🚫 Geçersiz girdi (yiyecek değil/uygunsuz)');
      return res.status(400).json({ error: 'invalid_ingredients' });
    }
    if (!parsedData) throw lastError;

    console.log('✅ Tarif:', parsedData.recipe.name);
    console.log('📋 ChallengerTasks:', parsedData.challengerTasks.length);

    res.json(parsedData);

  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (res.headersSent) return;
    const msg = String(error && error.message || '').toLowerCase();
    if (msg.includes('429') || msg.includes('quota') || msg.includes('overloaded') || msg.includes('503')) {
      return res.status(503).json({ error: 'Sistem şu an yoğun, lütfen birkaç dakika sonra tekrar deneyin.' });
    }
    // API key geçersiz/yetkisiz veya yapılandırma hatası: bunlar geçici değil,
    // sunucu tarafı sorunudur. Net biçimde logla (Render loglarında görünür) ve
    // istemciye "bizden kaynaklı, az sonra dene" mesajı dön.
    if (msg.includes('api key') || msg.includes('api_key') || msg.includes('400 bad request') || msg.includes('permission') || msg.includes('403')) {
      console.error('🔑 KRİTİK: Gemini API anahtarı geçersiz/yetkisiz olabilir — Render env GOOGLE_AI_API_KEY kontrol et.');
      return res.status(503).json({ error: 'Sunucu şu an hizmet veremiyor, kısa süre sonra tekrar dene.' });
    }
    res.status(500).json({ error: 'Tarif oluşturulamadı' });
  }
});

function buildPrompt(ingredients, difficulty, cookName, challengerName, variationSeed, attemptNumber, previousRecipes, previousTasks, language) {
  const isGundelik = difficulty === 'gundelik';
  const seed = variationSeed || Math.floor(Math.random() * 100000);
  const prevList = (previousRecipes && previousRecipes.length) ? previousRecipes : [];
  const prevTasks = (previousTasks && previousTasks.length) ? previousTasks : [];
  const taskCandidates = sampleTasks(difficulty, seed, language);

  if (language === 'en') {
    return buildPromptEn(ingredients, difficulty, isGundelik, cookName, challengerName, seed, prevList, prevTasks, taskCandidates);
  }

  const candidateLines = taskCandidates.map(function (t, i) {
    return (i + 1) + '. ' + t.text + (t.safeOnly ? ' [SADECE bıçak/sıcak yağ/ateş içermeyen adımda ver]' : '');
  }).join('\n');

  return `Sen 2 kişilik bir yemek oyunu için TARİF ve CHALLENGE üreten bir asistansın.
Sadece geçerli JSON döndür, başka hiçbir şey yazma.

GİRDİLER:
- Malzemeler: ${ingredients}
- Mod: ${difficulty}
- Cook (pişiren): ${cookName}
- Challenger (görev veren): ${challengerName}

═══ ÖNCE GEÇERLİLİK KONTROLÜ (EN ÖNEMLİ) ═══
Malzemeler gerçek, yenebilir YİYECEK olmalı. Eğer girdi yiyecek değilse (mobilya, eşya, nesne, yer, hayvan, soyut/saçma/alakasız kelimeler) VEYA küfür, cinsel, saldırgan ya da uygunsuz ifade içeriyorsa: KESİNLİKLE tarif ÜRETME. Bu durumda başka HİÇBİR ŞEY yazma, SADECE şu JSON'u döndür:
{"invalid": true}
Örnek geçersiz girdiler: "sandalye, masa", "telefon", "am", "pipi", küfürlü/müstehcen kelimeler. Bunlardan asla yemek uydurma.
AYRICA: Girdi tek bir belirsiz/anlamsız kelimeyse veya gerçek bir yiyecek malzemesi içermiyorsa da {"invalid": true} döndür. Kullanıcının YAZMADIĞI malzemeyi (sucuk, domates vb.) ASLA kendin uydurup ekleme — girdide olmayan malzemeyle tarif YAPMA.

═══ MUTLAK KURALLAR (ÇİĞNENEMEZ) ═══

1) GERÇEK YEMEK: Ürettiğin yemek MUTLAKA var olan, bilinen bir yemek olmalı (Türk/dünya mutfağı, ev yemeği, restoran yemeği). Uydurma isim, "X tarzı", "özel versiyon", "tornado/volkano" gibi şeyler YASAK. Ama dikkat: yemeğin dünyaca bilinen ÖZGÜN bir adı varsa (İtalyanca, Fransızca, İspanyolca vb.) o adı aynen kullan — gerçek yabancı isimler uydurma sayılmaz (örn. "Spaghetti all'Assassina", "Penne all'Arrabbiata", "Ratatouille" gerçek yemeklerdir). Yemeğin ne olduğunu description alanında Türkçe açıkla.

2) MALZEME SINIRI: Sadece kullanıcının verdiği malzemeleri kullan. Ekstra serbest olanlar SADECE: tuz, karabiber, pul biber, sıvı yağ. Bunun DIŞINDA hiçbir malzeme ekleme (yumurta, peynir, süt, soğan, sarımsak, pirinç, un, et vb. EKLENEMEZ). Verilen malzeme bir yemek için yetmiyorsa, o yemeği yapma — eldeki malzemeyle yapılabilecek gerçek bir yemek seç.

3) DOĞRU TEKNİK VE FORM:
- Her malzemeyi gerçek hayatta kullanıldığı şekilde kullan.
- Parça etleri (antrikot, biftek, bonfile, pirzola, kuşbaşı, tavuk göğsü) bütün/dilimlenmiş pişir. KIYMA yapma, öğütme.
- Kıyma makinesi, blender, mikser gibi özel ekipman gerektiren adım verme. Sadece bıçak, tencere, tava, fırın.
- Bir malzemeyi normalde kullanılmadığı bir teknikle kullanma (örn: makarna sosu için un kavurma).
- Türk yemeklerinde "sıvı yağ" kullan, zeytinyağı sadece Akdeniz/İtalyan yemeklerde.

4) ÇEŞİTLİLİK (ama kuralları ezmeden):
- Varyasyon: #${seed}
- ÖNCE ŞUNU YAP: Bu malzemelerle (sadece verilenler + tuz/karabiber/pul biber/sıvı yağ) GERÇEKTEN yapılabilen farklı yemekleri zihninde say. Aynı malzemelerle yapılabilen birden çok gerçek yemek neredeyse HER ZAMAN vardır — farklı pişirme yöntemi/sunum sayesinde (tava, fırın, güveç, közleme, haşlama, sote, kavurma vb.). Örn: patlıcan+kıyma+domates+biber+soğan ile karnıyarık, musakka, kıymalı patlıcan güveç, patlıcan oturtma gibi AYRI gerçek yemekler vardır.
${prevList.length ? `- AŞAĞIDAKİ YEMEKLERİ ÜRETMEN KESİNLİKLE YASAK (kullanıcı bunları zaten gördü ve beğenmedi):
${prevList.map((n) => '  • ' + n).join('\n')}
- Bu listedeki bir yemeğin AYNISINI ya da minik varyasyonunu (ör. "X" yerine "Fırında X", "Sulu X") verme. GERÇEKTEN farklı, ayrı bir yemek seç.
- Zihninde saydığın adaylardan, bu listede OLMAYAN ilk gerçek yemeği seç.
- SON ÇARE (yalnızca eldeki malzemeyle yapılabilen TÜM gerçek yemekleri gerçekten tükettiysen): Uydurmak yerine listedekilerden birini tekrar verebilirsin. Ama bu kaçışı KOLAYCA kullanma — önce gerçek alternatifleri zorla, en az 3-4 aday düşünmeden bu maddeye geçme.` : '- En klişe seçeneğin dışında, gerçek bir alternatif seçmeye çalış.'}
- ÇEŞİTLİLİK İÇİN ASLA: yeni malzeme ekleme, uyduruk yemek yapma, bir yemeğe alakasız malzeme katıp "yeni tarif" deme.

═══ MOD ═══
${isGundelik ? `GÜNDELİK: Pratik ev yemeği. 5-6 adım. 20-30 dakika. Tek tencere/tava. Teknik gösteri yok.` : `ŞEF: Gündelikten FARKLI, daha iddialı ama yine GERÇEK bir yemek. ÖNCE aynı malzemelerle yapılabilen dünya mutfağı klasiklerini ve özgün isimli yemekleri düşün; en bilindik ev yemeği versiyonunu VERME. Yemeğin adını özgün haliyle yaz — "Acılı Makarna", "Salçalı Pilav" gibi jenerik/sıradan adlar şef modunda YASAK; o yemeğin gastronomideki gerçek adı neyse onu kullan. DİKKAT: kulağa yabancı gelen isim UYDURMA da yasak — isim, gastronomide gerçekten var olan bir yemeğin adı olmalı (örn. makarna+salça için "Spaghetti all'Assassina" gerçek ve mükemmel bir şef modu seçimidir; "Spaghetti al Doppio Concentrato" diye bir yemek yoktur, uydurmadır). 8-12 adım. 45-90 dakika. Son adım her zaman SUNUM.`}

═══ CHALLENGE GÖREVLERİ ═══
Amaç: ${cookName}'i eğlendirmek, "beraber başardık" hissi. Yemeği ASLA bozmamak.
Görev sayısı: ${isGundelik ? '1 ana + 2-3 yan görev (toplam 3-4)' : '3 ana + 2-3 yan görev. Son görev sunum.'}

İZİN VERİLEN GÖREVLER (SADECE bu listeden seç, listede olmayan görev uydurma; seçtiklerini ${cookName} ve yemeğin adımlarına göre kişiselleştir):
${candidateLines}
${prevTasks.length ? `
DAHA ÖNCE VERİLEN GÖREVLER (bunları ve çok benzerlerini TEKRAR VERME, listeden farklı olanları seç):
${prevTasks.map((t) => '  • ' + t).join('\n')}
` : ''}
YASAK GÖREVLER: Romantik/duygusal, fiziksel temas, kamera/kayıt, ateş/süre/pişirme kararı verdirme, slow motion, fısıltı, kişisel/utandırıcı soru sordurma, malzeme havaya atma/fiziksel akrobasi, bağırtma. Listedeki görevler DIŞINDA hiçbir şey.

═══ JSON FORMATI ═══
{
  "recipe": {
    "name": "gerçek yemek adı",
    "description": "kısa tanım",
    "prepTime": "${isGundelik ? '20-30 dakika' : '45-90 dakika'}",
    "difficulty": "${difficulty}",
    "servings": "2 kişilik",
    "ingredients": ["miktar + malzeme"],
    "steps": [
      { "step": 1, "instruction": "adım", "duration": "X dakika", "heat": "ateş seviyesi" }
    ]
  },
  "challengerTasks": [
    { "id": 1, "title": "görev başlığı", "description": "${challengerName}, ${cookName}'e ... yaptır", "type": "main", "triggerAtStep": 3, "duration": 5 }
  ]
}`;
}

function buildPromptEn(ingredients, difficulty, isGundelik, cookName, challengerName, seed, prevList, prevTasks, taskCandidates) {
  const candidateLines = taskCandidates.map(function (t, i) {
    return (i + 1) + '. ' + t.text + (t.safeOnly ? ' [ONLY give during a step with no knife/hot oil/fire]' : '');
  }).join('\n');

  return `You generate a RECIPE and CHALLENGE tasks for a 2-player cooking game.
Return ONLY valid JSON, nothing else. ALL output text (recipe name, description, steps, task titles and descriptions) MUST be in English.

INPUTS:
- Ingredients: ${ingredients}
- Mode: ${difficulty}
- Cook (the one cooking): ${cookName}
- Challenger (the one giving tasks): ${challengerName}

═══ VALIDITY CHECK FIRST (MOST IMPORTANT) ═══
The ingredients must be real, edible FOOD. If the input is not food (furniture, objects, places, animals, abstract/nonsense/irrelevant words) OR contains profanity, sexual, offensive or inappropriate language: DO NOT generate a recipe. In that case write NOTHING else, return ONLY this JSON:
{"invalid": true}
Example invalid inputs: "chair, table", "phone", profane/obscene words. Never invent a dish from these.
ALSO: If the input is a single vague/nonsense word or does not contain a real food ingredient, return {"invalid": true}. NEVER invent ingredients the user did NOT write (e.g. sausage, tomato) — do not make a recipe with ingredients that are not in the input.

═══ ABSOLUTE RULES (NON-NEGOTIABLE) ═══

1) REAL DISH: The dish MUST be a real, known dish from world/international cuisine (home-style or restaurant). No made-up names, no "X-style", no "special version", no "tornado/volcano" nonsense. If a dish has a well-known authentic name (Italian, French, Spanish, etc.), use that real name.

2) INGREDIENT LIMIT: Use only the ingredients the user gave. The ONLY free extras are: salt, black pepper, chili flakes, cooking oil. Add NOTHING else (no egg, cheese, milk, onion, garlic, rice, flour, meat, etc. unless the user listed it). If the ingredients are not enough for a dish, pick a real dish that CAN be made with what is given.

3) CORRECT TECHNIQUE AND FORM:
- Use each ingredient the way it is really used.
- Cook whole/sliced cuts of meat (steak, chicken breast, chops) as such — do NOT mince or grind them.
- No special equipment (grinder, blender, mixer). Only knife, pot, pan, oven.
- Do not use an ingredient with a technique it is never used for.

4) VARIETY (without breaking the rules):
- Variation: #${seed}
- FIRST: with these ingredients (only the given ones + salt/pepper/chili/oil), mentally list several DIFFERENT real dishes. There is almost always more than one, thanks to different cooking methods (pan, oven, stew, grill, boil, sauté, etc.).
${prevList.length ? `- YOU ARE FORBIDDEN from producing the following dishes (the user already saw and disliked them):
${prevList.map((n) => '  • ' + n).join('\n')}
- Do not give the same dish or a tiny variation of it. Choose a genuinely different dish.` : '- Try to pick a real alternative beyond the most cliché option.'}
- NEVER for the sake of variety: add new ingredients, invent fake dishes, or attach unrelated ingredients and call it a "new recipe".

═══ MODE ═══
${isGundelik ? `EVERYDAY: Practical home meal. 5-6 steps. 20-30 minutes. One pot/pan. No showing off.` : `CHEF: DIFFERENT from everyday, more ambitious but still a REAL dish. Think of international classics; avoid the most basic home version. 8-12 steps. 45-90 minutes. The last step is always PLATING.`}

═══ CHALLENGE TASKS ═══
Goal: entertain ${cookName}, create a "we did it together" feeling. NEVER ruin the food.
Number of tasks: ${isGundelik ? '1 main + 2-3 side tasks (3-4 total)' : '3 main + 2-3 side tasks. Last task is plating.'}

ALLOWED TASKS (choose ONLY from this list, do not invent tasks not on it; personalize the chosen ones to ${cookName} and the recipe steps):
${candidateLines}
${prevTasks.length ? `
PREVIOUSLY GIVEN TASKS (do NOT repeat these or very similar ones, pick different ones from the list):
${prevTasks.map((t) => '  • ' + t).join('\n')}
` : ''}
FORBIDDEN TASKS: romantic/emotional, physical contact, camera/recording, decisions about heat/time/cooking, slow motion, whispering, personal/embarrassing questions, throwing ingredients/physical acrobatics, shouting. Nothing outside the list above.

═══ JSON FORMAT ═══
{
  "recipe": {
    "name": "real dish name",
    "description": "short description",
    "prepTime": "${isGundelik ? '20-30 minutes' : '45-90 minutes'}",
    "difficulty": "${difficulty}",
    "servings": "2 servings",
    "ingredients": ["amount + ingredient"],
    "steps": [
      { "step": 1, "instruction": "step", "duration": "X minutes", "heat": "heat level" }
    ]
  },
  "challengerTasks": [
    { "id": 1, "title": "task title", "description": "${challengerName}, make ${cookName} ...", "type": "main", "triggerAtStep": 3, "duration": 5 }
  ]
}`;
}

function extractJSON(text) {
  let clean = text.replace(/```json\n?|\n?```/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}') + 1;
  if (start === -1 || end <= start) throw new Error('JSON bulunamadı');
  return clean.substring(start, end);
}

app.listen(PORT, () => {
  console.log(`🚀 Backend: http://localhost:${PORT}`);
  console.log(`🤖 Google AI: ${process.env.GOOGLE_AI_API_KEY ? '✅' : '❌'}`);
  console.log(`📦 Model: gemini-2.5-flash`);
});