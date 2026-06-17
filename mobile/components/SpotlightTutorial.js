import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../i18n';

var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

/**
 * SpotlightTutorial — Ekranı karartıp belirli bir alanı (spotlight) aydınlatır.
 * 
 * Props:
 * - storageKey: AsyncStorage anahtarı (örn: "cookTutorialSpotlight")
 * - maxShows: Kaç kez gösterilecek (varsayılan 2)
 * - spotlight: { x, y, width, height, radius } — aydınlatılacak alan
 * - title, description: Mesaj
 * - arrowDirection: "up" | "down" | "left" | "right" — ok yönü
 */
export default function SpotlightTutorial(props) {
  var storageKey = props.storageKey || 'tutorialSpotlight';
  var maxShows = props.maxShows || 2;
  var spotlight = props.spotlight || { x: screenWidth - 130, y: 90, width: 110, height: 44, radius: 22 };
  var title = props.title || 'Görevler burada!';
  var description = props.description || 'Tarif boyunca challenger görevleri için bu butona bas.';
  var arrowDirection = props.arrowDirection || 'up';
  var t = useLang().t;

  var visibleState = useState(false);
  var visible = visibleState[0];
  var setVisible = visibleState[1];

  var fadeAnim = useRef(new Animated.Value(0)).current;
  var pulseAnim = useRef(new Animated.Value(1)).current;
  var arrowBounce = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    checkShouldShow();
  }, []);

  var checkShouldShow = async function () {
    try {
      var stored = await AsyncStorage.getItem(storageKey);
      var count = stored ? parseInt(stored, 10) : 0;
      if (count < maxShows) {
        // Kısa gecikme — ekran yüklendikten sonra göster
        setTimeout(function () {
          setVisible(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }).start();
          startPulse();
          startArrowBounce();
        }, 600);
      }
    } catch (e) {
      console.log('Tutorial check hatasi:', e);
    }
  };

  var startPulse = function () {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  var startArrowBounce = function () {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBounce, {
          toValue: -10,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(arrowBounce, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  var dismiss = async function () {
    try {
      var stored = await AsyncStorage.getItem(storageKey);
      var count = stored ? parseInt(stored, 10) : 0;
      await AsyncStorage.setItem(storageKey, String(count + 1));
    } catch (e) {
      console.log('Tutorial save hatasi:', e);
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(function () {
      setVisible(false);
    });
  };

  if (!visible) return null;

  // Karartma katmanları — spotlight delik bırakacak şekilde 4 dikdörtgen
  // Üst, Sol, Sağ, Alt
  var topHeight = spotlight.y;
  var leftWidth = spotlight.x;
  var rightX = spotlight.x + spotlight.width;
  var rightWidth = screenWidth - rightX;
  var bottomY = spotlight.y + spotlight.height;
  var bottomHeight = screenHeight - bottomY;

  // Mesaj kutusu pozisyonu
  var messageTop = spotlight.y + spotlight.height + 50;
  if (messageTop + 200 > screenHeight) {
    messageTop = spotlight.y - 200;
  }

  // Ok yönüne göre pozisyon
  var arrowStyle = {};
  if (arrowDirection === 'up') {
    arrowStyle = {
      top: spotlight.y + spotlight.height + 8,
      left: spotlight.x + spotlight.width / 2 - 18,
    };
  } else if (arrowDirection === 'down') {
    arrowStyle = {
      top: spotlight.y - 40,
      left: spotlight.x + spotlight.width / 2 - 18,
    };
  }

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents="auto"
    >
      {/* Karartma katmanları */}
      <TouchableOpacity
        style={[styles.overlay, { top: 0, left: 0, width: screenWidth, height: topHeight }]}
        activeOpacity={1}
        onPress={dismiss}
      />
      <TouchableOpacity
        style={[styles.overlay, { top: topHeight, left: 0, width: leftWidth, height: spotlight.height }]}
        activeOpacity={1}
        onPress={dismiss}
      />
      <TouchableOpacity
        style={[styles.overlay, { top: topHeight, left: rightX, width: rightWidth, height: spotlight.height }]}
        activeOpacity={1}
        onPress={dismiss}
      />
      <TouchableOpacity
        style={[styles.overlay, { top: bottomY, left: 0, width: screenWidth, height: bottomHeight }]}
        activeOpacity={1}
        onPress={dismiss}
      />

      {/* Spotlight pulse halkası */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulseRing,
          {
            top: spotlight.y - 6,
            left: spotlight.x - 6,
            width: spotlight.width + 12,
            height: spotlight.height + 12,
            borderRadius: (spotlight.radius || 22) + 6,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Aşağı doğru ok */}
      {arrowDirection === 'up' ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.arrow,
            arrowStyle,
            { transform: [{ translateY: arrowBounce }] },
          ]}
        >
          <Ionicons name="arrow-up" size={36} color="#FFD93D" />
        </Animated.View>
      ) : null}

      {/* Mesaj kutusu */}
      <View style={[styles.messageBox, { top: messageTop }]} pointerEvents="box-none">
        <View style={styles.messageContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <TouchableOpacity onPress={dismiss} style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>{t('common.gotIt')}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#FFD93D',
    backgroundColor: 'transparent',
  },
  arrow: {
    position: 'absolute',
  },
  messageBox: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  messageContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A2E',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});