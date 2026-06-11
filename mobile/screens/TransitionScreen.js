import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL, APP_SECRET } from '../config';
import ChaseAnimation from '../components/ChaseAnimation';

var LOADING_MESSAGES = [
  'Sebzeler hazırlanıyor...',
  'Tarif yazılıyor...',
  'Görevler kuruluyor...',
  'Mutfakta küçük bir kaos...',
  'Soğan domatesi kovalıyor...',
  'Malzemeler buluşuyor...',
];

export default function TransitionScreen(props) {
  var route = props.route;
  var navigation = props.navigation;

  var cookName = route.params.cookName;
  var challengerName = route.params.challengerName;
  var ingredients = route.params.ingredients;
  var difficulty = route.params.difficulty;

  var messageState = useState(0);
  var messageIndex = messageState[0];
  var setMessageIndex = messageState[1];

  useEffect(function () {
    var interval = setInterval(function () {
      setMessageIndex(function (prev) {
        return (prev + 1) % LOADING_MESSAGES.length;
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
            throw new Error('Bağlantı zaman aşımına uğradı.');
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
          }),
        }, 35000);

        var data = null;
        try {
          data = await response.json();
        } catch (parseErr) {
          throw new Error('Sunucudan beklenmeyen yanıt geldi.');
        }

        if (!response.ok || (data && data.error)) {
          throw new Error((data && data.error) || 'Tarif oluşturulamadı');
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
          recipe: data,
        });
      } catch (error) {
        if (!isMounted) return;
        console.log('❌ Fetch hatası:', error.message);
        var friendly = error.message || '';
        if (!friendly || friendly.indexOf('Network request failed') !== -1) {
          friendly = 'Sunucuya ulaşılamadı.';
        }
        Alert.alert('Bağlantı Sorunu', friendly + '\n\nİnternet bağlantını kontrol edip tekrar deneyebilirsin.', [
          { text: 'Geri Dön', style: 'cancel', onPress: function () { navigation.goBack(); } },
          { text: 'Tekrar Dene', onPress: function () { fetchRecipe(); } },
        ]);
      }
    };

    fetchRecipe();
    return function () { isMounted = false; };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ChaseAnimation />

      <View style={styles.overlay}>
        <Text style={styles.title}>Oyun Başlıyor</Text>
        <Text style={styles.subtitle}>{LOADING_MESSAGES[messageIndex]}</Text>
        <View style={styles.dotsContainer}>
          {LOADING_MESSAGES.map(function (_, i) {
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  messageIndex === i && styles.dotActive,
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