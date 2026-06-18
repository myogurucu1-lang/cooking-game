import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// ───────────────────────────────────────────────────────────────
// REKLAM AYARLARI
// Şu an Google'ın TEST reklamları gösteriliyor (USE_TEST_ADS = true).
// AdMob hesabı açıldığında:
//   1) app.json içindeki react-native-google-mobile-ads > android_app_id / ios_app_id
//      değerlerini gerçek App ID ile değiştir.
//   2) Aşağıdaki REAL_* değerlerine gerçek reklam birimi ID'lerini gir.
//   3) USE_TEST_ADS = false yap.
// ───────────────────────────────────────────────────────────────
var USE_TEST_ADS = true;

var REAL_BANNER = {
  android: 'ca-app-pub-2603931978234460/7064153679',
  ios: 'ca-app-pub-2603931978234460/7064153679', // iOS ayrı birim açılınca güncellenecek
};
var REAL_INTERSTITIAL = {
  android: 'ca-app-pub-2603931978234460/9870546344',
  ios: 'ca-app-pub-2603931978234460/9870546344', // iOS ayrı birim açılınca güncellenecek
};

function pick(real) {
  return Platform.OS === 'ios' ? real.ios : real.android;
}

export var bannerAdUnitId = USE_TEST_ADS ? TestIds.BANNER : pick(REAL_BANNER);
export var interstitialAdUnitId = USE_TEST_ADS ? TestIds.INTERSTITIAL : pick(REAL_INTERSTITIAL);
