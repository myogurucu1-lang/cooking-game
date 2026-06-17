import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../i18n';

var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

export default function TutorialOverlay(props) {
  var steps = props.steps;
  var onFinish = props.onFinish;
  var storageKey = props.storageKey || null;
  var t = useLang().t;

  var currentStepState = useState(0);
  var currentStep = currentStepState[0];
  var setCurrentStep = currentStepState[1];

  // storageKey verildiyse daha önce görülüp görülmediğini kontrol edene kadar gizli başla
  var visibleState = useState(!storageKey);
  var visible = visibleState[0];
  var setVisible = visibleState[1];

  var fadeAnim = useRef(new Animated.Value(0)).current;
  var tooltipAnim = useRef(new Animated.Value(0)).current;
  var pulseAnim = useRef(new Animated.Value(1)).current;

  var startAnimations = function () {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(tooltipAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  useEffect(function () {
    if (!storageKey) {
      startAnimations();
      return;
    }
    AsyncStorage.getItem(storageKey)
      .then(function (seen) {
        if (seen !== 'true') {
          setVisible(true);
          startAnimations();
        }
      })
      .catch(function () {
        setVisible(true);
        startAnimations();
      });
  }, []);

  var nextStep = function () {
    if (currentStep < steps.length - 1) {
      Animated.timing(tooltipAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(function () {
        setCurrentStep(currentStep + 1);
        Animated.spring(tooltipAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }).start();
      });
    } else {
      finishTutorial();
    }
  };

  var finishTutorial = function () {
    if (storageKey) {
      AsyncStorage.setItem(storageKey, 'true').catch(function () {});
    }
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(tooltipAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(function () {
      setVisible(false);
      if (onFinish) onFinish();
    });
  };

  if (!visible || !steps || steps.length === 0) return null;

  var step = steps[currentStep];
  var isLast = currentStep === steps.length - 1;

  var tooltipPosition = step.position || 'center';
  var tooltipStyle = {};

  if (tooltipPosition === 'top') {
    tooltipStyle = { top: 120, left: 20, right: 20 };
  } else if (tooltipPosition === 'center') {
    tooltipStyle = { top: screenHeight * 0.35, left: 20, right: 20 };
  } else if (tooltipPosition === 'bottom') {
    tooltipStyle = { bottom: 160, left: 20, right: 20 };
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.overlay} />

      <Animated.View
        style={[
          styles.tooltipContainer,
          tooltipStyle,
          {
            opacity: tooltipAnim,
            transform: [
              { scale: tooltipAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
            ],
          },
        ]}
      >
        <View style={styles.tooltip}>
          <Animated.Text style={[styles.emoji, { transform: [{ scale: pulseAnim }] }]}>
            {step.emoji || '👆'}
          </Animated.Text>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.footer}>
            <View style={styles.dotsRow}>
              {steps.map(function (_, index) {
                return (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentStep && styles.dotActive,
                    ]}
                  />
                );
              })}
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={nextStep} activeOpacity={0.8}>
              <Text style={styles.nextText}>
                {isLast ? t('common.letsStart') : t('common.gotIt')}
              </Text>
              <Ionicons
                name={isLast ? 'checkmark' : 'arrow-forward'}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <TouchableOpacity style={styles.skipButton} onPress={finishTutorial} activeOpacity={0.7}>
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  tooltipContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D2D2D',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
  },
  dotActive: {
    backgroundColor: '#FF6B35',
    width: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  nextText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});