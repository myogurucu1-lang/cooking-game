// Challenger görev havuzu.
// category: eglence | rol | sunum | dikkat  (mobil CATEGORY_CONFIG ile uyumlu)
// mode: 'both' | 'gundelik' | 'sef'  (hangi zorlukta kullanılabilir)
// safeOnly: true → sadece bıçak/sıcak yağ/ateş içermeyen adımda verilmeli

const TASK_POOL = [
  // ─── ROL / TAKLİT ───
  { id: 'r01', category: 'rol', mode: 'both', safeOnly: false, text: 'O adımı maç spikeri gibi canlı yayında anlatarak yapma ("Ve topu... pardon soğanı alıyor!")' },
  { id: 'r02', category: 'rol', mode: 'both', safeOnly: false, text: 'Adımı haber spikeri gibi "SON DAKİKA" anonsuyla duyurup ciddi bir sesle sunma' },
  { id: 'r03', category: 'rol', mode: 'both', safeOnly: false, text: 'Yemek vlogger\'ı taklidi: "Kanalıma hoş geldiniz arkadaşlar!" diye başlayıp adımı abone kitlesine anlatma' },
  { id: 'r04', category: 'rol', mode: 'both', safeOnly: false, text: 'Adım boyunca robot sesiyle, kesik kesik konuşma ("SO-ĞAN. DOĞ-RA-NI-YOR.")' },
  { id: 'r05', category: 'rol', mode: 'both', safeOnly: false, text: 'Kullandığı malzemelerin isimlerini opera sesiyle, uzata uzata söyleme' },
  { id: 'r06', category: 'rol', mode: 'both', safeOnly: false, text: 'Adım boyunca Karadeniz ağzıyla konuşma' },
  { id: 'r07', category: 'rol', mode: 'both', safeOnly: false, text: 'Adım boyunca Ege ağzıyla, ağır sakin konuşma' },
  { id: 'r08', category: 'rol', mode: 'both', safeOnly: false, text: 'MasterChef jürisine anlatır gibi, iddialı ve teknik konuşma' },
  { id: 'r09', category: 'rol', mode: 'both', safeOnly: false, text: 'Belgesel anlatıcısı gibi kendinden üçüncü kişi olarak bahsetme ("Ve şef, doğal yaşam alanında soğana yaklaşıyor...")' },
  { id: 'r10', category: 'rol', mode: 'both', safeOnly: false, text: 'Türk sanat müziği nağmesiyle konuşma' },
  { id: 'r11', category: 'rol', mode: 'both', safeOnly: false, text: 'Navigasyon sesi gibi kendi kendine komut verme ("300 gram sonra sola dönün... salçaya ulaştınız.")' },
  { id: 'r12', category: 'rol', mode: 'both', safeOnly: false, text: 'Hava durumu sunucusu gibi tavadaki/tenceredeki durumu sunma ("Tavada yer yer sağanak kavurma bekleniyor!")' },
  { id: 'r13', category: 'rol', mode: 'both', safeOnly: false, text: 'Sevdiği bir çizgi film karakterinin sesiyle konuşarak adımı yapma' },
  { id: 'r14', category: 'rol', mode: 'both', safeOnly: false, text: 'Abartılı İtalyan şef aksanı taklidi yapma ("Mamma mia! Bu domates bellissimo!")' },
  { id: 'r15', category: 'rol', mode: 'both', safeOnly: false, text: 'Stadyum anonsçusu gibi her malzemeyi anons ederek ekleme ("Sahaya geliyooor... SOĞAAAN!")' },
  { id: 'r16', category: 'rol', mode: 'both', safeOnly: false, text: 'Spor yorumcusu gibi kendi yaptıklarını eleştirme ("Bence burada acele etti, ben olsam o salçayı daha geç koyardım.")' },

  // ─── EĞLENCE ───
  { id: 'e01', category: 'eglence', mode: 'both', safeOnly: false, text: 'O adım boyunca dans ederek çalışma' },
  { id: 'e02', category: 'eglence', mode: 'both', safeOnly: false, text: 'Yapılan yemek hakkında iki satırlık bir şarkı uydurup söyleme' },
  { id: 'e03', category: 'eglence', mode: 'both', safeOnly: false, text: 'Malzemeyi kullanmadan önce onunla duygusal bir vedalaşma sahnesi yapma ("Elveda soğan, fedakarlığını unutmayacağız.")' },
  { id: 'e04', category: 'eglence', mode: 'both', safeOnly: false, text: 'Kendine komik bir şef unvanı takıp adım boyunca kendinden öyle bahsetme ("Patates Kralı şimdi tuzu ekliyor!")' },
  { id: 'e05', category: 'eglence', mode: 'both', safeOnly: false, text: 'Her karıştırmada yüksek sesle "Mmm, şahane!" deme' },
  { id: 'e06', category: 'eglence', mode: 'both', safeOnly: false, text: 'Adım boyunca kendine tezahürat yapma' },
  { id: 'e07', category: 'eglence', mode: 'both', safeOnly: false, text: 'O adımda her cümlenin sonuna "şefim" ekleme' },
  { id: 'e08', category: 'eglence', mode: 'both', safeOnly: false, text: 'Komik sesle bir mutfak felaketi anısı anlatma (yakma, dökme, taşırma)' },
  { id: 'e09', category: 'eglence', mode: 'both', safeOnly: false, text: 'Adımı bitirince zafer pozu verip 3 saniye heykel gibi sabit kalma' },
  { id: 'e10', category: 'eglence', mode: 'both', safeOnly: false, text: 'Bir malzemeye isim takıp adım boyunca ona ismiyle hitap etme ("Domates Hanım, sıra sizde!")' },
  { id: 'e11', category: 'eglence', mode: 'both', safeOnly: false, text: 'Adımı tamamlayınca kendi reklam müziğini (jingle) uydurup mırıldanma' },
  { id: 'e12', category: 'eglence', mode: 'both', safeOnly: false, text: 'Yemeğin tarihçesini tamamen uyduruk bir hikayeyle anlatma ("Bu yemek ilk kez 1453\'te, kuşatma sırasında...")' },
  { id: 'e13', category: 'eglence', mode: 'both', safeOnly: false, text: 'O adımda her cümleye "Efsane!" diye başlama' },
  { id: 'e14', category: 'eglence', mode: 'both', safeOnly: false, text: 'Mutfağı restoran gibi düşünüp hayali müşterilere seslenme ("12 numaralı masanın makarnası geliyor!")' },
  { id: 'e15', category: 'eglence', mode: 'both', safeOnly: false, text: 'Tarifin adını rap ritminde söyleme' },
  { id: 'e16', category: 'eglence', mode: 'both', safeOnly: false, text: 'Adım sırasında ara ara "İşte bu!" deyip parmak şıklatma' },
  { id: 'e17', category: 'eglence', mode: 'both', safeOnly: false, text: 'Yaptığı işi tekerleme hızında üç kez anlatmaya çalışma' },
  { id: 'e18', category: 'eglence', mode: 'both', safeOnly: false, text: 'Mutfak aletlerine takım arkadaşı gibi taktik verme ("Tava, sen ısın! Kaşık, hazır ol!")' },
  { id: 'e19', category: 'eglence', mode: 'both', safeOnly: false, text: 'Yemek bittiğinde alacağı ödülün teşekkür konuşmasını şimdiden prova etme ("Bu ödülü anneme borçluyum...")' },
  { id: 'e20', category: 'eglence', mode: 'both', safeOnly: false, text: 'Her malzeme ekleyişinde sihirbaz edasıyla "Ve... muhteşem!" deme' },

  // ─── SUNUM ───
  { id: 's01', category: 'sunum', mode: 'sef', safeOnly: false, text: 'Sunum: tabakta boşluk bırakıp yükseklik vererek jüriye sunar gibi anlatma' },
  { id: 's02', category: 'sunum', mode: 'both', safeOnly: false, text: 'Yemeğe lüks restoran menüsü ismi ve reklam sloganı uydurma ("Anadolu Esintisi: Bir lokmada tatil!")' },
  { id: 's03', category: 'sunum', mode: 'sef', safeOnly: false, text: 'Servisten önce yemeği 15 saniyelik resmi bir takdim konuşmasıyla sunma' },
  { id: 's04', category: 'sunum', mode: 'both', safeOnly: false, text: 'Tabağı müzayede sunucusu gibi açık artırmaya çıkarma ("Bu eser için 100 lira veren?! 100 lira-bir, 100 lira-iki!")' },
  { id: 's05', category: 'sunum', mode: 'both', safeOnly: false, text: 'Yemeğe 5 yıldızlı restoran fiyatı biçip neden o kadar ettiğini ciddi ciddi açıklama' },
  { id: 's06', category: 'sunum', mode: 'sef', safeOnly: false, text: 'Garson rolüne geçip tabağı masaya servis ederken yemeği abartılı övme' },
  { id: 's07', category: 'sunum', mode: 'sef', safeOnly: false, text: 'Yemeğe puan verecek hayali jüri üyelerini tek tek tanıtma ("Sağımda, dünyaca ünlü eleştirmen...")' },

  // ─── DİKKAT / BECERİ ───
  { id: 'd01', category: 'dikkat', mode: 'both', safeOnly: false, text: 'O adımdaki bir işi ters (kullanmadığı) eliyle yapma' },
  { id: 'd02', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Bir adımı baştan sona tek elle yapma' },
  { id: 'd03', category: 'dikkat', mode: 'both', safeOnly: true, text: '10 saniye gözleri kapalı karıştırma' },
  { id: 'd04', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Adım boyunca bir kelime yasağı koyma (örn. "tuz" demek yasak; derse kısa bir şarkı söyler)' },
  { id: 'd05', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Adım boyunca hiç "ben" dememe (derse kendine yeni bir kural daha eklenir)' },
  { id: 'd06', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Her karıştırmayı yüksek sesle sayarak yapma ("Bir! İki! Üç!")' },
  { id: 'd07', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Adım boyunca sorulara sadece "evet" ya da "hayır" ile cevap verme' },
  { id: 'd08', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Karıştırırken ağzıyla ritim tutturup tempoya uyma' },
  { id: 'd09', category: 'dikkat', mode: 'both', safeOnly: true, text: 'Adımı bitirene kadar gülmemeye çalışma (Challenger güldürmeye çalışabilir!)' },
  { id: 'd10', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Her aldığı malzemenin yerini yüksek sesle ilan etme ("Tuz, dolaptan tezgaha transfer oluyor!")' },
  { id: 'd11', category: 'dikkat', mode: 'both', safeOnly: false, text: 'Challenger\'ın seçeceği alakasız üç kelimeyi adım boyunca cümle içinde kullanmaya çalışma' },
];

module.exports = { TASK_POOL };
