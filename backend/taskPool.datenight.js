// Date Night (romantik) görev havuzu — ücretli paket.
// category: iltifat | ani | flort | beraber | itiraf | jest | kivilcim | sofra
// mode: 'both' (Date Night'ta iki menü türünde de kullanılır)
// safeOnly: true → sadece bıçak/sıcak yağ/ateş içermeyen adımda verilmeli
// phase: early (ilk 1/3) | mid (orta) | late (son 1/3) | finale (son adım/servis)
// {cook} ve {challenger} yer tutucuları prompt kurulurken gerçek isimlerle değiştirilir.

const TASK_POOL_DATENIGHT = [
  // ─── KATEGORİ 1: İLTİFAT & TATLI SÖZLER (early) ───
  { id: 'dn-c01', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Üç Güzel Şey — {cook}, bu adımı yaparken {challenger}\'ın en sevdiğin üç özelliğini say.' },
  { id: 'dn-c02', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'İlk İzlenim — {cook}, {challenger}\'ı ilk gördüğün anda aklından geçenleri anlat.' },
  { id: 'dn-c03', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Şarkı Sözü Gibi — {cook}, {challenger}\'a bir iltifatı şarkı söyler gibi melodiyle yap.' },
  { id: 'dn-c04', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Tek Kelime — {cook}, {challenger}\'ı tek kelimeyle tarif et ve nedenini açıkla.' },
  { id: 'dn-c05', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Gizli Hayranlık — {cook}, {challenger}\'ın fark etmediğini düşündüğün ama çok sevdiğin bir huyunu söyle.' },
  { id: 'dn-c06', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Resmi İlan — {cook}, spiker ciddiyetiyle "Sayın seyirciler, karşınızda dünyanın en güzel insanı" diye başlayan bir anons yap.' },
  { id: 'dn-c07', category: 'iltifat', mode: 'both', safeOnly: true, phase: 'early', text: 'Gözlerinin İçine — {cook}, karıştırmaya ara ver, 5 saniye {challenger}\'ın gözlerine bak ve bir iltifat et.' },
  { id: 'dn-c08', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Şiir Denemesi — {cook}, {challenger} için iki dizelik uyduruk bir aşk şiiri söyle. Kötü olması serbest, gülmek garantili.' },
  { id: 'dn-c09', category: 'iltifat', mode: 'both', safeOnly: false, phase: 'early', text: 'Teşekkür Anı — {cook}, {challenger}\'a hayatına kattığı bir şey için teşekkür et.' },

  // ─── KATEGORİ 2: ANILAR & NOSTALJİ (early) ───
  { id: 'dn-a01', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'İlk Buluşma — {cook}, ilk buluşmanızdan aklında kalan en küçük detayı anlat.' },
  { id: 'dn-a02', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'Kahkaha Arşivi — {cook}, birlikte en çok güldüğünüz anı anlat, gülmeden bitirmeye çalış.' },
  { id: 'dn-a03', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'Utanç Vitrini — {cook}, {challenger}\'ın yanında yaşadığın en utandırıcı anını itiraf et.' },
  { id: 'dn-a04', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'İlk Mesaj — {cook}, {challenger}\'a attığın ilk mesajı hatırlamaya çalış ve yüksek sesle söyle. Hatırlamıyorsan uydur — {challenger} doğrusunu söylesin.' },
  { id: 'dn-a05', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'Zaman Kapsülü — {cook}, "5 yıl sonra beraber..." diye başlayan bir hayalini anlat.' },
  { id: 'dn-a06', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'Keşke Anı — {cook}, birlikte tekrar yaşamak istediğin bir anınızı anlat.' },
  { id: 'dn-a07', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'O An Anladım — {cook}, {challenger}\'dan gerçekten hoşlandığını anladığın anı anlat.' },
  { id: 'dn-a08', category: 'ani', mode: 'both', safeOnly: false, phase: 'early', text: 'Bizim Şarkımız — {cook}, ikinizi anlatan bir şarkı seç ve bir kıtasını mırıldan.' },

  // ─── KATEGORİ 3: FLÖRTÖZ & EĞLENCELİ (mid) ───
  { id: 'dn-f01', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Yavaş Çekim Bakış — {cook}, filmlerdeki gibi ağır çekimde saçını savurup {challenger}\'a bak.' },
  { id: 'dn-f02', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Dizi Repliği — {cook}, bu adımı romantik dizi başrolü gibi dramatik replikler eşliğinde yap.' },
  { id: 'dn-f03', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Göz Kırpma Ustası — {cook}, bu adım boyunca {challenger}\'la her göz göze gelişinde göz kırp.' },
  { id: 'dn-f04', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Fransız Şef — {cook}, bu adımı Fransız aksanıyla ve bol "mon amour" ekleyerek anlat.' },
  { id: 'dn-f05', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Aşk Meleği — {cook}, elindeki kaşığı mikrofon yap ve {challenger}\'a romantik bir şarkıdan iki satır söyle.' },
  { id: 'dn-f06', category: 'flort', mode: 'both', safeOnly: true, phase: 'mid', text: 'Bakış Yarışması — {cook} ve {challenger}, 10 saniye gülmeden bakışma yarışması yapın. Kaybeden diğerine iltifat eder.' },
  { id: 'dn-f07', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Gizli Ajan — {cook}, bu adımı yaparken {challenger}\'a fark ettirmeden üç kez göz at. Yakalanırsan iltifat borcun var.' },
  { id: 'dn-f08', category: 'flort', mode: 'both', safeOnly: true, phase: 'mid', text: 'Tango Duruşu — {cook}, malzemeyi eklemeden önce tango yapar gibi dramatik bir poz ver.' },
  { id: 'dn-f09', category: 'flort', mode: 'both', safeOnly: false, phase: 'mid', text: 'Aşçı Değil Aşık — {cook}, bu adımı "yemek değil, aşkımı pişiriyorum" moduyla, abartılı romantik hareketlerle yap.' },

  // ─── KATEGORİ 4: BERABER YAPIN (mid) ───
  { id: 'dn-b01', category: 'beraber', mode: 'both', safeOnly: true, phase: 'mid', text: 'Dört El — Bu adımı ikiniz birlikte yapın: {challenger} malzemeyi tutar, {cook} işler.' },
  { id: 'dn-b02', category: 'beraber', mode: 'both', safeOnly: false, phase: 'mid', text: 'Tadım Töreni — {cook}, {challenger}\'a gözleri kapalıyken bir tadımlık ver, tahmin etsin.' },
  { id: 'dn-b03', category: 'beraber', mode: 'both', safeOnly: true, phase: 'mid', text: 'Ayna Oyunu — {challenger}, {cook}\'un yaptığı her hareketi aynısıyla taklit etsin (30 saniye).' },
  { id: 'dn-b04', category: 'beraber', mode: 'both', safeOnly: true, phase: 'mid', text: 'Mini Dans Molası — Karıştırma arasında 15 saniyelik beraber dans molası verin. Müzik yoksa mırıldanın.' },
  { id: 'dn-b05', category: 'beraber', mode: 'both', safeOnly: false, phase: 'mid', text: 'Şef ve Sağ Kolu — Bu adımda {challenger} "yardımcı şef" olur: {cook} komut verir, {challenger} uygular.' },
  { id: 'dn-b06', category: 'beraber', mode: 'both', safeOnly: false, phase: 'mid', text: 'Koklama Testi — {cook}, {challenger}\'a bir baharatı koklatıp tahmin ettirsin.' },
  { id: 'dn-b07', category: 'beraber', mode: 'both', safeOnly: false, phase: 'mid', text: 'Beraber Sayalım — Karıştırma gereken bu adımda ikiniz birlikte yüksek sesle 20\'ye kadar sayın, her sayıda ses tonu değişsin.' },
  { id: 'dn-b08', category: 'beraber', mode: 'both', safeOnly: true, phase: 'mid', text: 'El Ele Karıştırma — {challenger}, elini {cook}\'un elinin üstüne koy, bu karıştırmayı beraber yapın.' },

  // ─── KATEGORİ 5: SORULAR & İTİRAFLAR (mid) ───
  { id: 'dn-q01', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'Ya Sen Olmasan — {cook}, {challenger} hayatında olmasaydı neyin eksik olacağını söyle.' },
  { id: 'dn-q02', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'İlk Kıskançlık — {cook}, {challenger}\'ı ilk kıskandığın anı itiraf et.' },
  { id: 'dn-q03', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'Gizli Gurur — {cook}, {challenger}\'la ilgili başkalarına övünerek anlattığın bir şeyi söyle.' },
  { id: 'dn-q04', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'Rüya Tatil — {cook}, {challenger}\'la gitmek istediğin hayalindeki tatili 20 saniyede anlat.' },
  { id: 'dn-q05', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'Değişmesin — {cook}, {challenger}\'da asla değişmesini istemediğin bir şeyi söyle.' },
  { id: 'dn-q06', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'İtiraf Vakti — {cook}, {challenger}\'ın yemeklerinden/alışkanlıklarından gizlice sevdiğin bir şeyi itiraf et.' },
  { id: 'dn-q07', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'Yeniden Seçsem — {cook}, "seni yeniden seçerdim çünkü..." cümlesini tamamla.' },
  { id: 'dn-q08', category: 'itiraf', mode: 'both', safeOnly: false, phase: 'mid', text: 'Süper Güç — {cook}, {challenger}\'ın sende yarattığı "süper gücü" anlat (örn: "yanındayken hiçbir şey zor gelmiyor").' },

  // ─── KATEGORİ 6: KÜÇÜK JESTLER (mid) ───
  { id: 'dn-j01', category: 'jest', mode: 'both', safeOnly: false, phase: 'mid', text: 'Servis Provası — {cook}, {challenger}\'a su/içecek ikram et, lüks restoran garsonu gibi servis yap.' },
  { id: 'dn-j02', category: 'jest', mode: 'both', safeOnly: true, phase: 'mid', text: 'Alın Öpücüğü Molası — {cook}, tencereyi karıştırmadan önce {challenger}\'ın alnına bir öpücük kondur.' },
  { id: 'dn-j03', category: 'jest', mode: 'both', safeOnly: true, phase: 'mid', text: 'Sarılma Şarjı — Bekleme gereken bu adımda 10 saniyelik "enerji sarılması" yapın.' },
  { id: 'dn-j04', category: 'jest', mode: 'both', safeOnly: true, phase: 'mid', text: 'El Öpme Klasiği — {cook}, eski usul beyefendi/hanımefendi tavrıyla {challenger}\'ın elini öp.' },
  { id: 'dn-j05', category: 'jest', mode: 'both', safeOnly: false, phase: 'mid', text: 'Peçete Notu — {cook}, bir peçeteye {challenger} için üç kelimelik mini not yaz ve masaya koy. Not, servise kadar saklı kalsın.' },
  { id: 'dn-j06', category: 'jest', mode: 'both', safeOnly: false, phase: 'mid', text: 'Kadeh Kaldırma — Elinizdeki bardaklarla (su bile olsa) "bize" diye kadeh kaldırın.' },

  // ─── KATEGORİ 7: KIVILCIM — Tansiyon Görevleri (late: tarifin son üçte biri) ───
  { id: 'dn-k01', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'Fısıltı Servisi — {cook}, bu adımda ne yaptığını {challenger}\'ın kulağına fısıldayarak anlat.' },
  { id: 'dn-k02', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'Mesafe Oyunu — {challenger}, {cook}\'un hemen arkasında dur ve omzunun üstünden pişirmeyi izle. {cook} bozuntuya vermeden devam etsin.' },
  { id: 'dn-k03', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: '30 Santim Kuralı — Bu adımı 30 cm mesafeden göz teması kurarak açıkla. İlk gülen kaybeder.' },
  { id: 'dn-k04', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'Yavaş Dans — Yemeğin beklediği bu adımda müziksiz 20 saniyelik yavaş dans edin.' },
  { id: 'dn-k05', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'Bu Akşamın Devamı — {cook}, "yemekten sonra planım..." cümlesini gizemli bir tonda, detay vermeden tamamla.' },
  { id: 'dn-k06', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'En Çekici — {cook}, {challenger}\'ın en çekici bulduğun özelliğini söyle — kişilik değil, fiziksel olan.' },
  { id: 'dn-k07', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'Omuz Masajı Molası — {challenger}, yemek beklerken {cook}\'a 15 saniyelik omuz masajı yap.' },
  { id: 'dn-k08', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'Parmak Kesişmesi — Malzemeyi beraber eklerken elleriniz kesişsin, kim daha uzun tutacak bakın.' },
  { id: 'dn-k09', category: 'kivilcim', mode: 'both', safeOnly: true, phase: 'late', text: 'Yasak Bakış — {cook}, bu adım boyunca {challenger}\'a hiç bakma. {challenger} dikkatini dağıtmaya çalışabilir (dokunmadan).' },
  { id: 'dn-k10', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'İtiraf: İlk Çekim — {cook}, {challenger}\'da seni ilk cezbeden şeyin ne olduğunu dürüstçe söyle.' },
  { id: 'dn-k11', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'Nefes Mesafesi — Tadım kaşığını {challenger}\'a uzat ama son anda geri çek, iki kez. Üçüncüde ver.' },
  { id: 'dn-k12', category: 'kivilcim', mode: 'both', safeOnly: false, phase: 'late', text: 'Kazanan Alır — 10 saniyelik bakışma düellosu: kazanan, kaybedene bu akşam için küçük bir istekte bulunma hakkı kazanır.' },

  // ─── KATEGORİ 8: SOFRA & SERVİS (finale: son adım) ───
  { id: 'dn-s01', category: 'sofra', mode: 'both', safeOnly: false, phase: 'finale', text: 'Şef Masası — {cook}, tabağı restoran sunumuyla masaya taşı ve yemeği "şefin özel menüsü" gibi tanıt.' },
  { id: 'dn-s02', category: 'sofra', mode: 'both', safeOnly: false, phase: 'finale', text: 'Mum Töreni — Masaya oturmadan önce mumu birlikte yakın (yoksa telefon feneriyle temsili), {cook} geceye bir dilek tutsun.' },
  { id: 'dn-s03', category: 'sofra', mode: 'both', safeOnly: false, phase: 'finale', text: 'Garson Anonsu — {challenger}, hayali mikrofonla "Bu akşamın özel menüsü..." anonsuyla {cook}\'u ve yemeği masaya davet et.' },
  { id: 'dn-s04', category: 'sofra', mode: 'both', safeOnly: false, phase: 'finale', text: 'İlk Lokma Ritüeli — İlk lokmayı birbirinize yedirin, sonra puanınızı sadece yüz ifadenizle (konuşmadan) anlatın.' },
  { id: 'dn-s05', category: 'sofra', mode: 'both', safeOnly: false, phase: 'finale', text: 'Gece Kapanışı — Masaya oturunca {cook}, bu geceden aklında kalacak tek anı şimdiden ilan etsin.' },
];

module.exports = { TASK_POOL_DATENIGHT };
