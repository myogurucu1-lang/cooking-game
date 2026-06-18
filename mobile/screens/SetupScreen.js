import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../theme';
import DrawerMenu from '../components/DrawerMenu';
import { useLang } from '../i18n';

var screenWidth = Dimensions.get('window').width;

function CharacterCard(props) {
  var image = props.image;
  var label = props.label;
  var name = props.name;
  var onChangeName = props.onChangeName;
  var animDelay = props.animDelay;
  var accentColor = props.accentColor;
  var lc = useLang();
  var t = lc.t;
  var lang = lc.lang;

  var breathAnim = useRef(new Animated.Value(0)).current;
  var shakeAnim = useRef(new Animated.Value(0)).current;
  var scaleAnim = useRef(new Animated.Value(1)).current;
  var entryAnim = useRef(new Animated.Value(0)).current;
  var entrySlide = useRef(new Animated.Value(40)).current;

  useEffect(function () {
    setTimeout(function () {
      Animated.parallel([
        Animated.timing(entryAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(entrySlide, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
      ]).start();
    }, animDelay);

    var breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: -6, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    setTimeout(function () { breathe.start(); }, animDelay + 500);
    return function () { breathe.stop(); };
  }, []);

  var onTap = function () {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 14, duration: 70, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -14, duration: 70, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 70, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 70, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
        ]),
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      ]),
    ]).start();
  };

  return (
    <Animated.View style={[styles.cardWrapper, { opacity: entryAnim, transform: [{ translateY: entrySlide }] }]}>
      <View style={styles.card}>
        <TouchableOpacity onPress={onTap} activeOpacity={0.9} style={styles.characterTouchable}>
          <View style={[styles.circleOuter, { borderColor: accentColor + '50' }]}>
            <LinearGradient
              colors={[accentColor + '25', accentColor + '08', '#FFFFFF']}
              style={styles.circleGradient}
            />
          </View>
          <Animated.View style={[
            styles.characterFloat,
            {
              transform: [
                { translateY: breathAnim },
                { rotate: shakeAnim.interpolate({ inputRange: [-14, 14], outputRange: ['-14deg', '14deg'] }) },
                { scale: scaleAnim },
              ]
            }
          ]}>
            <Image source={image} style={styles.characterImage} resizeMode="contain" />
          </Animated.View>
        </TouchableOpacity>

        <View style={[styles.labelBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.labelText}>{label}</Text>
        </View>

        <TextInput
          key={'name-' + lang}
          style={[styles.nameInput, { borderColor: accentColor + '40' }]}
          placeholder={t('setup.namePlaceholder')}
          placeholderTextColor="#9A8A78"
          value={name}
          onChangeText={onChangeName}
          maxLength={15}
        />
      </View>
    </Animated.View>
  );
}

function PulseVS() {
  var pulseAnim = useRef(new Animated.Value(1)).current;
  var glowAnim = useRef(new Animated.Value(0.2)).current;
  var rotateAnim = useRef(new Animated.Value(0)).current;
  var sparkAnim1 = useRef(new Animated.Value(0)).current;
  var sparkAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.5, duration: 900, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.15, duration: 900, useNativeDriver: true }),
        ]),
        Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkAnim1, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(sparkAnim1, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(function () {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkAnim2, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(sparkAnim2, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }, 400);
  }, []);

  var spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.vsContainer}>
      <Animated.View style={[styles.vsGlowOuter, { opacity: glowAnim, transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.vsSpinRing, { transform: [{ rotate: spin }] }]}>
        <View style={styles.vsSpinDot1} />
        <View style={styles.vsSpinDot2} />
      </Animated.View>
      <Animated.Text style={[styles.vsSpark, { top: -8, right: -2, opacity: sparkAnim1, transform: [{ scale: sparkAnim1 }] }]}>✦</Animated.Text>
      <Animated.Text style={[styles.vsSpark, { bottom: -6, left: -4, opacity: sparkAnim2, transform: [{ scale: sparkAnim2 }] }]}>✦</Animated.Text>
      <Animated.View style={[styles.vsBadge, { transform: [{ scale: pulseAnim.interpolate({ inputRange: [1, 1.3], outputRange: [1, 1.1] }) }] }]}>
        <LinearGradient colors={['#FF6B35', '#E85D26', '#D44F1C']} style={styles.vsBadgeGradient}>
          <Text style={styles.vsText}>VS</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

export default function SetupScreen(props) {
  var navigation = props.navigation;
  var insets = useSafeAreaInsets();
  var t = useLang().t;

  var cookNameState = useState('');
  var cookName = cookNameState[0];
  var setCookName = cookNameState[1];

  var challengerNameState = useState('');
  var challengerName = challengerNameState[0];
  var setChallengerName = challengerNameState[1];

  var ingredientsState = useState('');
  var ingredients = ingredientsState[0];
  var setIngredients = ingredientsState[1];

  var difficultyState = useState('gundelik');
  var difficulty = difficultyState[0];
  var setDifficulty = difficultyState[1];

  var drawerState = useState(false);
  var drawerVisible = drawerState[0];
  var setDrawerVisible = drawerState[1];

  var fadeAnim = useRef(new Animated.Value(0)).current;
  var slideAnim = useRef(new Animated.Value(30)).current;
  var btnPulse = useRef(new Animated.Value(1)).current;
  var btnGlow = useRef(new Animated.Value(0.3)).current;

  var canStart = cookName.trim().length > 0 && challengerName.trim().length > 0 && ingredients.trim().length > 0;

  useEffect(function () {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(function () {
    if (canStart) {
      var pulse = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(btnPulse, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
            Animated.timing(btnPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(btnGlow, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
            Animated.timing(btnGlow, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
          ]),
        ])
      );
      pulse.start();
      return function () { pulse.stop(); };
    }
  }, [canStart]);

  var startGame = function () {
    if (!canStart) return;
    navigation.navigate('Transition', { ingredients: ingredients.trim(), difficulty: difficulty, cookName: cookName.trim(), challengerName: challengerName.trim() });
  };

  var openDrawer = function () {
    setDrawerVisible(true);
  };

  var closeDrawer = function () {
    setDrawerVisible(false);
  };

  var handleNavigate = function (screen) {
    navigation.navigate(screen);
  };

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.bgImage} resizeMode="cover">
      <StatusBar style="dark" />
      <View style={styles.overlay} />

      <View style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 64 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.titleIcon}>👨‍🍳</Text>
              <Text style={styles.title}>COOKING</Text>
              <LinearGradient colors={['#FF6B35', '#E85D26']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subtitleBadge}>
                <Text style={styles.subtitle}>CHALLENGE</Text>
              </LinearGradient>
              <Text style={styles.tagline}>{t('setup.tagline')}</Text>
            </Animated.View>

            <View style={styles.cardsRow}>
              <CharacterCard image={require('../assets/cook.png')} label="COOK" name={cookName} onChangeName={setCookName} animDelay={200} accentColor="#4ECDC4" />
              <PulseVS />
              <CharacterCard image={require('../assets/challenger.png')} label="CHALLENGER" name={challengerName} onChangeName={setChallengerName} animDelay={400} accentColor="#FF6B35" />
            </View>

            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBg}>
                  <Ionicons name="restaurant" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>{t('setup.ingredients')}</Text>
              </View>
              <View style={styles.glassCard}>
                <TextInput
                  style={styles.textArea}
                  placeholder={t('setup.ingredientsPlaceholder')}
                  placeholderTextColor="rgba(100,75,55,0.45)"
                  value={ingredients}
                  onChangeText={setIngredients}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </Animated.View>

            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBg, { backgroundColor: '#FF6B35' }]}>
                  <Ionicons name="flame" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>{t('setup.difficulty')}</Text>
              </View>
              <View style={styles.levelRow}>
                <TouchableOpacity
                  style={[styles.levelBtn, difficulty === 'gundelik' && styles.levelBtnActiveGundelik]}
                  onPress={function () { setDifficulty('gundelik'); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.levelEmoji}>🍳</Text>
                  <Text style={[styles.levelTitle, difficulty === 'gundelik' && styles.levelTitleActive]}>{t('setup.everyday')}</Text>
                  <Text style={[styles.levelDesc, difficulty === 'gundelik' && styles.levelDescActive]}>{t('setup.everydayTime')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.levelBtn, difficulty === 'sef' && styles.levelBtnActiveSef]}
                  onPress={function () { setDifficulty('sef'); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.levelEmoji}>👨‍🍳</Text>
                  <Text style={[styles.levelTitle, difficulty === 'sef' && styles.levelTitleActive]}>{t('setup.chef')}</Text>
                  <Text style={[styles.levelDesc, difficulty === 'sef' && styles.levelDescActive]}>{t('setup.chefTime')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: canStart ? btnPulse : 1 }] }}>
              <TouchableOpacity
                style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
                onPress={startGame}
                disabled={!canStart}
                activeOpacity={0.85}
              >
                {canStart ? <Animated.View style={[styles.startBtnGlow, { opacity: btnGlow }]} /> : null}
                <LinearGradient
                  colors={canStart ? ['#FF6B35', '#E85D26'] : ['#BBAA99', '#AA9988']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.startBtnGradient}
                >
                  <Ionicons name="play-circle" size={26} color="#FFFFFF" />
                  <Text style={styles.startText}>{t('setup.start')}</Text>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={{ height: 50 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Hamburger — ScrollView dışında, ekrana sabit */}
        <TouchableOpacity
          style={[styles.hamburgerButton, { top: insets.top + 10 }]}
          onPress={openDrawer}
          activeOpacity={0.7}
        >
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
      </View>

      <DrawerMenu
        visible={drawerVisible}
        onClose={closeDrawer}
        onNavigate={handleNavigate}
      />
    </ImageBackground>
  );
}

var styles = StyleSheet.create({
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,248,240,0.35)' },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 20 },

  hamburgerButton: {
    position: 'absolute',
    left: 20,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,252,248,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  hamburgerLine: {
    width: 20,
    height: 2.5,
    backgroundColor: '#5D3A1A',
    borderRadius: 2,
  },

  header: { alignItems: 'center', marginTop: 5, marginBottom: 24 },
  titleIcon: { fontSize: 44, marginBottom: 6 },
  title: { fontSize: 42, fontWeight: '900', color: '#5D3A1A', letterSpacing: 6, textShadowColor: 'rgba(255,255,255,0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  subtitleBadge: { paddingHorizontal: 22, paddingVertical: 7, borderRadius: 20, marginTop: 8 },
  subtitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 6 },
  tagline: { fontSize: 13, color: '#8B6914', marginTop: 10, fontWeight: '600' },
  cardsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  cardWrapper: { flex: 1 },
  card: { borderRadius: 22, paddingTop: 0, paddingBottom: 16, paddingHorizontal: 12, alignItems: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,252,248,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', shadowColor: '#8B6914', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  characterTouchable: { alignItems: 'center', justifyContent: 'flex-end', height: 115, width: '100%', marginBottom: 4 },
  circleOuter: { position: 'absolute', bottom: 0, width: 88, height: 88, borderRadius: 44, overflow: 'hidden', borderWidth: 2 },
  circleGradient: { width: '100%', height: '100%' },
  characterFloat: { position: 'absolute', bottom: -8, width: 120, height: 120, alignItems: 'center', justifyContent: 'flex-end' },
  characterImage: { width: 120, height: 120 },
  labelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 2, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  labelText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1.5 },
  nameInput: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 14, paddingVertical: 11, paddingHorizontal: 12, width: '100%', textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#4A3520', borderWidth: 2 },
  vsContainer: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4, marginTop: 20 },
  vsGlowOuter: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF6B35' },
  vsSpinRing: { position: 'absolute', width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  vsSpinDot1: { position: 'absolute', top: 0, width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFB347' },
  vsSpinDot2: { position: 'absolute', bottom: 0, width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFB347' },
  vsSpark: { position: 'absolute', fontSize: 12, color: '#FFB347' },
  vsBadge: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.6)', shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 },
  vsBadgeGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  vsText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionIconBg: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#4ECDC4', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#5D3A1A', marginLeft: 10 },
  glassCard: { borderRadius: 18, backgroundColor: 'rgba(255,252,248,0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', shadowColor: '#8B6914', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  textArea: { padding: 16, fontSize: 15, minHeight: 90, textAlignVertical: 'top', color: '#4A3520', lineHeight: 22 },
  levelRow: { flexDirection: 'row', gap: 12 },
  levelBtn: { flex: 1, borderRadius: 18, paddingVertical: 18, paddingHorizontal: 10, alignItems: 'center', backgroundColor: 'rgba(255,252,248,0.65)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#8B6914', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  levelBtnActiveGundelik: { borderColor: '#4ECDC4', backgroundColor: 'rgba(78,205,196,0.18)' },
  levelBtnActiveSef: { borderColor: '#FF6B35', backgroundColor: 'rgba(255,107,53,0.18)' },
  levelEmoji: { fontSize: 30, marginBottom: 6 },
  levelTitle: { fontSize: 16, fontWeight: '700', color: '#8B7355', marginBottom: 2 },
  levelTitleActive: { color: '#4A3520' },
  levelDesc: { fontSize: 12, color: '#B0A090' },
  levelDescActive: { color: '#8B7355' },
  startBtn: { marginTop: 8, borderRadius: 20, overflow: 'hidden', shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  startBtnDisabled: { shadowOpacity: 0.1, shadowColor: '#999' },
  startBtnGlow: { position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, borderRadius: 22, backgroundColor: '#FF6B35' },
  startBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 10 },
  startText: { fontSize: 19, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3 },
});