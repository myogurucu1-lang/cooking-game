import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

// ───────────────────────────────────────────────────────────────
// Mağaza puanlama isteği — mutlu anda (oyun bitip puanlar verilince) sorulur.
// Kurallar:
//  - İlk istek: en az 2 tamamlanmış oyun sonrası
//  - "Daha sonra" derse: +5 oyun sonra tekrar, toplam en fazla 3 kez
//  - "Puanla" derse: bir daha asla sorulmaz (sistem penceresi açılır)
// ───────────────────────────────────────────────────────────────

var KEY_DONE = 'reviewDone';
var KEY_ASK_COUNT = 'reviewAskCount';
var KEY_NEXT_AT = 'reviewNextAskAtGames';

var MAX_ASKS = 3;
var FIRST_ASK_AT_GAMES = 2;
var RETRY_AFTER_GAMES = 5;

export async function maybeAskForReview(t) {
  try {
    var done = await AsyncStorage.getItem(KEY_DONE);
    if (done === '1') return;

    var askCount = parseInt((await AsyncStorage.getItem(KEY_ASK_COUNT)) || '0', 10);
    if (askCount >= MAX_ASKS) return;

    var historyRaw = await AsyncStorage.getItem('gameHistory');
    var gamesCompleted = historyRaw ? (JSON.parse(historyRaw) || []).length : 0;

    var nextAt = parseInt((await AsyncStorage.getItem(KEY_NEXT_AT)) || String(FIRST_ASK_AT_GAMES), 10);
    if (gamesCompleted < nextAt) return;

    var available = await StoreReview.isAvailableAsync().catch(function () { return false; });
    if (!available) return;

    Alert.alert(
      t('review.title'),
      t('review.message'),
      [
        {
          text: t('review.later'),
          style: 'cancel',
          onPress: function () {
            AsyncStorage.setItem(KEY_ASK_COUNT, String(askCount + 1)).catch(function () {});
            AsyncStorage.setItem(KEY_NEXT_AT, String(gamesCompleted + RETRY_AFTER_GAMES)).catch(function () {});
          },
        },
        {
          text: t('review.rate'),
          onPress: function () {
            AsyncStorage.setItem(KEY_DONE, '1').catch(function () {});
            StoreReview.requestReview().catch(function () {});
          },
        },
      ],
      { cancelable: true }
    );
  } catch (e) {
    // Puanlama isteği hiçbir zaman oyunu bozmamalı — sessizce geç
  }
}
