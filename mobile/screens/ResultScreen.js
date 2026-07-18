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
import { celebrationPattern } from '../utils/HapticManager';
import { useLang } from '../i18n';
import { maybeAskForReview } from '../utils/reviewAsk';

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
  var icon = props.icon;
  var title = props.title;
  var subtitle = props.subtitle;
  var color = props.color;
  var delay = props.delay;

  var scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    var timeout = setTimeout(function () {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.08, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      ]).start();
    }, delay);
    return function () { clearTimeout(timeout); };
  }, []);

  return (
    <Animated.View style={[styles.badgeCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.badgeIcon, { backgroundColor: color + '1A' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.badgeTexts}>
        <Text style={styles.badgeTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.badgeSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
    </Animated.View>
  );
}

function StarRating(props) {
  var label = props.label;
  var playerName = props.playerName;
  var onRate = props.onRate;
  var rating = props.rating;

  return (
    <View style={styles.rateRow}>
      <View style={styles.rateLeft}>
        <Text style={styles.rateLabel}>{label}</Text>
        <Text style={styles.rateName} numberOfLines={1}>{playerName}</Text>
      </View>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(function (star) {
          return (
            <TouchableOpacity key={star} onPress={function () { onRate(star); }} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={26}
                color={star <= rating ? '#FFC02E' : '#D8CCBC'}
                style={styles.starIcon}
              />
            </TouchableOpacity>
          );
        })}
      </View>
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
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
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
  var pack = route.params.pack || 'classic';
  var isDn = pack === 'datenight';
  var recipeName = route.params.recipeName;
  var totalSteps = route.params.totalSteps;
  var completedSteps = route.params.completedSteps;
  var totalTasks = route.params.totalTasks;
  var prepTime = route.params.prepTime;

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
    // İki puan da verildiyse mutlu an: mağaza puanlama isteğini dene
    if (challengerRating > 0) {
      setTimeout(function () { maybeAskForReview(t); }, 1200);
    }
  };

  var handleChallengerRating = function (star) {
    setChallengerRating(star);
    updateRatings(cookRating, star);
    if (cookRating > 0) {
      setTimeout(function () { maybeAskForReview(t); }, 1200);
    }
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
  badges.push({ icon: 'star', title: t('res.badgeStarChef'), subtitle: cookName, color: COLORS.primary });
  badges.push({ icon: 'flash', title: t('res.badgeTaskMaster'), subtitle: challengerName, color: COLORS.secondary });
  if (difficulty === 'sef') {
    badges.push({ icon: 'flame', title: t('res.badgeBraveChef'), subtitle: t('res.badgeBraveSub'), color: '#E74C3C' });
  } else {
    badges.push({ icon: 'timer-outline', title: t('res.badgeFastHands'), subtitle: t('res.badgeFastSub'), color: '#3498DB' });
  }
  if (completedSteps === totalSteps) {
    badges.push({ icon: 'ribbon', title: t('res.badgePerfect'), subtitle: t('res.badgePerfectSub'), color: COLORS.success });
  }

  var playAgain = function () {
    navigation.reset({ index: 0, routes: [{ name: 'Setup' }] });
  };

  // Konfeti konum/gecikmeleri bir kez üretilir — re-render'da değişmez (bol serpilsin)
  var confettiPieces = useRef((function () {
    var arr = [];
    for (var i = 0; i < 46; i++) {
      arr.push({
        id: i,
        delay: Math.random() * 1800,
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
    <View style={[styles.container, isDn && { backgroundColor: '#1C1315' }]}>
      <StatusBar style="light" />
      {isDn ? (
        <>
          {/* Date Night: kurulu masa arka planı + hafif bordo katman */}
          <Image
            source={require('../assets/datenight/bg-table.png')}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(28,19,21,0.5)' }} />
        </>
      ) : null}

      <View style={styles.confettiContainer} pointerEvents="none">
        {confettiPieces.map(function (p) {
          return <ConfettiPiece key={p.id} delay={p.delay} startX={p.startX} />;
        })}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <LinearGradient colors={isDn ? ['rgba(139,46,68,0.92)', 'rgba(58,20,32,0.92)'] : [COLORS.primary, COLORS.primaryDark]} style={[styles.celebrationHeader, { paddingTop: 34 + insets.top }]}>
          <Animated.View style={{ opacity: titleAnim, alignItems: 'center', transform: [{ scale: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
            <View style={styles.successIcon}>
              <Ionicons name={isDn ? 'heart' : 'restaurant'} size={26} color={isDn ? '#E8B4A0' : '#FFFFFF'} />
            </View>
            <Text style={styles.celebrationTitle}>{t(isDn ? 'res.titleDn' : 'res.title')}</Text>
          </Animated.View>
          <Animated.View style={{ opacity: subtitleAnim, alignItems: 'center' }}>
            <Text style={styles.celebrationRecipe}>{recipeName}</Text>
            <Text style={styles.celebrationSubtitle}>{t(isDn ? 'res.subtitleDn' : 'res.subtitle', { cook: cookName, challenger: challengerName })}</Text>
          </Animated.View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <StatItem icon="list-outline" value={completedSteps + '/' + totalSteps} label={t('res.statStep')} color={COLORS.primary} />
          <StatItem icon="flash-outline" value={String(totalTasks)} label={t('res.statTask')} color={COLORS.secondary} />
          <StatItem icon="time-outline" value={prepTime || '—'} label={t('res.statTime')} color="#9B59B6" />
          <StatItem icon="restaurant-outline" value={difficulty === 'sef' ? t(isDn ? 'setup.chefDn' : 'setup.chef') : t(isDn ? 'setup.everydayDn' : 'setup.everyday')} label={t('res.statDifficulty')} color="#E74C3C" />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, isDn && { color: '#F0DAD0' }]}>{t('res.photoSection')}</Text>
          </View>
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
            <TouchableOpacity style={styles.photoCompact} onPress={takePhoto} activeOpacity={0.85}>
              <View style={styles.photoCamIcon}>
                <Ionicons name="camera" size={22} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.photoCompactTitle}>{t('res.takePhoto')}</Text>
                <Text style={styles.photoCompactHint}>{t('res.photoHint')}</Text>
              </View>
              <View style={styles.photoPlus}>
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="ribbon-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, isDn && { color: '#F0DAD0' }]}>{t('res.badges')}</Text>
          </View>
          <View style={styles.badgesGrid}>
            {badges.map(function (badge, index) {
              return <BadgeCard key={index} icon={badge.icon} title={badge.title} subtitle={badge.subtitle} color={badge.color} delay={400 + index * 150} />;
            })}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="star-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, isDn && { color: '#F0DAD0' }]}>{t('res.ratingSection')}</Text>
          </View>
          <View style={styles.ratingsContainer}>
            <StarRating label={t('res.cookPerf')} playerName={cookName} rating={cookRating} onRate={handleCookRating} />
            <View style={styles.ratingDivider} />
            <StarRating label={t('res.chalPerf')} playerName={challengerName} rating={challengerRating} onRate={handleChallengerRating} />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            <Text style={styles.savedText}>{t('res.saved')}</Text>
          </View>

          <TouchableOpacity style={styles.playAgainButton} onPress={playAgain} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.playAgainGradient}>
              <Ionicons name="refresh" size={22} color="#FFFFFF" />
              <Text style={styles.playAgainText}>{t('res.playAgain')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  confettiContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  celebrationHeader: { alignItems: 'center', paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, ...SHADOW_SOFT },
  successIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  celebrationTitle: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  celebrationRecipe: { fontSize: 18, fontWeight: '800', color: 'rgba(255,255,255,0.92)', textAlign: 'center', marginBottom: 3 },
  celebrationSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.78)', textAlign: 'center', fontWeight: '600' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, paddingVertical: 18, marginTop: -16, marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 20, ...SHADOW_SOFT },
  statItem: { alignItems: 'center', flex: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  sectionContainer: { marginTop: 22, paddingHorizontal: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },

  // compact photo card
  photoCompact: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15, borderWidth: 1.5, borderColor: 'rgba(255,107,53,0.22)', borderStyle: 'dashed' },
  photoCamIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,107,53,0.12)', alignItems: 'center', justifyContent: 'center' },
  photoCompactTitle: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  photoCompactHint: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', marginTop: 1 },
  photoPlus: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  photoPreviewContainer: { alignItems: 'center' },
  photoPreview: { width: '100%', height: 200, borderRadius: 18, overflow: 'hidden', marginBottom: 10 },
  photoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  retakeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: 'rgba(255,107,53,0.1)' },
  retakeText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // badges 2x2 compact (icon + texts, row)
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: { width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 15, paddingVertical: 11, paddingHorizontal: 12, marginBottom: 10, ...SHADOW },
  badgeIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  badgeTexts: { flex: 1 },
  badgeTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  badgeSubtitle: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginTop: 1 },

  // ratings (clean rows)
  ratingsContainer: { backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16, ...SHADOW },
  rateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  rateLeft: { flex: 1 },
  rateLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700' },
  rateName: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginTop: 1 },
  starsRow: { flexDirection: 'row' },
  starIcon: { marginHorizontal: 1 },
  ratingDivider: { height: 1, backgroundColor: COLORS.border },

  buttonsContainer: { marginTop: 24, paddingHorizontal: 16, gap: 12 },
  savedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, backgroundColor: 'rgba(76, 175, 80, 0.13)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.28)' },
  savedText: { fontSize: 14, fontWeight: '800', color: COLORS.success },
  playAgainButton: { borderRadius: 18, overflow: 'hidden' },
  playAgainGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 17, gap: 10, borderRadius: 18 },
  playAgainText: { fontSize: 17, fontWeight: '900', color: '#FFFFFF' },

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  cameraCancel: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  cameraHint: { alignItems: 'center' },
  cameraHintText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  captureButton: { alignSelf: 'center', width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  captureInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFFFFF' },
});
