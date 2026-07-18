import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL, APP_SECRET } from '../config';
import ChaseAnimation from '../components/ChaseAnimation';
import DateNightDance from '../components/DateNightDance';
import { useLang, getLanguage } from '../i18n';

var LOADING_KEYS = ['trans.loading1', 'trans.loading2', 'trans.loading3', 'trans.loading4', 'trans.loading5', 'trans.loading6'];
var LOADING_KEYS_DN = ['trans.dn1', 'trans.dn2', 'trans.dn3', 'trans.dn4', 'trans.dn5'];

export default function TransitionScreen(props) {
  var route = props.route;
  var navigation = props.navigation;
  var t = useLang().t;

  var cookName = route.params.cookName;
  var challengerName = route.params.challengerName;
  var ingredients = route.params.ingredients;
  var difficulty = route.params.difficulty;
  var pack = route.params.pack || 'classic';

  var isDn = pack === 'datenight';
  var loadingKeys = isDn ? LOADING_KEYS_DN : LOADING_KEYS;

  var messageState = useState(0);
  var messageIndex = messageState[0];
  var setMessageIndex = messageState[1];

  useEffect(function () {
    var interval = setInterval(function () {
      setMessageIndex(function (prev) {
        return (prev + 1) % loadingKeys.length;
      });
    }, 1200);
    return function () { clearInterval(interval); };
  }, []);

  useEffect(function () {
    var isMounted = true;

    // AbortController: timeout'ta isteği gerçekten iptal et (arka planda sürmesin)
    var fetchWithTimeout = function (url, options, timeout) {
      if (!timeout) timeout = 35000;
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, timeout);
      return fetch(url, Object.assign({}, options, { signal: controller.signal }))
        .finally(function () { clearTimeout(timer); })
        .catch(function (err) {
          if (err && err.name === 'AbortError') {
            throw new Error(t('trans.timeout'));
          }
          throw err;
        });
    };

    // Aynı malzeme + zorluk kombinasyonu için ortak anahtar üret
    var comboKey = (ingredients + '_' + difficulty).toLowerCase().replace(/[^a-z0-9]/g, '_');
    var attemptKey = 'attempt_' + comboKey;
    var recipesKey = 'recipes_' + comboKey;
    var MAX_HISTORY = 8;

    // Görev geçmişi malzemeden bağımsız (global): son verilen görevler tekrar gelmesin
    var TASKS_KEY = 'usedTaskTitles';
    var MAX_TASK_HISTORY = 15;

    // Aynı malzeme kombinasyonu için kaçıncı deneme olduğunu takip et
    var getAttemptNumber = async function () {
      try {
        var stored = await AsyncStorage.getItem(attemptKey);
        var count = stored ? parseInt(stored, 10) : 0;
        count = count + 1;
        await AsyncStorage.setItem(attemptKey, String(count));
        return count;
      } catch (e) {
        return 1;
      }
    };

    // Daha önce üretilen tarif isimlerini oku. Liste MAX_HISTORY'ye ulaştıysa
    // kullanıcı gerçekçi seçenekleri tüketmiştir: listeyi sıfırla ki AI uydurma
    // yemeğe zorlanmasın, döngü baştan başlasın.
    var getPreviousRecipes = async function () {
      try {
        var stored = await AsyncStorage.getItem(recipesKey);
        var list = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list)) list = [];
        if (list.length >= MAX_HISTORY) {
          await AsyncStorage.removeItem(recipesKey);
          return [];
        }
        return list;
      } catch (e) {
        return [];
      }
    };

    // Son verilen görev başlıklarını oku (AI'ya "bunları tekrar verme" diye gider)
    var getPreviousTasks = async function () {
      try {
        var stored = await AsyncStorage.getItem(TASKS_KEY);
        var list = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list)) list = [];
        return list;
      } catch (e) {
        return [];
      }
    };

    // Yeni gelen görev başlıklarını geçmişe ekle (FIFO: en fazla MAX_TASK_HISTORY)
    var saveTaskTitles = async function (tasks) {
      if (!tasks || !tasks.length) return;
      try {
        var stored = await AsyncStorage.getItem(TASKS_KEY);
        var list = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list)) list = [];
        tasks.forEach(function (t) {
          if (t && t.title) list.push(t.title);
        });
        if (list.length > MAX_TASK_HISTORY) {
          list = list.slice(list.length - MAX_TASK_HISTORY);
        }
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(list));
      } catch (e) {
        // sessizce yok say
      }
    };

    // Yeni üretilen tarifi geçmişe ekle (FIFO: en fazla MAX_HISTORY, eskisi düşer)
    var saveRecipeName = async function (name) {
      if (!name) return;
      try {
        var stored = await AsyncStorage.getItem(recipesKey);
        var list = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list)) list = [];
        list.push(name);
        if (list.length > MAX_HISTORY) {
          list = list.slice(list.length - MAX_HISTORY);
        }
        await AsyncStorage.setItem(recipesKey, JSON.stringify(list));
      } catch (e) {
        // sessizce yok say
      }
    };

    var fetchRecipe = async function () {
      try {
        var attemptNumber = await getAttemptNumber();
        var previousRecipes = await getPreviousRecipes();
        var previousTasks = await getPreviousTasks();
        // Her istekte benzersiz bir varyasyon tohumu üret
        var variationSeed = Date.now() + Math.floor(Math.random() * 100000);

        var response = await fetchWithTimeout(BACKEND_URL + '/api/recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-app-key': APP_SECRET },
          body: JSON.stringify({
            ingredients: ingredients,
            difficulty: difficulty,
            cookName: cookName,
            challengerName: challengerName,
            variationSeed: variationSeed,
            attemptNumber: attemptNumber,
            previousRecipes: previousRecipes,
            previousTasks: previousTasks,
            language: getLanguage(),
            pack: pack === 'datenight' ? 'datenight' : undefined,
          }),
        }, 35000);

        var data = null;
        try {
          data = await response.json();
        } catch (parseErr) {
          throw new Error(t('trans.badResponse'));
        }

        if (!response.ok || (data && data.error)) {
          throw new Error((data && data.error) || t('trans.failed'));
        }

        // Üretilen tarifi ve görevleri geçmişe kaydet ki sonraki denemede tekrar gelmesin
        if (data && data.recipe && data.recipe.name) {
          await saveRecipeName(data.recipe.name);
        }
        if (data && data.challengerTasks) {
          await saveTaskTitles(data.challengerTasks);
        }

        if (!isMounted) return;

        navigation.replace('Cook', {
          cookName: cookName,
          challengerName: challengerName,
          ingredients: ingredients,
          difficulty: difficulty,
          pack: pack,
          recipe: data,
        });
      } catch (error) {
        if (!isMounted) return;
        console.log('❌ Fetch hatası:', error.message);
        // Geçersiz/uygunsuz malzeme: özel mesaj, tekrar denemenin anlamı yok
        if (error.message === 'invalid_ingredients') {
          Alert.alert(t('trans.invalidTitle'), t('trans.invalidIngredients'), [
            { text: t('trans.back'), onPress: function () { navigation.goBack(); } },
          ]);
          return;
        }
        var friendly = error.message || '';
        if (!friendly || friendly.indexOf('Network request failed') !== -1) {
          friendly = t('trans.unreachable');
        }
        Alert.alert(t('trans.errorTitle'), friendly + '\n\n' + t('trans.errorBody'), [
          { text: t('trans.back'), style: 'cancel', onPress: function () { navigation.goBack(); } },
          { text: t('trans.retry'), onPress: function () { fetchRecipe(); } },
        ]);
      }
    };

    fetchRecipe();
    return function () { isMounted = false; };
  }, []);

  return (
    <SafeAreaView style={[styles.container, isDn && styles.containerDn]}>
      {isDn ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Mum ışığı bokeh parıltıları */}
          <View style={[styles.bokeh, { width: 70, height: 70, left: 30, top: 120, backgroundColor: 'rgba(212,168,87,0.35)' }]} />
          <View style={[styles.bokeh, { width: 46, height: 46, right: 36, top: 210, backgroundColor: 'rgba(139,46,68,0.45)' }]} />
          <View style={[styles.bokeh, { width: 34, height: 34, left: 60, bottom: 220, backgroundColor: 'rgba(232,180,160,0.30)' }]} />
          <View style={[styles.bokeh, { width: 56, height: 56, right: 50, bottom: 300, backgroundColor: 'rgba(212,168,87,0.22)' }]} />
        </View>
      ) : null}

      {isDn ? <DateNightDance /> : <ChaseAnimation />}

      <View style={styles.overlay}>
        <Text style={styles.title}>{t(isDn ? 'trans.titleDn' : 'trans.title')}</Text>
        <Text style={[styles.subtitle, isDn && { color: '#E8B4A0' }]}>{t(loadingKeys[messageIndex])}</Text>
        <View style={styles.dotsContainer}>
          {loadingKeys.map(function (_, i) {
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  messageIndex === i && (isDn ? styles.dotActiveDn : styles.dotActive),
                ]}
              />
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF7A45',
  },
  containerDn: {
    backgroundColor: '#2A141B',
  },
  bokeh: {
    position: 'absolute',
    borderRadius: 999,
  },
  dotActiveDn: {
    backgroundColor: '#E8B4A0',
    width: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 100,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFF1EA',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
});