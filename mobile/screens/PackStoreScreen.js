import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image, ImageBackground, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLang } from '../i18n';
import { DATENIGHT_UNLOCKED, DN } from '../utils/packs';

// ───────────────────────────────────────────────────────────────
// Paket satış sayfası (Headway/Paired düzeni): tek paket odaklı,
// büyük görsel + fayda listesi + tek fiyat butonu + geri yükle.
// RevenueCat entegrasyonunda satın alma butonu gerçek akışa bağlanacak.
// ───────────────────────────────────────────────────────────────

function Benefit(props) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIcon}>
        <Ionicons name={props.icon} size={17} color={DN.rose} />
      </View>
      <Text style={styles.benefitText}>{props.text}</Text>
    </View>
  );
}

export default function PackStoreScreen(props) {
  var navigation = props.navigation;
  var insets = useSafeAreaInsets();
  var t = useLang().t;

  var owned = DATENIGHT_UNLOCKED;

  var onBuy = function () {
    // TODO: RevenueCat purchase akışı buraya bağlanacak
    Alert.alert(t('store.dnTitle'), t('store.buySoon'), [{ text: t('pack.lockedOk') }]);
  };

  var onRestore = function () {
    // TODO: RevenueCat restorePurchases buraya bağlanacak
    Alert.alert(t('store.restore'), t('store.restoreSoon'), [{ text: t('pack.lockedOk') }]);
  };

  var onPlay = function () {
    navigation.navigate('Setup', { preselectPack: 'datenight' });
  };

  return (
    <ImageBackground source={require('../assets/datenight/bg-kitchen.png')} style={styles.bg} resizeMode="cover">
      <StatusBar style="light" />
      <View style={styles.scrim} />

      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30 }]} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.closeBtn} onPress={function () { navigation.goBack(); }} activeOpacity={0.8}>
          <Ionicons name="close" size={22} color={DN.textSoft} />
        </TouchableOpacity>

        {/* Çift görseli */}
        <View style={styles.coupleRow}>
          <Image source={require('../assets/datenight/cook.png')} style={styles.coupleImg} resizeMode="contain" />
          <View style={styles.coupleHeart}>
            <Ionicons name="heart" size={22} color={DN.rosePink} />
          </View>
          <Image source={require('../assets/datenight/challenger.png')} style={styles.coupleImg} resizeMode="contain" />
        </View>

        <Text style={styles.title}>{t('store.dnTitle')}</Text>
        <Text style={styles.tagline}>{t('store.dnTag')}</Text>

        <View style={styles.benefitsCard}>
          <Benefit icon="heart" text={t('store.b1')} />
          <Benefit icon="flame" text={t('store.b2')} />
          <Benefit icon="sparkles" text={t('store.b3')} />
          <Benefit icon="infinite" text={t('store.b4')} />
        </View>

        {owned ? (
          <>
            <View style={styles.ownedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={DN.green} />
              <Text style={styles.ownedText}>{t('store.owned')}</Text>
            </View>
            <TouchableOpacity onPress={onPlay} activeOpacity={0.9}>
              <LinearGradient colors={[DN.bordo, DN.bordoDeep]} style={styles.buyBtn}>
                <Ionicons name="heart-circle" size={24} color="#FFFFFF" />
                <Text style={styles.buyText}>{t('store.play')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={onBuy} activeOpacity={0.9}>
              <LinearGradient colors={[DN.bordo, DN.bordoDeep]} style={styles.buyBtn}>
                <Ionicons name="lock-open" size={22} color="#FFFFFF" />
                <Text style={styles.buyText}>{t('store.buy')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRestore} activeOpacity={0.7}>
              <Text style={styles.restoreText}>{t('store.restore')}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Party teaser */}
        <View style={styles.partyCard}>
          <View style={styles.partyIconBg}>
            <Ionicons name="people" size={20} color={DN.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.partyTitle}>{t('store.partyTitle')}</Text>
            <Text style={styles.partySub}>{t('pack.partySoonMsg')}</Text>
          </View>
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>{t('pack.soon')}</Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

var styles = StyleSheet.create({
  bg: { flex: 1 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(28,19,21,0.62)' },
  content: { paddingHorizontal: 24 },
  closeBtn: {
    alignSelf: 'flex-end', width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  coupleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
  coupleImg: { width: 120, height: 150 },
  coupleHeart: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(139,46,68,0.55)',
    alignItems: 'center', justifyContent: 'center', marginHorizontal: -8, zIndex: 2,
  },
  title: { fontSize: 30, fontWeight: '900', color: '#FBEEE8', textAlign: 'center', marginTop: 14 },
  tagline: { fontSize: 14, color: DN.rose, textAlign: 'center', marginTop: 4, fontWeight: '600' },
  benefitsCard: {
    backgroundColor: 'rgba(46,32,36,0.92)', borderRadius: 18, borderWidth: 1, borderColor: DN.border,
    paddingVertical: 8, paddingHorizontal: 16, marginTop: 20,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  benefitIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(139,46,68,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  benefitText: { flex: 1, fontSize: 14, color: DN.text, fontWeight: '600', lineHeight: 19 },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 999, paddingVertical: 16, marginTop: 18,
    shadowColor: DN.bordo, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
  },
  buyText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  restoreText: { fontSize: 13, color: DN.muted, textAlign: 'center', marginTop: 14, textDecorationLine: 'underline' },
  ownedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 },
  ownedText: { fontSize: 15, fontWeight: '800', color: DN.green },
  partyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(46,32,36,0.75)', borderRadius: 16, borderWidth: 1, borderColor: DN.border,
    padding: 14, marginTop: 26,
  },
  partyIconBg: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(212,168,87,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  partyTitle: { fontSize: 15, fontWeight: '800', color: DN.textSoft },
  partySub: { fontSize: 12, color: DN.muted, marginTop: 2 },
  soonBadge: { backgroundColor: 'rgba(212,168,87,0.2)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  soonText: { fontSize: 11, fontWeight: '800', color: DN.gold },
});
