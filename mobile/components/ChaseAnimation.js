import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Image } from 'react-native';

var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

var TOMATO_IMG = require('../assets/foods/tomato.png');
var ONION_IMG = require('../assets/foods/onion.png');

var CHARACTER_SIZE = 120;
var SPEED = 3.5;
var DELAY_FRAMES = 45;

export default function ChaseAnimation() {
  // Domates pozisyonu
  var tomatoX = useRef(new Animated.Value(screenWidth - CHARACTER_SIZE - 30)).current;
  var tomatoY = useRef(new Animated.Value(screenHeight * 0.35)).current;
  var tomatoFlip = useRef(new Animated.Value(1)).current;
  var tomatoBounce = useRef(new Animated.Value(0)).current;

  // Soğan pozisyonu
  var onionX = useRef(new Animated.Value(screenWidth + CHARACTER_SIZE)).current;
  var onionY = useRef(new Animated.Value(screenHeight * 0.35)).current;
  var onionFlip = useRef(new Animated.Value(1)).current;
  var onionBounce = useRef(new Animated.Value(0)).current;

  var fadeIn = useRef(new Animated.Value(0)).current;
  var onionFadeIn = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    // Domates fade in
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Soğan gecikmeli fade in
    setTimeout(function () {
      Animated.timing(onionFadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Domates zıplama
    Animated.loop(
      Animated.sequence([
        Animated.timing(tomatoBounce, {
          toValue: -14,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(tomatoBounce, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Soğan zıplama (biraz farklı ritim)
    Animated.loop(
      Animated.sequence([
        Animated.timing(onionBounce, {
          toValue: -11,
          duration: 230,
          useNativeDriver: true,
        }),
        Animated.timing(onionBounce, {
          toValue: 0,
          duration: 230,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Domatesin geçmiş pozisyonlarını tutan kuyruk
    var history = [];

    // Domates fizik değerleri
    var tPosX = screenWidth - CHARACTER_SIZE - 30;
    var tPosY = screenHeight * 0.35;
    var tVelX = -SPEED;
    var tVelY = SPEED * 0.7;
    var tLastFlip = 1;

    // Soğan başlangıç
    var oPosX = screenWidth + CHARACTER_SIZE;
    var oPosY = screenHeight * 0.35;
    var oLastFlip = 1;

    var maxX = screenWidth - CHARACTER_SIZE;
    var maxY = screenHeight - CHARACTER_SIZE - 140;
    var minY = 80;

    var frameCount = 0;
    var frameId = null;

    var update = function () {
      frameCount++;

      // === DOMATES HAREKETİ ===
      tPosX = tPosX + tVelX;
      tPosY = tPosY + tVelY;

      // Duvar çarpması
      if (tPosX <= 0) {
        tPosX = 0;
        tVelX = Math.abs(tVelX);
      } else if (tPosX >= maxX) {
        tPosX = maxX;
        tVelX = -Math.abs(tVelX);
      }

      if (tPosY <= minY) {
        tPosY = minY;
        tVelY = Math.abs(tVelY);
      } else if (tPosY >= maxY) {
        tPosY = maxY;
        tVelY = -Math.abs(tVelY);
      }

      // Flip yönü
      var tNewFlip = tVelX < 0 ? 1 : 0;
      if (tNewFlip !== tLastFlip) {
        tLastFlip = tNewFlip;
        Animated.timing(tomatoFlip, {
          toValue: tNewFlip,
          duration: 120,
          useNativeDriver: true,
        }).start();
      }

      tomatoX.setValue(tPosX);
      tomatoY.setValue(tPosY);

      // Pozisyonu geçmişe kaydet
      history.push({ x: tPosX, y: tPosY, flip: tNewFlip });

      // === SOĞAN HAREKETİ === (domatesin DELAY_FRAMES kadar gerisinden)
      if (history.length > DELAY_FRAMES) {
        var pastPos = history[history.length - DELAY_FRAMES];
        oPosX = pastPos.x;
        oPosY = pastPos.y;

        onionX.setValue(oPosX);
        onionY.setValue(oPosY);

        var oNewFlip = pastPos.flip;
        if (oNewFlip !== oLastFlip) {
          oLastFlip = oNewFlip;
          Animated.timing(onionFlip, {
            toValue: oNewFlip,
            duration: 120,
            useNativeDriver: true,
          }).start();
        }
      }

      // Bellek temizliği - çok eski pozisyonları sil
      if (history.length > DELAY_FRAMES + 100) {
        history = history.slice(-DELAY_FRAMES - 50);
      }

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);

    return function () {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  var tomatoScaleX = tomatoFlip.interpolate({
    inputRange: [0, 1],
    outputRange: [-1, 1],
  });

  var onionScaleX = onionFlip.interpolate({
    inputRange: [0, 1],
    outputRange: [-1, 1],
  });

  return (
    <View style={styles.container}>
      {/* Domates - önde kaçıyor */}
      <Animated.View
        style={{
          position: 'absolute',
          width: CHARACTER_SIZE,
          height: CHARACTER_SIZE,
          opacity: fadeIn,
          transform: [
            { translateX: tomatoX },
            { translateY: tomatoY },
            { translateY: tomatoBounce },
            { scaleX: tomatoScaleX },
          ],
        }}
      >
        <Image source={TOMATO_IMG} style={styles.characterImage} resizeMode="contain" />
      </Animated.View>

      {/* Soğan - arkadan kovalıyor */}
      <Animated.View
        style={{
          position: 'absolute',
          width: CHARACTER_SIZE,
          height: CHARACTER_SIZE,
          opacity: onionFadeIn,
          transform: [
            { translateX: onionX },
            { translateY: onionY },
            { translateY: onionBounce },
            { scaleX: onionScaleX },
          ],
        }}
      >
        <Image source={ONION_IMG} style={styles.characterImage} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  characterImage: {
    width: CHARACTER_SIZE,
    height: CHARACTER_SIZE,
  },
});