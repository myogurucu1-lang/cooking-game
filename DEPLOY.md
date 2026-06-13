# Yayın Rehberi — Backend Deploy + Uyku Önleme

Bu uygulamada mobil kısım (Expo) telefonda çalışır, ama tarifleri üreten **backend'in
internette bir sunucuda çalışması** gerekir. Aşağıda en kolay ücretsiz yol anlatılıyor:
**Render (sunucu) + UptimeRobot (uyumayı önleyen dürtücü).**

---

## Bölüm 1 — Kodu GitHub'a yükle

Render, kodu GitHub'dan çeker. (Hesabın yoksa github.com'dan ücretsiz aç.)

1. github.com → sağ üst **+** → **New repository** → isim ver (örn. `cooking-app`) → **Private** seç → **Create**.
2. Açılan sayfadaki "push an existing repository" komutlarını kopyala. Terminalde proje
   klasöründe çalıştır (Claude bunu senin için de yapabilir):
   ```
   git remote add origin https://github.com/KULLANICI_ADIN/cooking-app.git
   git push -u origin main
   ```
> NOT: `.env` dosyası `.gitignore` ile korunuyor, GitHub'a GİTMEZ. API anahtarın güvende.

---

## Bölüm 2 — Render'da backend'i yayınla

1. render.com → **Get Started** → GitHub ile giriş yap.
2. Dashboard → **New +** → **Web Service**.
3. GitHub repo'nu seç (`cooking-app`) → **Connect**.
4. Ayarları şöyle gir:
   - **Name**: `cooking-backend` (serbest)
   - **Root Directory**: `backend`   ← ÇOK ÖNEMLİ
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Free**
5. Aşağıda **Environment Variables** bölümüne 2 değişken ekle
   (değerleri `backend/.env` dosyandan kopyala):
   - `GOOGLE_AI_API_KEY` = (kendi anahtarın)
   - `APP_SECRET` = (kendi secret'ın)
   > PORT eklemene gerek yok, Render otomatik veriyor.
6. **Create Web Service** → birkaç dakika bekle. Bitince üstte bir adres çıkar:
   `https://cooking-backend-xxxx.onrender.com`  → bu adresi kopyala.
7. Test et: tarayıcıda `https://cooking-backend-xxxx.onrender.com/health` aç.
   `{"status":"OK",...}` görürsen backend yayında. ✅

---

## Bölüm 3 — Mobil uygulamayı bu adrese bağla

`mobile/config.js` dosyasında:
```js
const PROD_URL = 'https://cooking-backend-xxxx.onrender.com';  // ← Render adresini yapıştır
const USE_PROD = true;                                          // ← true yap
```
(Claude bunu senin için yapabilir; sadece Render adresini ver.)

---

## Bölüm 4 — UptimeRobot ile uykuyu önle (cold start çözümü)

Render ücretsiz plan 15 dk işlem görmezse uyur, uyanması ~50 sn sürer. UptimeRobot her
5 dakikada bir `/health`'i dürterek servisi sürekli uyanık tutar → cold start yaşanmaz.

1. uptimerobot.com → ücretsiz hesap aç.
2. Dashboard → **+ New monitor**.
3. Ayarlar:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `cooking-backend`
   - **URL**: `https://cooking-backend-xxxx.onrender.com/health`
   - **Monitoring Interval**: **5 minutes**
4. **Create Monitor**. Bitti — artık servis hiç uyumaz.

---

## Bilmen gereken sınırlar (dürüst notlar)

- **750 saat/ay kuralı:** Render ücretsiz tüm servisler için ayda 750 saat verir. Bir ay
  ~730 saat, yani TEK servisi 7/24 uyanık tutmak limite sığar. Ama ikinci bir ücretsiz
  servis daha açarsan limit aşılır — bu projede tek servis yeterli, sorun yok.
- **Gri alan:** Render bu "ping'le uyanık tutma" yöntemini sevmiyor (seni ücretli plana
  itmek istiyor). Hobi/küçük uygulamada pratikte sorun çıkmaz, ama resmî olarak teşvik
  edilmiyor.
- **Gerçek kullanıcı gelirse:** Render'ın $7/ay "Starter" planı hiç uyumaz, UptimeRobot'a
  bile gerek kalmaz. Uygulaman tutarsa bu plana geçmek en temiz çözüm.
- **Alternatif platformlar:** Fly.io / Railway / Cloudflare Workers de var ama hepsi ya
  ücretli ya da daha çok kurulum istiyor. Başlangıç için Render + UptimeRobot en kolayı.
