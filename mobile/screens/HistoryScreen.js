import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW, SHADOW_SOFT } from '../theme';
import { useLang } from '../i18n';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

function HistoryCard(props) {
  var item = props.item;
  var index = props.index;
  var onDelete = props.onDelete;
  var t = useLang().t;

  var entryAnim = useRef(new Animated.Value(0)).current;
  var slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(function () {
    Animated.parallel([
      Animated.timing(entryAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  var date = new Date(item.date);
  var dateStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

  return (
    <Animated.View
      style={[
        styles.historyCard,
        { opacity: entryAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.photoContainer}>
        {(item.photoFileName || item.photoUri) ? (
          <Image
            source={{ uri: item.photoFileName ? FileSystem.documentDirectory + item.photoFileName : item.photoUri }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.noPhoto}>
            <Text style={styles.noPhotoEmoji}>📷</Text>
            <Text style={styles.noPhotoText}>{t('hist.noPhoto')}</Text>
          </View>
        )}
        <View
          style={[
            styles.difficultyBadge,
            {
              backgroundColor:
                item.difficulty === 'sef' ? '#FF6B35' : '#4ECDC4',
            },
          ]}
        >
          <Text style={styles.difficultyText}>
            {item.difficulty === 'sef' ? t('setup.chef') : t('setup.everyday')}
          </Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardRecipeName} numberOfLines={2}>
          {item.recipeName}
        </Text>
        <Text style={styles.cardDate}>{dateStr}</Text>
        <View style={styles.cardPlayers}>
          <Text style={styles.cardPlayerText} numberOfLines={1}>
            👨‍🍳 {item.cookName}  ⚡ {item.challengerName}
          </Text>
        </View>

        {(item.cookRating > 0 || item.challengerRating > 0) ? (
          <View style={styles.ratingsRow}>
            {item.cookRating > 0 ? (
              <View style={styles.miniRating}>
                <Ionicons name="star" size={11} color="#FFD93D" />
                <Text style={styles.miniRatingText}>{item.cookRating}</Text>
              </View>
            ) : null}
            {item.challengerRating > 0 ? (
              <View style={styles.miniRating}>
                <Ionicons name="flash" size={11} color="#4ECDC4" />
                <Text style={styles.miniRatingText}>
                  {item.challengerRating}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={function () {
          onDelete(item.id);
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={16} color="#CC5555" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HistoryScreen(props) {
  var navigation = props.navigation;
  var insets = useSafeAreaInsets();
  var t = useLang().t;

  var historyState = useState([]);
  var history = historyState[0];
  var setHistory = historyState[1];

  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    loadHistory();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  var loadHistory = useCallback(async function () {
    try {
      var data = await AsyncStorage.getItem('cookingHistory');
      if (data) {
        var parsed = JSON.parse(data);
        parsed.sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        });
        setHistory(parsed);
      }
    } catch (error) {
      console.log('Gecmis yuklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kayıtla birlikte fotoğraf dosyasını da diskten sil (öksüz dosya birikmesin)
  var deletePhotoFile = function (item) {
    if (item && item.photoFileName) {
      FileSystem.deleteAsync(FileSystem.documentDirectory + item.photoFileName, { idempotent: true })
        .catch(function () {});
    }
  };

  var deleteItem = function (id) {
    Alert.alert(t('hist.deleteTitle'), t('hist.deleteBody'), [
      { text: t('hist.cancel'), style: 'cancel' },
      {
        text: t('hist.delete'),
        style: 'destructive',
        onPress: async function () {
          var removed = history.find(function (item) { return item.id === id; });
          deletePhotoFile(removed);
          var updated = history.filter(function (item) {
            return item.id !== id;
          });
          setHistory(updated);
          await AsyncStorage.setItem(
            'cookingHistory',
            JSON.stringify(updated)
          );
        },
      },
    ]);
  };

  var clearAll = function () {
    Alert.alert(
      t('hist.clearTitle'),
      t('hist.clearBody'),
      [
        { text: t('hist.cancel'), style: 'cancel' },
        {
          text: t('hist.clearTitle'),
          style: 'destructive',
          onPress: async function () {
            history.forEach(deletePhotoFile);
            setHistory([]);
            await AsyncStorage.removeItem('cookingHistory');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={[styles.header, { paddingTop: 12 + insets.top }]}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={function () {
                navigation.goBack();
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {history.length > 0 ? (
              <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                <Text style={styles.clearText}>{t('hist.clearAll')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.headerTitle}>{t('hist.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {history.length > 0
              ? t('hist.count', { n: history.length })
              : t('hist.empty')}
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>⏳</Text>
            <Text style={styles.emptyTitle}>{t('hist.loading')}</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>{t('hist.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('hist.emptySub')}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={function () {
                navigation.goBack();
              }}
            >
              <Text style={styles.emptyButtonText}>{t('hist.emptyBtn')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {history.map(function (item, index) {
              return (
                <HistoryCard
                  key={item.id}
                  item={item}
                  index={index}
                  onDelete={deleteItem}
                />
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOW_SOFT,
  },
  headerContent: {},
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 5,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  historyCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    ...SHADOW,
  },
  photoContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    backgroundColor: '#F5EADF',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noPhoto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  noPhotoText: {
    fontSize: 11,
    color: '#B0A090',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardInfo: {
    padding: 12,
  },
  cardRecipeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 11,
    color: '#999',
    marginBottom: 6,
  },
  cardPlayers: {
    marginBottom: 6,
  },
  cardPlayerText: {
    fontSize: 11,
    color: '#666',
  },
  ratingsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});