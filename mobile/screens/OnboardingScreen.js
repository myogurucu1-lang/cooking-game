import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

var screenWidth = Dimensions.get('window').width;

var SLIDES = [
  {
    emoji: '👨‍🍳',
    title: 'İki Kişilik Yemek Oyunu',
    description: 'Mutfakta beraber eğlenmek için tasarlandı. Bir arkadaşınla, partnerinle veya aile bireyinle oyna.',
  },
  {
    emoji: '🤝',
    title: 'Roller Belli',
    description: 'Biriniz "Cook" — yemeği pişiren. Diğeriniz "Challenger" — eğlenceli görevler veren. Telefonu el değiştirerek oynayın.',
  },
  {
    emoji: '🎉',
    title: 'Beraber Başarın',
    description: 'Malzemelerinizi girin, AI size tarif ve eğlenceli görevler hazırlasın. Sonunda yemeğinizin tadını çıkarın!',
  },
];

// Tek tip, sabit arka plan rengi — slayt geçişinde ton kaymasını/bantlaşmayı önler
var BG_COLOR = '#FF7A45';

export default function OnboardingScreen(props) {
  var navigation = props.navigation;
  var insets = useSafeAreaInsets();
  var scrollRef = useRef(null);
  var indexState = useState(0);
  var currentIndex = indexState[0];
  var setCurrentIndex = indexState[1];

  var scrollX = useRef(new Animated.Value(0)).current;

  var handleScroll = function (event) {
    var offsetX = event.nativeEvent.contentOffset.x;
    var index = Math.round(offsetX / screenWidth);
    setCurrentIndex(index);
  };

  var goNext = function () {
    if (currentIndex < SLIDES.length - 1) {
      var nextIndex = currentIndex + 1;
      scrollRef.current.scrollTo({ x: nextIndex * screenWidth, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      finishOnboarding();
    }
  };

  var goSkip = function () {
    finishOnboarding();
  };

  var finishOnboarding = async function () {
    try {
      await AsyncStorage.setItem('onboardingSeen', 'true');
    } catch (e) {
      console.log('Onboarding kayit hatasi:', e);
    }
    navigation.replace('Setup');
  };

  var currentSlide = SLIDES[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: BG_COLOR }]}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.skipContainer, { paddingTop: 10 + insets.top }]}>
          {currentIndex < SLIDES.length - 1 ? (
            <TouchableOpacity onPress={goSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Geç</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false, listener: handleScroll }
          )}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {SLIDES.map(function (slide, index) {
            return (
              <View key={index} style={[styles.slide, { width: screenWidth }]}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{slide.emoji}</Text>
                </View>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            {SLIDES.map(function (_, i) {
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    currentIndex === i && styles.dotActive,
                  ]}
                />
              );
            })}
          </View>

          <TouchableOpacity onPress={goNext} style={styles.nextButton} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>
              {currentIndex < SLIDES.length - 1 ? 'Devam' : 'Başla'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  skipContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emojiContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 90,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    gap: 10,
    minWidth: 200,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});