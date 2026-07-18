import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Dimensions, Image, Text, Easing } from 'react-native';

// ───────────────────────────────────────────────────────────────
// Date Night yükleme animasyonu: domates ve soğan iki yandan yavaşça
// gelir, ortada buluşur, vals başlar (birbirinin etrafında yavaş dönüş)
// ve valsle birlikte aralarından kalpler süzülür.
// ───────────────────────────────────────────────────────────────

var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

var TOMATO_IMG = require('../assets/datenight/tomato.png');
var ONION_IMG = require('../assets/datenight/onion.png');
var HEART_IMG = require('../assets/datenight/heart.png');

var CHARACTER_SIZE = 110;
var MEET_Y = screenHeight * 0.30;      // buluşma yüksekliği
var ORBIT_RADIUS = 62;                 // vals yörünge yarıçapı
var ENTRANCE_MS = 1200;                // giriş süresi (kısa: vals, tarif gelmeden görünsün)
var ORBIT_MS = 11000;                  // tam tur süresi (yavaş vals)

// Tek bir yükselen kalp: doğar, süzülerek yükselir, soluklaşır
function RisingHeart(props) {
  var rise = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    Animated.timing(rise, { toValue: 1, duration: 2600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(function () {
      if (props.onDone) props.onDone(props.id);
    });
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: props.x,
        top: props.y,
        opacity: rise.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 0.9, 0.7, 0] }),
        transform: [
          { translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [0, -130] }) },
          { translateX: rise.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, props.sway, 0] }) },
          { scale: rise.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.4, 1, 0.9] }) },
        ],
      }}
    >
      <Image source={HEART_IMG} style={{ width: props.size, height: props.size * 0.87 }} resizeMode="contain" />
    </Animated.View>
  );
}

export default function DateNightDance() {
  var centerX = screenWidth / 2;

  var tomatoX = useRef(new Animated.Value(-CHARACTER_SIZE)).current;
  var tomatoY = useRef(new Animated.Value(MEET_Y)).current;
  var onionX = useRef(new Animated.Value(screenWidth + CHARACTER_SIZE)).current;
  var onionY = useRef(new Animated.Value(MEET_Y)).current;

  var tomatoBounce = useRef(new Animated.Value(0)).current;
  var onionBounce = useRef(new Animated.Value(0)).current;

  var heartsState = useState([]);
  var hearts = heartsState[0];
  var setHearts = heartsState[1];
  var heartIdRef = useRef(0);

  var removeHeart = function (id) {
    setHearts(function (prev) { return prev.filter(function (h) { return h.id !== id; }); });
  };

  useEffect(function () {
    // Yürüyüş sırasında hafif zıplama (varış sonrası vals sallanmasına döner)
    var bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tomatoBounce, { toValue: -8, duration: 320, useNativeDriver: true }),
        Animated.timing(tomatoBounce, { toValue: 0, duration: 320, useNativeDriver: true }),
      ])
    );
    var onionBounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(onionBounce, { toValue: -7, duration: 360, useNativeDriver: true }),
        Animated.timing(onionBounce, { toValue: 0, duration: 360, useNativeDriver: true }),
      ])
    );
    bounceLoop.start();
    onionBounceLoop.start();

    // FAZ 1 — yavaş giriş: iki yandan buluşma noktalarına
    var tomatoTargetX = centerX - ORBIT_RADIUS - CHARACTER_SIZE / 2;
    var onionTargetX = centerX + ORBIT_RADIUS - CHARACTER_SIZE / 2;

    Animated.parallel([
      Animated.timing(tomatoX, { toValue: tomatoTargetX, duration: ENTRANCE_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(onionX, { toValue: onionTargetX, duration: ENTRANCE_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]).start();

    // FAZ 2 — vals: ortak merkez etrafında yavaş dönüş + kalpler
    var frameId = null;
    var heartTimer = null;
    var startTimer = setTimeout(function () {
      var startTime = Date.now();

      var update = function () {
        var elapsed = Date.now() - startTime;
        var angle = (elapsed / ORBIT_MS) * Math.PI * 2;

        // Domates ve soğan karşılıklı fazlarda döner; hafif dikey elips (derinlik hissi)
        var tX = centerX + Math.cos(angle + Math.PI) * ORBIT_RADIUS - CHARACTER_SIZE / 2;
        var tY = MEET_Y + Math.sin(angle + Math.PI) * (ORBIT_RADIUS * 0.35);
        var oX = centerX + Math.cos(angle) * ORBIT_RADIUS - CHARACTER_SIZE / 2;
        var oY = MEET_Y + Math.sin(angle) * (ORBIT_RADIUS * 0.35);

        tomatoX.setValue(tX);
        tomatoY.setValue(tY);
        onionX.setValue(oX);
        onionY.setValue(oY);

        frameId = requestAnimationFrame(update);
      };
      frameId = requestAnimationFrame(update);

      // Kalpler: vals başlayınca periyodik doğar (aynı anda en fazla 7)
      var HEART_COLORS = ['#E8B4A0', '#F0A9B8', '#D4A857', '#C96A7E'];
      heartTimer = setInterval(function () {
        setHearts(function (prev) {
          if (prev.length >= 7) return prev;
          heartIdRef.current += 1;
          return prev.concat([{
            id: heartIdRef.current,
            x: centerX - 12 + (Math.random() * 90 - 45),
            y: MEET_Y + 10 + Math.random() * 30,
            size: 16 + Math.random() * 14,
            sway: Math.random() * 40 - 20,
            color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
          }]);
        });
      }, 700);
    }, ENTRANCE_MS + 100);

    return function () {
      bounceLoop.stop();
      onionBounceLoop.stop();
      clearTimeout(startTimer);
      if (heartTimer) clearInterval(heartTimer);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Domates — soldan gelir, sağa (soğana) bakar */}
      <Animated.View
        style={{
          position: 'absolute',
          width: CHARACTER_SIZE,
          height: CHARACTER_SIZE,
          transform: [
            { translateX: tomatoX },
            { translateY: tomatoY },
            { translateY: tomatoBounce },
            { scaleX: -1 },
          ],
        }}
      >
        <Image source={TOMATO_IMG} style={styles.characterImage} resizeMode="contain" />
      </Animated.View>

      {/* Soğan — sağdan gelir, sola (domatese) bakar */}
      <Animated.View
        style={{
          position: 'absolute',
          width: CHARACTER_SIZE,
          height: CHARACTER_SIZE,
          transform: [
            { translateX: onionX },
            { translateY: onionY },
            { translateY: onionBounce },
          ],
        }}
      >
        <Image source={ONION_IMG} style={styles.characterImage} resizeMode="contain" />
      </Animated.View>

      {/* Yükselen kalpler */}
      {hearts.map(function (h) {
        return <RisingHeart key={h.id} id={h.id} x={h.x} y={h.y} size={h.size} sway={h.sway} color={h.color} onDone={removeHeart} />;
      })}
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
