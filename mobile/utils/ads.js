import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// ───────────────────────────────────────────────────────────────
// REKLAM AYARLARI
// Geliştirmede (Expo Go / dev build) otomatik TEST reklamları,
// production build'lerde (EAS production profili) GERÇEK reklamlar gösterilir.
// Kendi cihazında gerçek reklamlara tıklama — AdMob geçersiz trafik sayar.
// ───────────────────────────────────────────────────────────────
var USE_TEST_ADS = __DEV__;

var REAL_BANNER = {
  android: 'ca-app-pub-2603931978234460/7064153679',
  ios: 'ca-app-pub-2603931978234460/9771651027',
};
var REAL_INTERSTITIAL = {
  android: 'ca-app-pub-2603931978234460/9870546344',
  ios: 'ca-app-pub-2603931978234460/7658669175',
};

function pick(real) {
  return Platform.OS === 'ios' ? real.ios : real.android;
}

export var bannerAdUnitId = USE_TEST_ADS ? TestIds.BANNER : pick(REAL_BANNER);
export var interstitialAdUnitId = USE_TEST_ADS ? TestIds.INTERSTITIAL : pick(REAL_INTERSTITIAL);
