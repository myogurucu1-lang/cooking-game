// Gemini Relay — Cloud Run'da çalışır (Google'ın kendi ağı → IP engeli yok).
// Render backend'i, asıl Gemini çağrısını buraya devreder. Bu servis SADECE
// prompt alır, Gemini'yi çağırır ve metni geri döner. Tüm doğrulama/rate-limit/
// prompt mantığı Render tarafında kalır.
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json({ limit: '1mb' }));

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

app.get('/', (req, res) => {
  res.json({ status: 'OK', service: 'gemini-relay', keyLoaded: !!process.env.GOOGLE_AI_API_KEY });
});

app.post('/generate', async (req, res) => {
  // Sadece bizim Render backend'imiz çağırabilsin
  if (process.env.RELAY_SECRET && req.get('x-relay-key') !== process.env.RELAY_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const { prompt, thinkingBudget } = req.body || {};
    if (typeof prompt !== 'string' || prompt.length === 0) {
      return res.status(400).json({ error: 'no prompt' });
    }
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 16384,
        thinkingConfig: { thinkingBudget: Number(thinkingBudget) || 0 },
      },
    });
    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (e) {
    console.error('relay hata:', (e && e.message) || e);
    res.status(502).json({ error: String((e && e.message) || e).slice(0, 300) });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('gemini-relay dinleniyor:', PORT));
