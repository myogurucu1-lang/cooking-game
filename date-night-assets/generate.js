// Date Night görsel üretimi — Gemini image API (nano banana)
// Kullanım: node generate.js <jobAdı>   (jobAdı: bg-night-kitchen | bg-final-table | cook | challenger)
const fs = require('fs');
const path = require('path');
// Windows'ta DNS bazen once IPv6 dondurup baglantiyi asiyor — IPv4'u tercih et
require('dns').setDefaultResultOrder('ipv4first');

// API anahtarını backend/.env'den oku (anahtar asla loglanmaz)
const envText = fs.readFileSync(path.join(__dirname, '..', 'backend', '.env'), 'utf8');
const KEY = (envText.match(/^GOOGLE_AI_API_KEY=(.+)$/m) || [])[1].trim();
if (!KEY) { console.error('API anahtarı bulunamadı'); process.exit(1); }

const ASSETS = path.join(__dirname, '..', 'mobile', 'assets');

const JOBS = {
  'tomato-dn': {
    ref: path.join(__dirname, 'tomato-dn-raw.png'),
    out: 'tomato-dn-tux-raw.png',
    prompt: `Redraw this exact same cute shy tomato character, same style, same face, same shy bashful smile with curved happy eyes and pink blush — but now wearing an elegant black tuxedo suit on its body (like a matching outfit with a partner character): black jacket with white shirt front and its black bow tie. Keep the green leaves on top and the same proportions. IMPORTANT: completely flat, solid, uniform MAGENTA background (#FF00FF), no gradients, no shadows, no other elements. Character centered, full body visible, square image.`,
  },
  'onion-dn': {
    ref: path.join(ASSETS, 'foods', 'onion.png'),
    out: 'onion-dn-raw.png',
    prompt: `Redraw this exact same cute onion character in the exact same style, same proportions — dressed for a romantic date, holding a single small red rose in one hand. Its expression is a SHY, BASHFUL SMILE: gentle closed-mouth smile, eyes softly curved with happiness (slightly closed, bashful), strong pink blush on the cheeks. No smug or serious look — only a warm shy smile. IMPORTANT: place the character on a completely flat, solid, uniform MAGENTA background (#FF00FF) with no gradients, no shadows, no other elements. Character centered, full body visible, square image.`,
  },
  'cook-clean': {
    ref: path.join(__dirname, 'cook-datenight-cropped.png'),
    out: 'cook-clean-raw.png',
    prompt: `Redraw this exact same cute chef character — same face, same burgundy chef jacket with bow tie, same chef hat, same rose in hand, same warm smile and blush, same soft 3D style and proportions — but WITHOUT any background: place the character on a completely flat, solid, uniform MAGENTA background (#FF00FF). No bokeh, no candles, no gradients, no shadows on the background. Character centered, full body visible, square image.`,
  },
  'challenger-clean': {
    ref: path.join(__dirname, 'challenger-datenight-cropped.png'),
    out: 'challenger-clean-raw.png',
    prompt: `Redraw this exact same cute character — same face, same burgundy bandana with heart motif, same dark apron with rose-gold details, same crossed arms and confident smile, same soft 3D style and proportions — but WITHOUT any background: place the character on a completely flat, solid, uniform MAGENTA background (#FF00FF). No bokeh, no candles, no gradients, no shadows on the background. Character centered, full body visible, square image.`,
  },
  'heart': {
    ref: path.join(ASSETS, 'foods', 'tomato.png'),
    out: 'heart-raw.png',
    prompt: `A single cute glossy heart shape in the same soft cartoon illustration style as this reference character (same outline thickness, same soft shading). Deep romantic red-burgundy color (#A62639 body with #8B2E44 shading and a small light glossy highlight). Just the heart, nothing else. IMPORTANT: completely flat, solid, uniform MAGENTA background (#FF00FF), no gradients, no shadows, no other elements. Heart centered, square image.`,
  },
  'bg-night-kitchen': {
    ref: path.join(ASSETS, 'background.jpg'),
    out: 'bg-night-kitchen.png',
    prompt: `Transform this cozy illustrated kitchen into its nighttime, romantic version. Same kitchen, same composition and same soft 3D illustration style, but now at night: warm dim lighting, lit candles on the counter, a soft amber lamp glow. In the blurred background, a small romantic dinner table for two is set — white tablecloth, two lit candles, two wine glasses, a single rose. Color mood: deep burgundy (#8B2E44), warm near-black shadows (#1C1315), amber and rose-gold candlelight glow (#E8B4A0, #D4A857). Gentle bokeh light spots. Vertical portrait orientation 9:16, soft and slightly muted so UI elements can sit on top. No people, no text.`,
  },
  'bg-night-kitchen-dark': {
    ref: path.join(ASSETS, 'background.jpg'),
    out: 'bg-night-kitchen-dark.png',
    prompt: `Transform this cozy illustrated kitchen into its late-night, moody romantic version. Same kitchen, same composition and same soft 3D illustration style, but now much darker: most lights are off, the room is lit ONLY by candlelight and one dim amber lamp. Deep burgundy (#5C1A2B) and near-black (#1C1315) shadows dominate; surfaces catch warm amber and rose-gold candle glow (#E8B4A0, #D4A857). In the softly blurred background, a small romantic dinner table for two — white tablecloth, two lit candles, two wine glasses, a single rose — glows warmly in the darkness. Gentle bokeh light spots. Overall dark, intimate, cinematic mood while keeping the cute soft illustration style. Vertical portrait 9:16, muted so UI can sit on top. No people, no text.`,
  },
  'bg-kitchen-bordo': {
    ref: path.join(ASSETS, 'background.jpg'),
    out: 'bg-kitchen-bordo.png',
    prompt: `Transform this cozy illustrated kitchen into its romantic candlelit "date night" version, keeping the SAME kitchen, same composition and same soft 3D illustration style. All the kitchen items stay visible: shelves, jars, mugs, utensils, the stand mixer, cutting boards, plants. The color palette shifts to deep burgundy and wine tones: walls and wood take on burgundy (#8B2E44) and deep wine (#5C1A2B) hues, shadows are warm near-black (#1C1315). Several lit candles are placed among the kitchen items on the counter and shelves, casting a warm amber and rose-gold glow (#E8B4A0, #D4A857). A few soft bokeh light spots and one or two rose petals on the counter. Moody but still cute and inviting, medium darkness so UI elements remain readable on top. NO dinner table, NO people. Vertical portrait 9:16. No text.`,
  },
  'bg-final-table': {
    ref: path.join(__dirname, 'bg-kitchen-bordo.png'),
    out: 'bg-final-table.png',
    prompt: `Inside this exact same candlelit kitchen — same illustration style, same warm rosy-amber lighting, same colors — a small romantic dinner table for two has now been set in the foreground, as the hero of the scene: a table with a soft tablecloth, two lit candles, two set plates with cutlery, two glasses of red wine, a single red rose in a small vase, a few rose petals. Behind the table, the SAME kitchen from the reference image (shelves, tiles, jars, candles) remains visible but softly blurred, so the scene clearly reads as "dinner served in this same kitchen". Keep the same warm palette and glow as the reference. The upper third of the image stays calm and uncluttered for UI. Vertical portrait 9:16. No people, no text.`,
  },
  'cook': {
    ref: path.join(ASSETS, 'cook.png'),
    out: 'cook-datenight.png',
    prompt: `Redraw this exact same character in the exact same soft 3D illustration style, but dressed for a romantic dinner evening: keep the chef hat, but add a smart dark burgundy (#8B2E44) chef jacket with a small bow tie, holding a single red rose in one hand, warm happy smile, slight blush. Background: soft dark warm tones with candlelight bokeh glow (amber #D4A857). Same face, same proportions, same age and personality as the original — only the outfit and mood change. Square image, character centered.`,
  },
  'challenger': {
    ref: path.join(ASSETS, 'challenger.png'),
    out: 'challenger-datenight.png',
    prompt: `Redraw this exact same character in the exact same soft 3D illustration style, but styled for a romantic dinner evening: keep the bandana but make it deep burgundy (#8B2E44) with a small heart motif instead of the flame, add an elegant dark apron with rose-gold details, arms crossed with a playful confident smile. Background: soft dark warm tones with candlelight bokeh (amber #D4A857). Same face, same proportions, same personality as the original — only outfit and mood change. Square image, character centered.`,
  },
};

const jobName = process.argv[2];
const job = JOBS[jobName];
if (!job) { console.error('Geçersiz job. Seçenekler: ' + Object.keys(JOBS).join(', ')); process.exit(1); }

(async () => {
  const parts = [{ text: job.prompt }];
  if (job.ref) {
    const refData = fs.readFileSync(job.ref);
    const mime = job.ref.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
    parts.push({ inline_data: { mime_type: mime, data: refData.toString('base64') } });
  }

  const body = {
    contents: [{ parts }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  };

  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
    { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY }, body: JSON.stringify(body) }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error('API hatası HTTP ' + res.status + ': ' + errText.slice(0, 400));
    process.exit(1);
  }

  const json = await res.json();
  const outParts = (((json.candidates || [])[0] || {}).content || {}).parts || [];
  const imgPart = outParts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) {
    console.error('Yanıtta görsel yok. Yanıt özeti: ' + JSON.stringify(json).slice(0, 400));
    process.exit(1);
  }
  const data = (imgPart.inlineData || imgPart.inline_data).data;
  const outPath = path.join(__dirname, job.out);
  fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
  console.log('Üretildi: ' + outPath + ' (' + Math.round(Buffer.from(data, 'base64').length / 1024) + ' KB)');
})();
