// Geliştirme: bilgisayarının yerel ağ IP'si (telefon aynı Wi-Fi'da olmalı).
// Yayın öncesi: backend'i HTTPS'li bir hosta deploy edip PROD_URL'i doldur ve USE_PROD'u true yap.
const DEV_URL = 'http://192.168.1.167:3001';
const PROD_URL = 'https://DOLDUR-deploy-sonrasi.example.com';
const USE_PROD = false;

export const BACKEND_URL = USE_PROD ? PROD_URL : DEV_URL;

// Backend ile paylaşılan istek imzası — backend/.env içindeki APP_SECRET ile aynı olmalı
export const APP_SECRET = '01ef1d59856b90e0b70c0435b3c0cacbefbe27c38b0ad034';
