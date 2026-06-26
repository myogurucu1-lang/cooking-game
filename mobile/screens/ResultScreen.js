import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
// SDK 54'te varsayılan API değişti: documentDirectory/moveAsync artık 'legacy' girişinde
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW, SHADOW_SOFT } from '../theme';
import { useAudioPlayer } from 'expo-audio';
import { dingSource } from '../utils/SoundManager';
import { celebrationPattern, successNotification } from '../utils/HapticManager';
import { useLang, getLanguage } from '../i18n';
import { getResultScore, getRankTier, getRankLabel, pickVerdict } from '../utils/verdict';

var screenWidth = Dimensions.get('window').width;

function ConfettiPiece(props) {
  var delay = props.delay;
  var startX = props.startX;

  var fallAnim = useRef(new Animated.Value(-20)).current;
  var rotateAnim = useRef(new Animated.Value(0)).current;
  var opacityAnim = useRef(new Animated.Value(1)).current;
  var swayAnim = useRef(new Animated.Value(0)).current;

  // Renk/boyut sabit kalsın: render gövdesinde random olursa her re-render'da konfeti değişir
  var pieceStyle = useRef({
    color: ['#FFD93D', '#FF6B35', '#4ECDC4', '#E74C3C', '#9B59B6', '#3498DB', '#2ECC71'][Math.floor(Math.random() * 7)],
    size: 8 + Math.random() * 8,
  }).current;
  var color = pieceStyle.color;
  var size = pieceStyle.size;

  useEffect(function () {
    var timeout = setTimeout(function () {
      Animated.parallel([
        Animated.timing(fallAnim, { toValue: 800, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 10, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 3000 + Math.random() * 2000, delay: 1500, useNativeDriver: true }),
        // Sınırlı iterasyon: görünmez parçalar sonsuza dek anime olmasın (ekran açık kaldıkça CPU yemesin)
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, { toValue: 30, duration: 500, useNativeDriver: true }),
            Animated.timing(swayAnim, { toValue: -30, duration: 500, useNativeDriver: true }),
          ]),
          { iterations: 6 }
        ),
      ]).start();
    }, delay);
    return function () { clearTimeout(timeout); };
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute', left: startX, top: 0,
        width: size, height: size * 0.6,
        backgroundColor: color, borderRadius: 2,
        opacity: opacityAnim,
        transform: [
          { translateY: fallAnim },
          { translateX: swayAnim },
          { rotate: rotateAnim.interpolate({ inputRange: [0, 10], outputRange: ['0deg', '3600deg'] }) },
        ],
      }}
    />
  );
}

function BadgeCard(props) {
  var emoji = props.emoji;
  var title = props.title;
  var subtitle = props.subtitle;
  var color = props.color;
  var delay = props.delay;

  var scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    var timeout = setTimeout(function () {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.15, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      ]).start();
    }, delay);
    return function () { clearTimeout(timeout); };
  }, []);

  return (
    <Animated.View style={[styles.badgeCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.badgeIcon, { backgroundColor: color + '20' }]}>
        <Text style={styles.badgeEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.badgeTitle}>{title}</Text>
      <Text style={styles.badgeSubtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

function StarRating(props) {
  var label = props.label;
  var playerName = props.playerName;
  var onRate = props.onRate;
  var rating = props.rating;
  var t = useLang().t;

  return (
    <View style={styles.ratingSection}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <Text style={styles.ratingPlayer}>{playerName}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(function (star) {
          return (
            <TouchableOpacity key={star} onPress={function () { onRate(star); }} activeOpacity={0.7}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={36}
                color={star <= rating ? '#FFD93D' : '#CCCCCC'}
                style={styles.starIcon}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      {rating > 0 ? (
        <Text style={styles.ratingText}>{t('res.rate' + rating)}</Text>
      ) : null}
    </View>
  );
}

function StatItem(props) {
  var icon = props.icon;
  var value = props.value;
  var label = props.label;
  var color = props.color;

  var fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(function () {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 800, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.statItem, { opacity: fadeAnim }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function ResultScreen(props) {
  var navigation = props.navigation;
  var route = props.route;
  var insets = useSafeAreaInsets();
  var t = useLang().t;

  var cookName = route.params.cookName;
  var challengerName = route.params.challengerName;
  var difficulty = route.params.difficulty;
  var recipeName = route.params.recipeName;
  var totalSteps = route.params.totalSteps;
  var completedSteps = route.params.completedSteps;
  var totalTasks = route.params.totalTasks;
  var prepTime = route.params.prepTime;

  // Skor + rütbe + komik jüri yorumu — bir kez hesaplanır (re-render'da sabit kalır)
  var lang = getLanguage();
  var resultRef = useRef((function () {
    var tier = getRankTier(completedSteps, totalSteps);
    return {
      score: getResultScore(completedSteps, totalSteps, difficulty, totalTasks),
      rank: getRankLabel(tier, lang),
      verdict: pickVerdict(tier, lang, cookName, Date.now()),
    };
  })());
  var result = resultRef.current;

  var displayScoreState = useState(0);
  var displayScore = displayScoreState[0];
  var setDisplayScore = displayScoreState[1];

  var cookRatingState = useState(0);
  var cookRating = cookRatingState[0];
  var setCookRating = cookRatingState[1];

  var challengerRatingState = useState(0);
  var challengerRating = challengerRatingState[0];
  var setChallengerRating = challengerRatingState[1];

  var showCameraState = useState(false);
  var showCamera = showCameraState[0];
  var setShowCamera = showCameraState[1];

  var photoUriState = useState(null);
  var photoUri = photoUriState[0];
  var setPhotoUri = photoUriState[1];

  // Kayıt kimliği senkron üretilir: kullanıcı kayıt tamamlanmadan yıldıza bassa bile
  // sonraki güncellemeler aynı id üzerinden geçmişi bulur
  var historyIdRef = useRef(Date.now().toString());
  var historyId = historyIdRef.current;

  var cameraRef = useRef(null);
  var titleAnim = useRef(new Animated.Value(0)).current;
  var subtitleAnim = useRef(new Animated.Value(0)).current;

  var dingPlayer = useAudioPlayer(dingSource);

  useEffect(function () {
    Animated.sequence([
      Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(subtitleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    dingPlayer.play();
    celebrationPattern();

    saveToHistory();
  }, []);

  // Skor sayarak artsın (easeOut); bitince başarı titreşimi
  useEffect(function () {
    var target = result.score;
    if (target <= 0) { setDisplayScore(0); return; }
    var duration = 1300;
    var startTime = Date.now();
    var interval = setInterval(function () {
      var progress = Math.min((Date.now() - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 2);
      setDisplayScore(Math.round(target * eased));
      if (progress >= 1) {
        clearInterval(interval);
        successNotification();
      }
    }, 40);
    return function () { clearInterval(interval); };
  }, []);

  var saveToHistory = async function () {
    try {
      var id = historyIdRef.current;
      var historyItem = {
        id: id,
        date: new Date().toISOString(),
        recipeName: recipeName,
        cookName: cookName,
        challengerName: challengerName,
        difficulty: difficulty,
        totalSteps: totalSteps,
        completedSteps: completedSteps,
        totalTasks: totalTasks,
        prepTime: prepTime,
        cookRating: 0,
        challengerRating: 0,
        photoUri: null,
        photoFileName: null,
      };

      var existing = await AsyncStorage.getItem('cookingHistory');
      var history = existing ? JSON.parse(existing) : [];
      history.push(historyItem);
      // Geçmişi sınırla: en eski kayıtlar düşer (sınırsız büyüme önlenir)
      if (history.length > 100) {
        history = history.slice(history.length - 100);
      }
      await AsyncStorage.setItem('cookingHistory', JSON.stringify(history));
      console.log('Geçmişe kaydedildi:', recipeName);
    } catch (error) {
      console.log('Kayit hatasi:', error);
    }
  };

  var updateRatings = async function (newCookRating, newChallengerRating) {
    try {
      if (!historyId) return;
      var existing = await AsyncStorage.getItem('cookingHistory');
      if (!existing) return;
      var history = JSON.parse(existing);
      var index = history.findIndex(function (item) { return item.id === historyId; });
      if (index !== -1) {
        history[index].cookRating = newCookRating;
        history[index].challengerRating = newChallengerRating;
        await AsyncStorage.setItem('cookingHistory', JSON.stringify(history));
      }
    } catch (error) {
      console.log('Puan guncelleme hatasi:', error);
    }
  };

  var handleCookRating = function (star) {
    setCookRating(star);
    updateRatings(star, challengerRating);
  };

  var handleChallengerRating = function (star) {
    setChallengerRating(star);
    updateRatings(cookRating, star);
  };

  var takePhoto = async function () {
    try {
      console.log('📸 Kamera butonu basildi');

      var currentPermission = await Camera.getCameraPermissionsAsync();
      console.log('📸 Mevcut izin durumu:', JSON.stringify(currentPermission));

      if (!currentPermission.granted) {
        if (currentPermission.canAskAgain) {
          console.log('📸 Izin isteniyor...');
          var result = await Camera.requestCameraPermissionsAsync();
          console.log('📸 Izin sonucu:', JSON.stringify(result));

          if (!result.granted) {
            Alert.alert(t('res.permTitle'), t('res.permBody'));
            return;
          }
        } else {
          Alert.alert(
            t('res.permDeniedTitle'),
            t('res.permDeniedBody'),
            [{ text: t('res.ok') }]
          );
          return;
        }
      }

      console.log('📸 Kamera aciliyor...');
      setShowCamera(true);
    } catch (error) {
      console.log('📸 Kamera acma hatasi:', error);
      Alert.alert(t('res.errorTitle'), t('res.cameraOpenError', { msg: error.message }));
    }
  };

  var capturePhoto = async function () {
    console.log('📸 Cek butonu basildi, ref:', cameraRef.current ? 'VAR' : 'YOK');

    if (cameraRef.current) {
      try {
        console.log('📸 Fotograf cekiliyor...');
        var photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        console.log('📸 Fotograf cekildi:', photo.uri);

        var fileName = 'cooking_' + Date.now() + '.jpg';
        var newUri = FileSystem.documentDirectory + fileName;
        await FileSystem.moveAsync({ from: photo.uri, to: newUri });
        console.log('📸 Fotograf kaydedildi:', newUri);

        setPhotoUri(newUri);
        setShowCamera(false);

        var existing = await AsyncStorage.getItem('cookingHistory');
        if (existing) {
          var history = JSON.parse(existing);
          var index = history.findIndex(function (item) { return item.id === historyId; });
          if (index !== -1) {
            // Dosya ADI da saklanır: iOS'ta uygulama güncellemesinde container yolu
            // değişir, mutlak photoUri geçersizleşir — History dosya adından yeniden kurar
            history[index].photoUri = newUri;
            history[index].photoFileName = fileName;
            await AsyncStorage.setItem('cookingHistory', JSON.stringify(history));
            console.log('📸 Fotograf gecmise eklendi');
          }
        }
      } catch (error) {
        console.log('📸 Fotograf hatasi:', error);
        Alert.alert(t('res.errorTitle'), t('res.photoError', { msg: error.message }));
        setShowCamera(false);
      }
    } else {
      console.log('📸 HATA: cameraRef null!');
      Alert.alert(t('res.errorTitle'), t('res.cameraNotReady'));
    }
  };

  var badges = [];
  badges.push({ emoji: '👨‍🍳', title: t('res.badgeStarChef'), subtitle: cookName, color: COLORS.primary });
  badges.push({ emoji: '⚡', title: t('res.badgeTaskMaster'), subtitle: challengerName, color: COLORS.secondary });
  if (difficulty === 'sef') {
    badges.push({ emoji: '🔥', title: t('res.badgeBraveChef'), subtitle: t('res.badgeBraveSub'), color: '#E74C3C' });
  } else {
    badges.push({ emoji: '⏱️', title: t('res.badgeFastHands'), subtitle: t('res.badgeFastSub'), color: '#3498DB' });
  }
  if (completedSteps === totalSteps) {
    badges.push({ emoji: '✅', title: t('res.badgePerfect'), subtitle: t('res.badgePerfectSub'), color: COLORS.success });
  }

  var playAgain = function () {
    navigation.reset({ index: 0, routes: [{ name: 'Setup' }] });
  };

  // Konfeti konum/gecikmeleri bir kez üretilir — re-render'da değişmez
  var confettiPieces = useRef((function () {
    var arr = [];
    for (var i = 0; i < 30; i++) {
      arr.push({
        id: i,
        delay: Math.random() * 1500,
        startX: Math.random() * screenWidth,
      });
    }
    return arr;
  })()).current;

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onMountError={function (error) {
            console.log('📸 Kamera mount hatasi:', error);
            Alert.alert(t('res.cameraFailTitle'), t('res.cameraFailBody'));
            setShowCamera(false);
          }}
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.cameraCancel}
              onPress={function () { setShowCamera(false); }}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.cameraHint}>
              <Text style={styles.cameraHintText}>{t('res.cameraHint')}</Text>
            </View>

            <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.confettiContainer} pointerEvents="none">
        {confettiPieces.map(function (p) {
          return <ConfettiPiece key={p.id} delay={p.delay} startX={p.startX} />;
        })}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <LinearGradient colors={['#FFD93D', '#F4C430', '#E8B800']} style={[styles.celebrationHeader, { paddingTop: 40 + insets.top }]}>
          <Animated.View style={{ opacity: titleAnim, transform: [{ scale: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }}>
            <Text style={styles.trophyEmoji}>🏆</Text>
            <Text style={styles.celebrationTitle}>{t('res.title')}</Text>
          </Animated.View>
          <Animated.View style={{ opacity: subtitleAnim }}>
            <Text style={styles.celebrationRecipe}>{recipeName}</Text>
            <Text style={styles.celebrationSubtitle}>{t('res.subtitle', { cook: cookName, challenger: challengerName })}</Text>

            <View style={styles.rankPill}>
              <Text style={styles.rankEmoji}>{result.rank.emoji}</Text>
              <Text style={styles.rankTitle}>{result.rank.title}</Text>
            </View>

            <View style={styles.scoreWrap}>
              <Text style={styles.scoreValue}>{displayScore}</Text>
              <Text style={styles.scoreLabel}>{t('res.scoreLabel')}</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <StatItem icon="list-outline" value={completedSteps + '/' + totalSteps} label={t('res.statStep')} color={COLORS.primary} />
          <StatItem icon="flash-outline" value={String(totalTasks)} label={t('res.statTask')} color={COLORS.secondary} />
          <StatItem icon="time-outline" value={prepTime || '—'} label={t('res.statTime')} color="#9B59B6" />
          <StatItem icon="restaurant-outline" value={difficulty === 'sef' ? t('setup.chef') : t('setup.everyday')} label={t('res.statDifficulty')} color="#E74C3C" />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('res.juryTitle')}</Text>
          <View style={styles.juryCard}>
            <Text style={styles.juryEmoji}>🎤</Text>
            <Text style={styles.juryText}>{result.verdict}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('res.photoSection')}</Text>
          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <View style={styles.photoPreview}>
                <Animated.Image source={{ uri: photoUri }} style={styles.photoImage} />
              </View>
              <TouchableOpacity style={styles.retakeButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={16} color={COLORS.primary} />
                <Text style={styles.retakeText}>{t('res.retake')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto} activeOpacity={0.8}>
              <LinearGradient colors={['#FFF8F0', '#FFF0E5']} style={styles.photoButtonGradient}>
                <Text style={styles.photoButtonEmoji}>📷</Text>
                <Text style={styles.photoButtonText}>{t('res.takePhoto')}</Text>
                <Text style={styles.photoButtonHint}>{t('res.photoHint')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('res.badges')}</Text>
          <View style={styles.badgesGrid}>
            {badges.map(function (badge, index) {
              return <BadgeCard key={index} emoji={badge.emoji} title={badge.title} subtitle={badge.subtitle} color={badge.color} delay={400 + index * 200} />;
            })}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('res.ratingSection')}</Text>
          <View style={styles.ratingsContainer}>
            <StarRating label={t('res.cookPerf')} playerName={cookName} rating={cookRating} onRate={handleCookRating} />
            <View style={styles.ratingDivider} />
            <StarRating label={t('res.chalPerf')} playerName={challengerName} rating={challengerRating} onRate={handleChallengerRating} />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.savedText}>{t('res.saved')}</Text>
          </View>

          <TouchableOpacity style={styles.playAgainButton} onPress={playAgain} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.playAgainGradient}>
              <Ionicons name="refresh" size={22} color="#FFFFFF" />
              <Text style={styles.playAgainText}>{t('res.playAgain')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2D1B12' },
  confettiContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  celebrationHeader: { alignItems: 'center', paddingTop: 40, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  trophyEmoji: { fontSize: 70, textAlign: 'center', marginBottom: 10 },
  celebrationTitle: { fontSize: 36, fontWeight: '900', color: COLORS.brown, textAlign: 'center', marginBottom: 8 },
  celebrationRecipe: { fontSize: 20, fontWeight: '700', color: 'rgba(93, 64, 55, 0.8)', textAlign: 'center', marginBottom: 4 },
  celebrationSubtitle: { fontSize: 15, color: 'rgba(93, 64, 55, 0.6)', textAlign: 'center' },

  rankPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 8, marginTop: 14, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 22, backgroundColor: 'rgba(93, 64, 55, 0.12)' },
  rankEmoji: { fontSize: 22 },
  rankTitle: { fontSize: 16, fontWeight: '900', color: COLORS.brown },
  scoreWrap: { alignItems: 'center', marginTop: 12 },
  scoreValue: { fontSize: 54, fontWeight: '900', color: COLORS.brown, letterSpacing: 1, lineHeight: 58 },
  scoreLabel: { fontSize: 12, fontWeight: '800', color: 'rgba(93, 64, 55, 0.55)', letterSpacing: 4, marginTop: 2 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 20, marginTop: -16, marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 20, ...SHADOW_SOFT },
  statItem: { alignItems: 'center', flex: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  juryCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, ...SHADOW },
  juryEmoji: { fontSize: 36 },
  juryText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text, lineHeight: 22, fontStyle: 'italic' },

  sectionContainer: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 14 },

  photoButton: { borderRadius: 18, overflow: 'hidden' },
  photoButtonGradient: { alignItems: 'center', paddingVertical: 28, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255, 107, 53, 0.2)', borderStyle: 'dashed' },
  photoButtonEmoji: { fontSize: 40, marginBottom: 8 },
  photoButtonText: { fontSize: 17, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  photoButtonHint: { fontSize: 12, color: '#B0A090' },
  photoPreviewContainer: { alignItems: 'center' },
  photoPreview: { width: '100%', height: 200, borderRadius: 18, overflow: 'hidden', marginBottom: 10 },
  photoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  retakeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  retakeText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: (screenWidth - 44) / 2, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, alignItems: 'center', ...SHADOW },
  badgeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  badgeEmoji: { fontSize: 28 },
  badgeTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  badgeSubtitle: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },

  ratingsContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, ...SHADOW },
  ratingSection: { alignItems: 'center', paddingVertical: 12 },
  ratingLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', marginBottom: 4 },
  ratingPlayer: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  starsRow: { flexDirection: 'row', gap: 6 },
  starIcon: { marginHorizontal: 2 },
  ratingText: { marginTop: 8, fontSize: 14, fontWeight: '700', color: COLORS.primary },
  ratingDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },

  buttonsContainer: { marginTop: 28, paddingHorizontal: 16, gap: 12 },
  savedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: 'rgba(76, 175, 80, 0.15)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.3)' },
  savedText: { fontSize: 15, fontWeight: '700', color: COLORS.success },
  playAgainButton: { borderRadius: 18, overflow: 'hidden' },
  playAgainGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10, borderRadius: 18 },
  playAgainText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  cameraCancel: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  cameraHint: { alignItems: 'center' },
  cameraHintText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  captureButton: { alignSelf: 'center', width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  captureInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFFFFF' },
});