import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Animated, Dimensions, Vibration, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW, SHADOW_SOFT } from '../theme';
import SpotlightTutorial from '../components/SpotlightTutorial';
import { useAudioPlayer } from 'expo-audio';
import { fireSource, dingSource } from '../utils/SoundManager';
import { mediumTap, lightTap, celebrationPattern } from '../utils/HapticManager';
import { useLang } from '../i18n';

var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

function StepCard(props) {
  var step = props.step;
  var index = props.index;
  var isActive = props.isActive;
  var isCompleted = props.isCompleted;
  var onToggle = props.onToggle;

  var scaleAnim = useRef(new Animated.Value(0.9)).current;
  var opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, delay: index * 100, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  var stepNumber = step.step || index + 1;
  // AI'dan instruction string gelmezse asla obje render etme (crash koruması)
  var instruction = typeof step === 'string'
    ? step
    : (step && typeof step.instruction === 'string' ? step.instruction : '');
  var duration = step.duration || null;
  var heat = step.heat || null;

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={function () { onToggle(index); }}
        style={[
          styles.stepCard,
          isActive && styles.stepCardActive,
          isCompleted && styles.stepCardCompleted,
        ]}
      >
        <View style={[
          styles.stepNumber,
          isActive && styles.stepNumberActive,
          isCompleted && styles.stepNumberCompleted,
        ]}>
          {isCompleted ? (
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.stepNumberText,
              (isActive || isCompleted) && styles.stepNumberTextActive,
            ]}>{stepNumber}</Text>
          )}
        </View>

        <View style={styles.stepContent}>
          <Text style={[styles.stepInstruction, isCompleted && styles.stepInstructionCompleted]}>{instruction}</Text>
          {(duration || heat) ? (
            <View style={styles.stepMeta}>
              {duration ? (
                <View style={styles.metaBadge}>
                  <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.metaText}>{duration}</Text>
                </View>
              ) : null}
              {heat ? (
                <View style={styles.metaBadge}>
                  <Ionicons name="flame-outline" size={13} color="#E74C3C" />
                  <Text style={styles.metaText}>{heat}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <Ionicons
          name={isCompleted ? "checkmark-circle" : "chevron-forward"}
          size={20}
          color={isCompleted ? COLORS.success : COLORS.textMuted}
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

function IngredientChip(props) {
  var ingredient = props.ingredient;
  var index = props.index;
  var fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.ingredientChip, { opacity: fadeAnim }]}>
      <Text style={styles.ingredientText}>{ingredient}</Text>
    </Animated.View>
  );
}

export default function CookScreen(props) {
  var navigation = props.navigation;
  var route = props.route;
  var insets = useSafeAreaInsets();
  var t = useLang().t;

  var cookName = route.params.cookName;
  var challengerName = route.params.challengerName;
  var ingredients = route.params.ingredients;
  var difficulty = route.params.difficulty;
  var recipe = route.params.recipe;

  var recipeData = recipe && recipe.recipe ? recipe.recipe : recipe;
  var challengerTasks = recipe && recipe.challengerTasks ? recipe.challengerTasks : [];
  var steps = recipeData && recipeData.steps ? recipeData.steps : [];
  var ingredientList = recipeData && recipeData.ingredients ? recipeData.ingredients : [];

  var firePlayer = useAudioPlayer(fireSource);
  var dingPlayer = useAudioPlayer(dingSource);

  var completedStepsState = useState([]);
  var completedSteps = completedStepsState[0];
  var setCompletedSteps = completedStepsState[1];

  var activeStepState = useState(0);
  var activeStep = activeStepState[0];
  var setActiveStep = activeStepState[1];

  var showIngredientsState = useState(true);
  var showIngredients = showIngredientsState[0];
  var setShowIngredients = showIngredientsState[1];

  // Görevler butonunun gerçek pozisyonu (onLayout ile dinamik)
  var spotlightAreaState = useState(null);
  var spotlightArea = spotlightAreaState[0];
  var setSpotlightArea = spotlightAreaState[1];

  // Sırası gelen görev bildirimi (banner)
  var alertTaskState = useState(null);
  var alertTask = alertTaskState[0];
  var setAlertTask = alertTaskState[1];

  // Bekleyen (henüz görevler ekranında görülmemiş) görev var mı — buton rozeti nabzı için
  var pendingState = useState(false);
  var hasPending = pendingState[0];
  var setHasPending = pendingState[1];

  var scrollRef = useRef(null);
  var challengerButtonRef = useRef(null);
  var rootRef = useRef(null);
  var headerAnim = useRef(new Animated.Value(0)).current;
  var bannerAnim = useRef(new Animated.Value(-160)).current;
  var iconPulse = useRef(new Animated.Value(1)).current;   // banner ⚡ ikonu nabzı
  var badgePulse = useRef(new Animated.Value(1)).current;  // buton rozeti nabzı
  var iconLoopRef = useRef(null);
  var badgeLoopRef = useRef(null);

  var startPulse = function (animVal, loopRef, toValue) {
    if (loopRef.current) return;
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(animVal, { toValue: toValue, duration: 600, useNativeDriver: true }),
        Animated.timing(animVal, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loopRef.current.start();
  };

  var stopPulse = function (animVal, loopRef) {
    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current = null;
    }
    animVal.setValue(1);
  };

  // Banner'ı kapat (görev hâlâ "bekliyor" sayılır — buton rozeti atmaya devam eder)
  var hideTaskAlert = function () {
    stopPulse(iconPulse, iconLoopRef);
    Animated.timing(bannerAnim, { toValue: -160, duration: 250, useNativeDriver: true }).start(function () {
      setAlertTask(null);
    });
  };

  var showTaskAlert = function (task) {
    setAlertTask(task);
    setHasPending(true);
    // İki kanal: güçlü titreşim + ding sesi (sessiz ortamda görsel kaçmasın)
    celebrationPattern();
    Vibration.vibrate([0, 300, 150, 300]);
    try { dingPlayer.seekTo(0); dingPlayer.play(); } catch (e) {}
    bannerAnim.setValue(-160);
    Animated.spring(bannerAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }).start();
    // Banner kaybolmaz; ⚡ ikonu sürekli nabız atar (hareket = dikkat, renk patlaması yok)
    startPulse(iconPulse, iconLoopRef, 1.25);
    startPulse(badgePulse, badgeLoopRef, 1.35);
  };

  // Verilen adım numarasında (1-bazlı) tetiklenen görevi bul; ana görev öncelikli
  var findTaskForStep = function (stepNumber) {
    var found = null;
    for (var i = 0; i < challengerTasks.length; i++) {
      var task = challengerTasks[i];
      if (task.triggerAtStep === stepNumber) {
        if (task.type === 'main' || task.type === 'big') return task;
        if (!found) found = task;
      }
    }
    return found;
  };

  var measureChallengerButton = function () {
    var btn = challengerButtonRef.current;
    var root = rootRef.current;
    if (!btn || !root || !btn.measureLayout) return;
    // Butonu KÖK View'e göre ölç. SpotlightTutorial overlay'i de aynı kök View
    // içinde top:0 ile durduğu için bu koordinatlar güvenli alandan/status
    // bar'dan/platformdan bağımsız birebir hizalanır.
    // Yeni mimaride (Fabric) measureLayout, hedef olarak ref örneği bekler
    // (findNodeHandle ile üretilen sayı değil).
    btn.measureLayout(
      root,
      function (x, y, width, height) {
        setSpotlightArea({
          x: x - 6,
          y: y - 4,
          width: width + 12,
          height: height + 8,
          radius: (height + 8) / 2,
        });
      },
      function () {}
    );
  };

  useEffect(function () {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Header animasyonu/yerleşim oturduktan sonra butonu tekrar ölç (onLayout
    // erken tetiklenirse kök ref hazır olmayabilir; bu yedek garanti sağlar).
    var t = setTimeout(measureChallengerButton, 700);

    // Ekran açıldığında ocak sesi + haptic
    firePlayer.play();
    mediumTap();

    // İlk adımın görevi varsa kısa gecikmeyle haber ver
    var firstTaskTimer = setTimeout(function () {
      var firstTask = findTaskForStep(1);
      if (firstTask) showTaskAlert(firstTask);
    }, 1500);

    return function () {
      clearTimeout(t);
      clearTimeout(firstTaskTimer);
      stopPulse(iconPulse, iconLoopRef);
      stopPulse(badgePulse, badgeLoopRef);
    };
  }, []);

  // Oyun ortasında çıkışta onay iste (Android donanım geri tuşu dahil).
  // "Yemeği Bitir" navigation.replace kullanır (REPLACE) — ona karışma.
  useEffect(function () {
    var unsubscribe = navigation.addListener('beforeRemove', function (e) {
      if (e.data.action.type === 'REPLACE') return;
      e.preventDefault();
      Alert.alert(
        t('cook.exitTitle'),
        t('cook.exitBody'),
        [
          { text: t('cook.stay'), style: 'cancel' },
          { text: t('cook.leave'), style: 'destructive', onPress: function () { navigation.dispatch(e.data.action); } },
        ]
      );
    });
    return unsubscribe;
  }, [navigation]);

  var toggleStep = function (index) {
    var wasCompleted = completedSteps.includes(index);

    setCompletedSteps(function (prev) {
      if (prev.includes(index)) {
        return prev.filter(function (i) { return i !== index; });
      }
      return prev.concat([index]);
    });

    if (!wasCompleted) {
      // Adım tamamlandı: hafif titreşim
      lightTap();
      Vibration.vibrate(80);

      if (index < steps.length - 1) {
        setActiveStep(index + 1);

        // Sıradaki adımın görevi varsa güçlü titreşim + bildirim banner'ı
        var nextStep = steps[index + 1];
        var nextStepNumber = (nextStep && nextStep.step) ? nextStep.step : index + 2;
        var upcomingTask = findTaskForStep(nextStepNumber);
        if (upcomingTask) showTaskAlert(upcomingTask);
      }
    }
  };

  var progress = steps.length > 0 ? completedSteps.length / steps.length : 0;
  var allDone = completedSteps.length === steps.length && steps.length > 0;

  var goToChallenger = function () {
    // Görevler ekranı açıldı: bekleyen görev "görüldü" — buton nabzı/rozeti söner
    setHasPending(false);
    stopPulse(badgePulse, badgeLoopRef);
    navigation.navigate('Challenger', {
      cookName: cookName,
      challengerName: challengerName,
      challengerTasks: challengerTasks,
      recipe: recipeData,
    });
  };

  var finishGame = function () {
    navigation.replace('Result', {
      cookName: cookName,
      challengerName: challengerName,
      difficulty: difficulty,
      recipeName: recipeData && recipeData.name ? recipeData.name : 'Tarif',
      totalSteps: steps.length,
      completedSteps: completedSteps.length,
      totalTasks: challengerTasks.length,
      prepTime: recipeData && recipeData.prepTime ? recipeData.prepTime : '',
    });
  };

  return (
    <View style={styles.container} ref={rootRef}>
      <View style={styles.safeArea}>
      <StatusBar style="light" />

      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={[styles.header, { paddingTop: 12 + insets.top }]}>
        <Animated.View style={[styles.headerContent, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={function () { navigation.goBack(); }} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              ref={challengerButtonRef}
              onPress={goToChallenger}
              onLayout={measureChallengerButton}
              style={styles.challengerButton}
            >
              <Text style={styles.challengerButtonEmoji}>⚡</Text>
              <Text style={styles.challengerButtonText}>{t('cook.tasks')}</Text>
              {challengerTasks.length > 0 ? (
                <Animated.View style={[
                  styles.taskBadge,
                  hasPending && styles.taskBadgePending,
                  hasPending && { transform: [{ scale: badgePulse }] },
                ]}>
                  <Text style={[styles.taskBadgeText, hasPending && styles.taskBadgeTextPending]}>{challengerTasks.length}</Text>
                </Animated.View>
              ) : null}
              {hasPending ? <View style={styles.pendingDot} /> : null}
            </TouchableOpacity>
          </View>

          <Text style={styles.recipeName}>{recipeData && recipeData.name ? recipeData.name : 'Tarif'}</Text>

          <View style={styles.infoRow}>
            {recipeData && recipeData.prepTime ? (
              <View style={styles.infoBadge}>
                <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                <Text style={styles.infoText}>{recipeData.prepTime}</Text>
              </View>
            ) : null}
            <View style={styles.infoBadge}>
              <Ionicons name="restaurant-outline" size={14} color="#FFFFFF" />
              <Text style={styles.infoText}>{difficulty === 'sef' ? t('setup.chef') : t('setup.everyday')}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: (progress * 100) + '%' }]} />
            </View>
            <Text style={styles.progressText}>{t('cook.stepCount', { done: completedSteps.length, total: steps.length })}</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView ref={scrollRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cookGreeting}>
          <Text style={styles.cookGreetingText}>👨‍🍳 {t('cook.greeting', { cook: cookName })}</Text>
        </View>

        {ingredientList.length > 0 ? (
          <View style={styles.section}>
            <TouchableOpacity onPress={function () { setShowIngredients(!showIngredients); }} style={styles.sectionHeader} activeOpacity={0.7}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionEmoji}>🥘</Text>
                <Text style={styles.sectionTitle}>{t('cook.ingredients')}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{ingredientList.length}</Text>
                </View>
              </View>
              <Ionicons name={showIngredients ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {showIngredients ? (
              <View style={styles.ingredientList}>
                {ingredientList.map(function (item, i) {
                  return <IngredientChip key={i} ingredient={item} index={i} />;
                })}
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>📝</Text>
            <Text style={styles.sectionTitle}>{t('cook.steps')}</Text>
          </View>

          <View style={styles.stepsContainer}>
            {steps.map(function (step, index) {
              return (
                <StepCard
                  key={index}
                  step={step}
                  index={index}
                  isActive={activeStep === index}
                  isCompleted={completedSteps.includes(index)}
                  onToggle={toggleStep}
                />
              );
            })}
          </View>

          {steps.length === 0 ? (
            <View style={styles.emptySteps}>
              <Text style={styles.emptyStepsEmoji}>🤔</Text>
              <Text style={styles.emptyStepsTitle}>{t('cook.emptyTitle')}</Text>
              <Text style={styles.emptyStepsText}>{t('cook.emptyText')}</Text>
              <TouchableOpacity style={styles.emptyStepsBtn} onPress={function () { navigation.goBack(); }} activeOpacity={0.8}>
                <Text style={styles.emptyStepsBtnText}>{t('cook.emptyBtn')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {steps.length > 0 ? (
        <TouchableOpacity
          style={[styles.finishButton, !allDone && styles.finishButtonDisabled]}
          onPress={finishGame}
          activeOpacity={0.8}
          disabled={!allDone}
        >
          <LinearGradient
            colors={allDone ? ['#FFD93D', '#F4C430'] : ['#CCCCCC', '#BBBBBB']}
            style={styles.finishGradient}
          >
            <Text style={styles.finishEmoji}>🏆</Text>
            <Text style={[styles.finishText, !allDone && styles.finishTextDisabled]}>
              {allDone ? t('cook.finish') : t('cook.finishProgress', { done: completedSteps.length, total: steps.length })}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
      </View>

      {/* Spotlight Tutorial - SafeAreaView DIŞINDA: top:0 == ekran tepesi olsun ki
          measureInWindow koordinatlarıyla iki platformda da birebir hizalansın */}
      {spotlightArea ? (
        <SpotlightTutorial
          storageKey="cookSpotlightSeen"
          maxShows={2}
          spotlight={spotlightArea}
          title={t('cook.spotlightTitle')}
          description={t('cook.spotlightDesc', { challenger: challengerName })}
          arrowDirection="up"
        />
      ) : null}

      {/* Görev zamanı bildirimi — üstten kayan banner */}
      {alertTask ? (
        <Animated.View style={[styles.taskAlert, { top: insets.top + 8, transform: [{ translateY: bannerAnim }] }]}>
          <TouchableOpacity
            style={styles.taskAlertInner}
            activeOpacity={0.9}
            onPress={function () {
              hideTaskAlert();
              goToChallenger();
            }}
          >
            <Animated.View style={[styles.taskAlertIconWrap, { transform: [{ scale: iconPulse }] }]}>
              <Text style={styles.taskAlertEmoji}>⚡</Text>
            </Animated.View>
            <View style={styles.taskAlertContent}>
              <Text style={styles.taskAlertTitle}>{t('cook.taskTime')}</Text>
              <Text style={styles.taskAlertDesc} numberOfLines={2}>
                {t('cook.taskHandoff', { title: (alertTask.triggerAtStep ? t('cook.stepPrefix', { n: alertTask.triggerAtStep }) : '') + alertTask.title, challenger: challengerName })}
              </Text>
            </View>
            <TouchableOpacity onPress={hideTaskAlert} style={styles.taskAlertClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: { paddingBottom: 18, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, ...SHADOW_SOFT },
  headerContent: {},
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  challengerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  challengerButtonEmoji: { fontSize: 16, marginRight: 5 },
  challengerButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  taskBadge: { backgroundColor: '#FFD93D', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  taskBadgePending: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FFD93D' },
  taskBadgeText: { fontSize: 11, fontWeight: '800', color: COLORS.brown },
  taskBadgeTextPending: { color: COLORS.primaryDark },
  pendingDot: { position: 'absolute', top: 2, right: 2, width: 9, height: 9, borderRadius: 5, backgroundColor: '#FFD93D', borderWidth: 1.5, borderColor: COLORS.primary },
  recipeName: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  recipeDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  infoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  infoText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFD93D', borderRadius: 3 },
  progressText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  cookGreeting: { backgroundColor: COLORS.primaryLight, padding: 14, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255, 107, 53, 0.15)' },
  cookGreetingText: { fontSize: 15, fontWeight: '600', color: COLORS.primaryDark, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  countBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  ingredientList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingredientChip: { backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  ingredientText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  stepsContainer: { gap: 10 },
  stepCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white, padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border, ...SHADOW },
  stepCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  stepCardCompleted: { borderColor: COLORS.success, backgroundColor: COLORS.successLight },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2, borderWidth: 1.5, borderColor: COLORS.border },
  stepNumberActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepNumberCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  stepNumberText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  stepNumberTextActive: { color: '#FFFFFF' },
  stepContent: { flex: 1 },
  stepInstruction: { fontSize: 14, lineHeight: 21, color: COLORS.text, fontWeight: '500' },
  stepInstructionCompleted: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
  stepMeta: { flexDirection: 'row', gap: 10, marginTop: 8 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255, 107, 53, 0.08)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  metaText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  finishButton: { marginTop: 10, borderRadius: 18, overflow: 'hidden' },
  finishButtonDisabled: { opacity: 0.6 },
  finishGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 24, borderRadius: 18, gap: 10 },
  finishEmoji: { fontSize: 24 },
  finishText: { fontSize: 18, fontWeight: '800', color: COLORS.brown },
  finishTextDisabled: { color: '#666666', fontSize: 14 },

  taskAlert: { position: 'absolute', left: 12, right: 12, zIndex: 500 },
  taskAlertInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondaryDark, borderRadius: 18, padding: 14, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  taskAlertIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  taskAlertEmoji: { fontSize: 22 },
  taskAlertContent: { flex: 1 },
  taskAlertTitle: { fontSize: 15, fontWeight: '900', color: '#FFFFFF', marginBottom: 2 },
  taskAlertDesc: { fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  taskAlertClose: { padding: 2 },

  emptySteps: { alignItems: 'center', padding: 32, backgroundColor: COLORS.white, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border },
  emptyStepsEmoji: { fontSize: 44, marginBottom: 10 },
  emptyStepsTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  emptyStepsText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 16 },
  emptyStepsBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  emptyStepsBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});