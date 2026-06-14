import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

var STORAGE_KEY = 'appLanguage';

var translations = {
  tr: {
    // Onboarding
    'onb.slide1.title': 'İki Kişilik Yemek Oyunu',
    'onb.slide1.desc': 'Mutfakta beraber eğlenmek için tasarlandı. Bir arkadaşınla, partnerinle veya aile bireyinle oyna.',
    'onb.slide2.title': 'Roller Belli',
    'onb.slide2.desc': 'Biriniz "Cook" — yemeği pişiren. Diğeriniz "Challenger" — eğlenceli görevler veren. Telefonu el değiştirerek oynayın.',
    'onb.slide3.title': 'Beraber Başarın',
    'onb.slide3.desc': 'Malzemelerinizi girin, AI size tarif ve eğlenceli görevler hazırlasın. Sonunda yemeğinizin tadını çıkarın!',
    'onb.skip': 'Geç',
    'onb.next': 'Devam',
    'onb.start': 'Başla',

    // Setup
    'setup.tagline': 'Birlikte pişir, birlikte eğlen!',
    'setup.namePlaceholder': 'İsim gir',
    'setup.ingredients': 'Malzemeler',
    'setup.ingredientsPlaceholder': 'Elindeki malzemeleri yaz...\nÖrn: makarna, salça, tavuk, soğan',
    'setup.difficulty': 'Zorluk Seviyesi',
    'setup.everyday': 'Gündelik',
    'setup.everydayTime': '20-30 dk',
    'setup.chef': 'Şef',
    'setup.chefTime': '45-90 dk',
    'setup.start': 'OYUNU BAŞLAT',

    // Transition
    'trans.title': 'Oyun Başlıyor',
    'trans.loading1': 'Sebzeler hazırlanıyor...',
    'trans.loading2': 'Tarif yazılıyor...',
    'trans.loading3': 'Görevler kuruluyor...',
    'trans.loading4': 'Mutfakta küçük bir kaos...',
    'trans.loading5': 'Soğan domatesi kovalıyor...',
    'trans.loading6': 'Malzemeler buluşuyor...',
    'trans.errorTitle': 'Bağlantı Sorunu',
    'trans.errorBody': 'İnternet bağlantını kontrol edip tekrar deneyebilirsin.',
    'trans.unreachable': 'Sunucuya ulaşılamadı.',
    'trans.timeout': 'Bağlantı zaman aşımına uğradı.',
    'trans.badResponse': 'Sunucudan beklenmeyen yanıt geldi.',
    'trans.failed': 'Tarif oluşturulamadı.',
    'trans.back': 'Geri Dön',
    'trans.retry': 'Tekrar Dene',

    // Cook
    'cook.greeting': 'Haydi {cook}, başlayalım!',
    'cook.tasks': 'Görevler',
    'cook.ingredients': 'Malzemeler',
    'cook.steps': 'Tarif Adımları',
    'cook.finish': 'Yemeği Bitir!',
    'cook.finishProgress': 'Önce tüm adımları tamamla ({done}/{total})',
    'cook.stepCount': '{done}/{total} adım',
    'cook.emptyTitle': 'Tarif adımları yüklenemedi',
    'cook.emptyText': 'Geri dönüp yeni bir tarif oluşturabilirsin.',
    'cook.emptyBtn': 'Geri Dön',
    'cook.exitTitle': 'Oyundan çıkılsın mı?',
    'cook.exitBody': 'Tarif ve ilerlemen kaybolacak.',
    'cook.stay': 'Kal',
    'cook.leave': 'Çık',
    'cook.taskTime': 'Görev zamanı!',
    'cook.taskHandoff': '{title} — telefonu {challenger}\'e ver!',
    'cook.stepPrefix': 'Adım {n}: ',
    'cook.spotlightTitle': 'Görevler burada! ⚡',
    'cook.spotlightDesc': 'Tarif boyunca eğlenceli görev zamanı geldiğinde Challenger ({challenger}) bu butona basacak. Telefonu el değiştirin!',

    // Challenger
    'chal.title': '⚡ Challenger Görevleri',
    'chal.subtitle': '{challenger}, {cook}\'e bu görevleri yaptır!',
    'chal.instruction': '🎯 Sırası gelen görevi doğru zamanda {cook}\'e söyle!',
    'chal.back': 'Tarife Dön',
    'chal.stepBadge': 'Adım {n}',
    'chal.stepAt': 'Adım {n}\'de',
    'chal.minutes': '{n} dk',
    'chal.emptyTitle': 'Görev Bulunamadı',
    'chal.emptyText': 'AI bu sefer görev üretmemiş. Tarife geri dönebilirsin.',
    'chal.tutTitle': 'Görevlerin Hazır!',
    'chal.tutDesc': 'Sırası gelen görevi doğru zamanda Cook\'a söyle!',
    'cat.eglence': 'Eğlence',
    'cat.sunum': 'Sunum',
    'cat.rol': 'Rol',
    'cat.dikkat': 'Dikkat',
    'cat.main': 'Ana Görev',
    'cat.side': 'Yan Görev',
    'cat.big': 'Büyük Görev',
    'cat.small': 'Küçük Görev',

    // Result
    'res.title': 'Afiyet Olsun!',
    'res.subtitle': '{cook} & {challenger} başardınız!',
    'res.statStep': 'Adım',
    'res.statTask': 'Görev',
    'res.statTime': 'Süre',
    'res.statDifficulty': 'Zorluk',
    'res.photoSection': '📸 Yemeğinin Fotoğrafı',
    'res.takePhoto': 'Fotoğraf Çek',
    'res.photoHint': 'Yemeğini ölümsüzleştir!',
    'res.retake': 'Tekrar Çek',
    'res.cameraHint': 'Yemeğinin fotoğrafını çek!',
    'res.badges': '🎖️ Rozetler',
    'res.badgeStarChef': 'Yıldız Şef',
    'res.badgeTaskMaster': 'Görev Ustası',
    'res.badgeBraveChef': 'Cesur Şef',
    'res.badgeBraveSub': 'Şef modunu seçtiniz!',
    'res.badgeFastHands': 'Hızlı Eller',
    'res.badgeFastSub': 'Gündelik mod tamamlandı!',
    'res.badgePerfect': 'Mükemmeliyetçi',
    'res.badgePerfectSub': 'Tüm adımlar tamamlandı!',
    'res.ratingSection': '⭐ Birbirinizi Puanlayın',
    'res.cookPerf': 'Şefin Performansı',
    'res.chalPerf': 'Challenger Performansı',
    'res.rate5': 'Muhteşem!',
    'res.rate4': 'Harika!',
    'res.rate3': 'İyi!',
    'res.rate2': 'Fena değil',
    'res.rate1': 'Hmm...',
    'res.saved': 'Geçmişe kaydedildi!',
    'res.playAgain': 'Tekrar Oyna',
    'res.permTitle': 'İzin Gerekli',
    'res.permBody': 'Fotoğraf çekmek için kamera izni gerekli. Ayarlardan izin verebilirsiniz.',
    'res.permDeniedTitle': 'Kamera İzni',
    'res.permDeniedBody': 'Kamera izni reddedilmiş. Lütfen telefon ayarlarından kamera iznini açın.',
    'res.ok': 'Tamam',
    'res.errorTitle': 'Hata',
    'res.cameraOpenError': 'Kamera açılamadı: {msg}',
    'res.photoError': 'Fotoğraf çekilemedi: {msg}',
    'res.cameraNotReady': 'Kamera henüz hazır değil, birkaç saniye bekleyip tekrar deneyin.',
    'res.cameraFailTitle': 'Kamera Hatası',
    'res.cameraFailBody': 'Kamera başlatılamadı.',

    // History
    'hist.title': '📖 Yemek Geçmişim',
    'hist.count': '{n} yemek yaptın!',
    'hist.empty': 'Henüz yemek yapmadın',
    'hist.clearAll': 'Tümünü Sil',
    'hist.loading': 'Yükleniyor...',
    'hist.emptyTitle': 'Henüz yemek geçmişin yok',
    'hist.emptySub': 'İlk yemeğini yap ve burada görsün!',
    'hist.emptyBtn': 'Yemek Yapmaya Başla',
    'hist.noPhoto': 'Fotoğraf yok',
    'hist.deleteTitle': 'Sil',
    'hist.deleteBody': 'Bu yemeği geçmişten silmek istiyor musun?',
    'hist.cancel': 'İptal',
    'hist.delete': 'Sil',
    'hist.clearTitle': 'Tümünü Sil',
    'hist.clearBody': 'Tüm yemek geçmişini silmek istiyor musun? Bu işlem geri alınamaz.',

    // Drawer
    'drawer.history': 'Yemek Geçmişim',
    'drawer.language': 'Dil',
  },

  en: {
    // Onboarding
    'onb.slide1.title': 'A Two-Player Cooking Game',
    'onb.slide1.desc': 'Made for having fun in the kitchen together. Play with a friend, partner, or family member.',
    'onb.slide2.title': 'Clear Roles',
    'onb.slide2.desc': 'One of you is the "Cook" — who cooks. The other is the "Challenger" — who gives fun tasks. Play by passing the phone back and forth.',
    'onb.slide3.title': 'Succeed Together',
    'onb.slide3.desc': 'Enter your ingredients and let AI prepare a recipe and fun tasks. Enjoy your meal at the end!',
    'onb.skip': 'Skip',
    'onb.next': 'Next',
    'onb.start': 'Start',

    // Setup
    'setup.tagline': 'Cook together, laugh together!',
    'setup.namePlaceholder': 'Enter name',
    'setup.ingredients': 'Ingredients',
    'setup.ingredientsPlaceholder': 'List your ingredients...\nE.g. pasta, tomato paste, chicken, onion',
    'setup.difficulty': 'Difficulty',
    'setup.everyday': 'Everyday',
    'setup.everydayTime': '20-30 min',
    'setup.chef': 'Chef',
    'setup.chefTime': '45-90 min',
    'setup.start': 'START GAME',

    // Transition
    'trans.title': 'Game Starting',
    'trans.loading1': 'Prepping the veggies...',
    'trans.loading2': 'Writing the recipe...',
    'trans.loading3': 'Setting up the tasks...',
    'trans.loading4': 'A little kitchen chaos...',
    'trans.loading5': 'The onion is chasing the tomato...',
    'trans.loading6': 'The ingredients are meeting up...',
    'trans.errorTitle': 'Connection Problem',
    'trans.errorBody': 'Check your internet connection and try again.',
    'trans.unreachable': 'Could not reach the server.',
    'trans.timeout': 'The connection timed out.',
    'trans.badResponse': 'Unexpected response from the server.',
    'trans.failed': 'Could not create a recipe.',
    'trans.back': 'Go Back',
    'trans.retry': 'Try Again',

    // Cook
    'cook.greeting': "Let's go {cook}, let's start!",
    'cook.tasks': 'Tasks',
    'cook.ingredients': 'Ingredients',
    'cook.steps': 'Recipe Steps',
    'cook.finish': 'Finish the Dish!',
    'cook.finishProgress': 'Complete all steps first ({done}/{total})',
    'cook.stepCount': '{done}/{total} steps',
    'cook.emptyTitle': 'Recipe steps could not load',
    'cook.emptyText': 'Go back and create a new recipe.',
    'cook.emptyBtn': 'Go Back',
    'cook.exitTitle': 'Leave the game?',
    'cook.exitBody': 'Your recipe and progress will be lost.',
    'cook.stay': 'Stay',
    'cook.leave': 'Leave',
    'cook.taskTime': 'Task time!',
    'cook.taskHandoff': '{title} — hand the phone to {challenger}!',
    'cook.stepPrefix': 'Step {n}: ',
    'cook.spotlightTitle': 'Tasks are here! ⚡',
    'cook.spotlightDesc': 'When it\'s fun-task time during the recipe, the Challenger ({challenger}) will tap this button. Swap the phone!',

    // Challenger
    'chal.title': '⚡ Challenger Tasks',
    'chal.subtitle': '{challenger}, make {cook} do these tasks!',
    'chal.instruction': '🎯 Tell {cook} each task at the right moment!',
    'chal.back': 'Back to Recipe',
    'chal.stepBadge': 'Step {n}',
    'chal.stepAt': 'At step {n}',
    'chal.minutes': '{n} min',
    'chal.emptyTitle': 'No Tasks Found',
    'chal.emptyText': 'AI didn\'t generate tasks this time. You can go back to the recipe.',
    'chal.tutTitle': 'Your Tasks Are Ready!',
    'chal.tutDesc': 'Tell the Cook each task at the right moment!',
    'cat.eglence': 'Fun',
    'cat.sunum': 'Plating',
    'cat.rol': 'Role',
    'cat.dikkat': 'Focus',
    'cat.main': 'Main Task',
    'cat.side': 'Side Task',
    'cat.big': 'Big Task',
    'cat.small': 'Small Task',

    // Result
    'res.title': 'Bon Appétit!',
    'res.subtitle': '{cook} & {challenger}, you did it!',
    'res.statStep': 'Steps',
    'res.statTask': 'Tasks',
    'res.statTime': 'Time',
    'res.statDifficulty': 'Difficulty',
    'res.photoSection': '📸 Photo of Your Dish',
    'res.takePhoto': 'Take Photo',
    'res.photoHint': 'Immortalize your dish!',
    'res.retake': 'Retake',
    'res.cameraHint': 'Take a photo of your dish!',
    'res.badges': '🎖️ Badges',
    'res.badgeStarChef': 'Star Chef',
    'res.badgeTaskMaster': 'Task Master',
    'res.badgeBraveChef': 'Brave Chef',
    'res.badgeBraveSub': 'You chose Chef mode!',
    'res.badgeFastHands': 'Fast Hands',
    'res.badgeFastSub': 'Everyday mode completed!',
    'res.badgePerfect': 'Perfectionist',
    'res.badgePerfectSub': 'All steps completed!',
    'res.ratingSection': '⭐ Rate Each Other',
    'res.cookPerf': "Cook's Performance",
    'res.chalPerf': "Challenger's Performance",
    'res.rate5': 'Amazing!',
    'res.rate4': 'Great!',
    'res.rate3': 'Good!',
    'res.rate2': 'Not bad',
    'res.rate1': 'Hmm...',
    'res.saved': 'Saved to history!',
    'res.playAgain': 'Play Again',
    'res.permTitle': 'Permission Required',
    'res.permBody': 'Camera permission is needed to take photos. You can grant it in Settings.',
    'res.permDeniedTitle': 'Camera Permission',
    'res.permDeniedBody': 'Camera permission was denied. Please enable it in your phone settings.',
    'res.ok': 'OK',
    'res.errorTitle': 'Error',
    'res.cameraOpenError': 'Could not open camera: {msg}',
    'res.photoError': 'Could not take photo: {msg}',
    'res.cameraNotReady': 'Camera is not ready yet, wait a few seconds and try again.',
    'res.cameraFailTitle': 'Camera Error',
    'res.cameraFailBody': 'Could not start the camera.',

    // History
    'hist.title': '📖 My Cooking History',
    'hist.count': 'You made {n} dishes!',
    'hist.empty': "You haven't cooked yet",
    'hist.clearAll': 'Clear All',
    'hist.loading': 'Loading...',
    'hist.emptyTitle': 'No cooking history yet',
    'hist.emptySub': 'Make your first dish and see it here!',
    'hist.emptyBtn': 'Start Cooking',
    'hist.noPhoto': 'No photo',
    'hist.deleteTitle': 'Delete',
    'hist.deleteBody': 'Delete this dish from history?',
    'hist.cancel': 'Cancel',
    'hist.delete': 'Delete',
    'hist.clearTitle': 'Clear All',
    'hist.clearBody': 'Delete all cooking history? This cannot be undone.',

    // Drawer
    'drawer.history': 'My Cooking History',
    'drawer.language': 'Language',
  },
};

// Modül seviyesi geçerli dil — t() her yerden okuyabilsin
var currentLang = 'tr';

export function t(key, params) {
  var table = translations[currentLang] || translations.tr;
  var str = table[key];
  if (str == null) str = (translations.tr[key] != null ? translations.tr[key] : key);
  if (params) {
    Object.keys(params).forEach(function (k) {
      str = str.split('{' + k + '}').join(String(params[k]));
    });
  }
  return str;
}

export function getLanguage() {
  return currentLang;
}

var LanguageContext = createContext({ lang: 'tr', setLang: function () {}, t: t });

export function LanguageProvider(props) {
  var state = useState('tr');
  var lang = state[0];
  var setLangState = state[1];

  useEffect(function () {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(function (saved) {
        if (saved === 'en' || saved === 'tr') {
          currentLang = saved;
          setLangState(saved);
        }
      })
      .catch(function () {});
  }, []);

  var setLang = function (next) {
    currentLang = next;
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(function () {});
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { lang: lang, setLang: setLang, t: t } },
    props.children
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
