import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLang } from '../i18n';

var screenWidth = Dimensions.get('window').width;
var DRAWER_WIDTH = screenWidth * 0.72;

export default function DrawerMenu(props) {
  var visible = props.visible;
  var onClose = props.onClose;
  var onNavigate = props.onNavigate;

  var langCtx = useLang();
  var t = langCtx.t;
  var lang = langCtx.lang;
  var setLang = langCtx.setLang;

  var slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  var overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  var goToHistory = function () {
    onClose();
    setTimeout(function () {
      onNavigate('History');
    }, 250);
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient
          colors={['#FFF8F0', '#FFF0E5', '#FFE8D8']}
          style={styles.drawerGradient}
        >
          <View style={styles.drawerHeader}>
            <View style={styles.drawerLogoRow}>
              <Text style={styles.drawerLogo}>👨‍🍳</Text>
              <View>
                <Text style={styles.drawerTitle}>Cooking</Text>
                <Text style={styles.drawerSubtitle}>Challenge</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#8B7355" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={goToHistory}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBg}>
              <Ionicons name="book-outline" size={20} color="#FF6B35" />
            </View>
            <Text style={styles.menuLabel}>{t('drawer.history')}</Text>
            <Ionicons name="chevron-forward" size={18} color="#C0B0A0" />
          </TouchableOpacity>

          <View style={styles.langRow}>
            <View style={styles.menuIconBg}>
              <Ionicons name="language-outline" size={20} color="#FF6B35" />
            </View>
            <Text style={styles.menuLabel}>{t('drawer.language')}</Text>
            <View style={styles.langToggle}>
              <TouchableOpacity
                style={[styles.langOption, lang === 'tr' && styles.langOptionActive]}
                onPress={function () { setLang('tr'); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.langOptionText, lang === 'tr' && styles.langOptionTextActive]}>TR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langOption, lang === 'en' && styles.langOptionActive]}
                onPress={function () { setLang('en'); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.langOptionText, lang === 'en' && styles.langOptionTextActive]}>EN</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.drawerFooter}>
            <Text style={styles.footerText}>Cooking Challenge v1.0</Text>
          </View>
        </LinearGradient>
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
    zIndex: 100,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 20,
  },
  drawerGradient: {
    flex: 1,
    paddingTop: 60,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  drawerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerLogo: {
    fontSize: 32,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#5D3A1A',
  },
  drawerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(139, 115, 85, 0.15)',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 14,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#5D3A1A',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 14,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    borderRadius: 10,
    padding: 3,
  },
  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langOptionActive: {
    backgroundColor: '#FF6B35',
  },
  langOptionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B7355',
  },
  langOptionTextActive: {
    color: '#FFFFFF',
  },
  drawerFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#B0A090',
    fontWeight: '500',
  },
});