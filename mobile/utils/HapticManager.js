import * as Haptics from 'expo-haptics';

// Hafif titreme - adım tamamlama
export function lightTap() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {
    console.log('Haptic hatasi:', e);
  }
}

// Orta titreme - görev tamamlama
export function mediumTap() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (e) {
    console.log('Haptic hatasi:', e);
  }
}

// Güçlü titreme - oyun sonu kutlama
export function heavyTap() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (e) {
    console.log('Haptic hatasi:', e);
  }
}

// Başarı hissi - özel pattern
export function successNotification() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {
    console.log('Haptic hatasi:', e);
  }
}

// Kutlama paterni - art arda titremeler
export function celebrationPattern() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(function () {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 150);
    setTimeout(function () {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 300);
    setTimeout(function () {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 500);
  } catch (e) {
    console.log('Haptic hatasi:', e);
  }
}