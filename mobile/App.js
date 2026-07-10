import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import mobileAds from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { LanguageProvider } from './i18n';
import OnboardingScreen from './screens/OnboardingScreen';
import SetupScreen from './screens/SetupScreen';
import TransitionScreen from './screens/TransitionScreen';
import CookScreen from './screens/CookScreen';
import ChallengerScreen from './screens/ChallengerScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';

const Stack = createNativeStackNavigator();

// Production'da beklenmedik render hatasında beyaz ekran yerine kurtarma ekranı göster
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log('ErrorBoundary yakaladı:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF7A45', padding: 32 }}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>🍳</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' }}>Bir şeyler ters gitti</Text>
          <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 24 }}>Mutfakta küçük bir kaza oldu. Baştan başlayalım!</Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 26 }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>Yeniden Başlat</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Setup');

  useEffect(() => {
    checkOnboarding();
    setupAds();
  }, []);

  // Önce iOS izleme izni (ATT) iste, sonra AdMob'u başlat (Android'de no-op).
  // ATT penceresi SADECE uygulama "active" durumdayken görünür; soğuk açılışta
  // uygulama henüz aktif olmayabilir, bu yüzden aktif olana kadar bekle ve
  // pencere tam sunulsun diye kısa bir gecikme ver (yoksa iOS sessizce geçer).
  const requestTrackingWhenActive = async () => {
    const ask = async () => {
      try {
        const { status } = await getTrackingPermissionsAsync();
        if (status === 'undetermined') {
          await new Promise((r) => setTimeout(r, 800));
          await requestTrackingPermissionsAsync();
        }
      } catch (e) {}
    };
    if (AppState.currentState === 'active') {
      await ask();
      return;
    }
    await new Promise((resolve) => {
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          sub.remove();
          resolve();
        }
      });
    });
    await ask();
  };

  const setupAds = async () => {
    await requestTrackingWhenActive();
    mobileAds().initialize().catch(() => {});
  };

  const checkOnboarding = async () => {
    try {
      const seen = await AsyncStorage.getItem('onboardingSeen');
      setInitialRoute(seen === 'true' ? 'Setup' : 'Onboarding');
    } catch (e) {
      setInitialRoute('Onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF7A45' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Setup" component={SetupScreen} />
          <Stack.Screen name="Transition" component={TransitionScreen} />
          <Stack.Screen name="Cook" component={CookScreen} />
          <Stack.Screen name="Challenger" component={ChallengerScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      </LanguageProvider>
    </ErrorBoundary>
  );
}