const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { TASK_POOL } = require('./taskPool');
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

// Havuzdan her istek için rastgele aday alt kümesi seç
function sampleTasks(difficulty, seed) {
  const rng = mulberry32((seed >>> 0) || 12345);
  const eligible = TASK_POOL.filter(t => t.mode === 'both' || t.mode === difficulty);

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

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/recipe', async (req, res) => {
  try {
    const { ingredients, difficulty, cookName, challengerName, variationSeed, attemptNumber, previousRecipes, previousTasks } = req.body;

    if (!ingredients || !difficulty || !cookName || !challengerName) {
      return res.status(400).json({ error: 'Eksik parametreler' });
    }

    console.log('🤖 AI İsteği:', { ingredients, difficulty, cookName, challengerName, attemptNumber, previousRecipes, previousTasks });

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 16384,
        // Sef modu: iddiali tarif secimi icin dusunme butcesi ac; gundelik hizli kalsin
        thinkingConfig: { thinkingBudget: difficulty === 'sef' ? 2048 : 0 },
      }
    });

    const prompt = buildPrompt(ingredients, difficulty, cookName, challengerName, variationSeed, attemptNumber, previousRecipes, previousTasks);

    // AI bazen bozuk/eksik JSON döndürebiliyor: 2 deneme hakkı ver
    let parsedData = null;
    let lastError = null;
    for (let attempt = 1; attempt <= 2 && !parsedData; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const fullText = result.response.text();
        console.log(`📝 AI RAW (deneme ${attempt}, ilk 300):`, fullText.substring(0, 300));

        const cleanJson = extractJSON(fullText);
        const candidate = JSON.parse(cleanJson);

        if (!candidate.recipe || !candidate.recipe.name || !Array.isArray(candidate.recipe.steps) || candidate.recipe.steps.length === 0) {
          throw new Error('Tarif alanları eksik');
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

    if (!parsedData) throw lastError;

    console.log('✅ Tarif:', parsedData.recipe.name);
    console.log('📋 ChallengerTasks:', parsedData.challengerTasks.length);

    res.json(parsedData);

  } catch (error) {
    console.error('❌ Hata:', error.message);
    res.status(500).json({ error: 'Tarif oluşturulamadı' });
  }
});

app.post('/api/recipe/stream', async (req, res) => {
  try {
    const { ingredients, difficulty, cookName, challengerName, variationSeed, attemptNumber, previousRecipes, previousTasks } = req.body;

    if (!ingredients || !difficulty || !cookName || !challengerName) {
      return res.status(400).json({ error: 'Eksik parametreler' });
    }

    console.log('🤖 AI İsteği (stream):', { ingredients, difficulty, cookName, challengerName });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 16384,
        // Sef modu: iddiali tarif secimi icin dusunme butcesi ac; gundelik hizli kalsin
        thinkingConfig: { thinkingBudget: difficulty === 'sef' ? 2048 : 0 },
      }
    });

    const prompt = buildPrompt(ingredients, difficulty, cookName, challengerName, variationSeed, attemptNumber, previousRecipes, previousTasks);
    const result = await model.generateContentStream(prompt);

    let fullText = '';
    
    for await (const chunk of result.stream) {
      fullText += chunk.text();
      res.write(`data: ${JSON.stringify({ chunk: chunk.text() })}\n\n`);
    }

    try {
      const cleanJson = extractJSON(fullText);
      const parsedData = JSON.parse(cleanJson);
      console.log('✅ Tarif:', parsedData.recipe.name);
      res.write(`data: ${JSON.stringify({ done: true, data: parsedData })}\n\n`);
    } catch (parseError) {
      console.error('❌ JSON Hatası');
      res.write(`data: ${JSON.stringify({ error: 'Tarif oluşturulamadı' })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error('❌ Hata:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

function buildPrompt(ingredients, difficulty, cookName, challengerName, variationSeed, attemptNumber, previousRecipes, previousTasks) {
  const isGundelik = difficulty === 'gundelik';
  const seed = variationSeed || Math.floor(Math.random() * 100000);
  const prevList = (previousRecipes && previousRecipes.length) ? previousRecipes : [];
  const prevTasks = (previousTasks && previousTasks.length) ? previousTasks : [];
  const taskCandidates = sampleTasks(difficulty, seed);
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