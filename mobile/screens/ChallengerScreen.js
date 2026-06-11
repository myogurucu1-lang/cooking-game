import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW, SHADOW_SOFT } from '../theme';
import TutorialOverlay from '../components/TutorialOverlay';

var screenWidth = Dimensions.get('window').width;

var CHALLENGER_TUTORIAL_STEPS = [
  {
    emoji: '⚡',
    title: 'Görevlerin Hazır!',
    description: 'Sırası gelen görevi doğru zamanda Cook\'a söyle!',
    position: 'center',
  },
];

var CATEGORY_CONFIG = {
  eglence:  { color: '#E74C3C', icon: 'happy-outline',     label: 'Eğlence' },
  sunum:    { color: '#1ABC9C', icon: 'color-palette-outline', label: 'Sunum' },
  rol:      { color: '#9B59B6', icon: 'person-outline',     label: 'Rol' },
  dikkat:   { color: '#F39C12', icon: 'alert-circle-outline', label: 'Dikkat' },
  main:     { color: '#E74C3C', icon: 'star-outline',       label: 'Ana Görev' },
  side:     { color: '#3498DB', icon: 'flash-outline',      label: 'Yan Görev' },
  big:      { color: '#E74C3C', icon: 'trophy-outline',     label: 'Büyük Görev' },
  small:    { color: '#3498DB', icon: 'sparkles-outline',   label: 'Küçük Görev' },
};

function TaskCard(props) {
  var task = props.task;
  var index = props.index;

  var entryAnim = useRef(new Animated.Value(0)).current;
  var entrySlide = useRef(new Animated.Value(50)).current;

  useEffect(function () {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 400, delay: index * 120, useNativeDriver: true }),
      Animated.spring(entrySlide, { toValue: 0, friction: 8, tension: 40, delay: index * 120, useNativeDriver: true }),
    ]).start();
  }, []);

  var taskType = task.type || task.category || 'main';
  var config = CATEGORY_CONFIG[taskType] || CATEGORY_CONFIG.main;
  var emoji = task.emoji || '⚡';
  var triggerStep = task.triggerAtStep || null;
  var duration = task.duration || null;

  return (
    <Animated.View style={{ opacity: entryAnim, transform: [{ translateY: entrySlide }], marginBottom: 14 }}>
      <View style={[styles.cardBack, { borderLeftColor: config.color }]}>
        {triggerStep ? (
          <View style={[styles.stepPill, { backgroundColor: config.color }]}>
            <Text style={styles.stepPillText}>Adım {triggerStep}</Text>
          </View>
        ) : null}

        <View style={styles.cardBackHeader}>
          <Text style={styles.cardBackEmoji}>{emoji}</Text>
          <View style={styles.cardBackTitleWrap}>
            <Text style={styles.cardBackTitle}>{task.title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: config.color + '18' }]}>
              <Ionicons name={config.icon} size={12} color={config.color} />
              <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.cardBackDesc}>{task.description}</Text>

        <View style={styles.cardBackMeta}>
          {triggerStep ? (
            <View style={styles.metaItem}>
              <Ionicons name="flag-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.metaItemText}>Adım {triggerStep}'de</Text>
            </View>
          ) : null}
          {duration ? (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.metaItemText}>{duration} dk</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

export default function ChallengerScreen(props) {
  var navigation = props.navigation;
  var route = props.route;
  var insets = useSafeAreaInsets();

  var cookName = route.params.cookName;
  var challengerName = route.params.challengerName;
  var challengerTasks = route.params.challengerTasks || [];

  // Görevleri adım sırasına göre diz (adımsızlar en sona); aynı adımda ana görev önce
  var tasks = challengerTasks.slice().sort(function (a, b) {
    var sa = a.triggerAtStep || 999;
    var sb = b.triggerAtStep || 999;
    if (sa !== sb) return sa - sb;
    var aMain = (a.type === 'main' || a.type === 'big') ? 0 : 1;
    var bMain = (b.type === 'main' || b.type === 'big') ? 0 : 1;
    return aMain - bMain;
  });

  var headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <TutorialOverlay
        steps={CHALLENGER_TUTORIAL_STEPS}
        storageKey="challengerTutorialSeen"
      />

      <LinearGradient colors={['#4ECDC4', '#3AB8B0']} style={[styles.header, { paddingTop: 12 + insets.top }]}>
        <Animated.View style={[styles.headerContent, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={function () { navigation.goBack(); }} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={function () { navigation.goBack(); }} style={styles.cookButton}>
              <Text style={styles.cookButtonEmoji}>👨‍🍳</Text>
              <Text style={styles.cookButtonText}>Tarife Dön</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>⚡ Challenger Görevleri</Text>
          <Text style={styles.headerSubtitle}>{challengerName}, {cookName}'e bu görevleri yaptır!</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>🎯 Sırası gelen görevi doğru zamanda {cookName}'e söyle!</Text>
        </View>

        {tasks.map(function (task, index) {
          return (
            <TaskCard
              key={index}
              task={task}
              index={index}
            />
          );
        })}

        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🤷</Text>
            <Text style={styles.emptyTitle}>Görev Bulunamadı</Text>
            <Text style={styles.emptySubtitle}>AI bu sefer görev üretmemiş. Tarife geri dönebilirsin.</Text>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 12, paddingBottom: 18, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, ...SHADOW_SOFT },
  headerContent: {},
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  cookButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  cookButtonEmoji: { fontSize: 16, marginRight: 5 },
  cookButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 14 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  instructionBox: { backgroundColor: '#E8F8F5', padding: 14, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(78, 205, 196, 0.2)' },
  instructionText: { fontSize: 14, fontWeight: '600', color: '#2C3E50', textAlign: 'center', lineHeight: 20 },
  cardBack: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderLeftWidth: 4, ...SHADOW },
  stepPill: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, zIndex: 1 },
  stepPillText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  cardBackHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardBackEmoji: { fontSize: 28, marginRight: 12, marginTop: 2 },
  cardBackTitleWrap: { flex: 1 },
  cardBackTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  cardBackDesc: { fontSize: 14, lineHeight: 21, color: COLORS.textSecondary, marginBottom: 10 },
  cardBackMeta: { flexDirection: 'row', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaItemText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
});