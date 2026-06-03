# curosoftai_v2

Bu depo, `curosoftai` markasi icin hazirlanan ASP.NET Core MVC tabanli web sitesi projesidir. Mevcut haliyle site; hizmetler, cozumler, AI cozumleri, projeler, hakkimizda, blog ve iletisim sayfalarindan olusan statik icerikli, animasyon agirlikli bir kurumsal web deneyimi sunar.

Bu README, 2026-06-03 tarihinde depodaki dosyalar okunarak ve yerel build/route kontrolu yapilarak hazirlanmistir.

## Dogrulanmis Mevcut Durum

- `dotnet build` basarili calisti.
- Build sonucu: `0` uyari, `0` hata.
- Yerel testte `http://localhost:5261` uzerinden ana sayfa ve mevcut sayfa rotalari `200` dondu.
- Proje `.NET 8` hedefler: `net8.0`.
- Kok dizinde mevcut durumda ana `README.md` yoktu; bu dosya yeni olusturuldu.

Yerelde `200` dondugu dogrulanan rotalar:

| Rota | Sayfa |
| --- | --- |
| `/` | Ana sayfa |
| `/Home` | Ana sayfa |
| `/Home/Privacy` | Varsayilan privacy sayfasi |
| `/Services` | Hizmetler |
| `/Solutions` | Cozum merkezi |
| `/Solutions/BrandWeb` | Marka ve Web Deneyimi |
| `/Solutions/OperationalSoftware` | Operasyonel Yazilim Sistemleri |
| `/Solutions/ProcessAutomation` | Akilli Surec Otomasyonu |
| `/Solutions/DataDecision` | Veri ve Karar Destek |
| `/Solutions/EcommercePortals` | E-Ticaret ve Musteri Portallari |
| `/AiSolutions` | AI Cozumler |
| `/Project` | Projeler |
| `/About` | Hakkimizda |
| `/Blog` | Blog, yakinda sayfasi |
| `/Contact` | Iletisim |

## Teknoloji ve Mimari

- Framework: ASP.NET Core MVC
- Target framework: `.NET 8` / `net8.0`
- Dil: C# ve Razor
- Frontend: Razor view'lar, sayfaya ozel CSS, vanilla JavaScript
- Global animasyon kutuphanesi: GSAP `3.12.5` ve ScrollTrigger, CDN uzerinden yuklenir
- AI cozumleri sayfasi: Three.js `0.170.0`, import map ve ESM CDN uzerinden yuklenir
- Fontlar: Google Fonts uzerinden Inter, Instrument Serif ve AI sayfasinda Space Grotesk
- Veritabani, API endpoint'i, auth sistemi, CMS veya admin panel bu repoda mevcut degil
- Tek model dosyasi `Models/ErrorViewModel.cs`; uygulama verileri controller/view icinde statik olarak tutuluyor

`Program.cs` mevcut pipeline'i:

- `AddControllersWithViews()`
- Development disindaki ortamlarda `/Home/Error` exception handler
- Development disindaki ortamlarda HSTS
- HTTPS yonlendirme
- Static files
- Routing
- Authorization middleware
- Varsayilan route: `{controller=Home}/{action=Index}/{id?}`

## Calistirma

Gereken ana arac: `.NET 8 SDK`.

```bash
dotnet restore
dotnet build
dotnet run --urls http://localhost:5261
```

Launch profile'lari `Properties/launchSettings.json` icinde:

| Profil | URL |
| --- | --- |
| `http` | `http://localhost:5261` |
| `https` | `https://localhost:7246;http://localhost:5261` |
| `IIS Express` | `http://localhost:3644`, SSL port `44398` |

## Proje Yapisi

```text
Controllers/                 MVC controller dosyalari
Models/                      ErrorViewModel
Views/                       Razor view dosyalari
Views/Shared/                Layout, error, coming soon ve validation partial dosyalari
wwwroot/css/                 Global ve sayfaya ozel stiller
wwwroot/js/                  Global ve sayfaya ozel JavaScript dosyalari
wwwroot/images/projects/     Projeler sayfasi gorselleri
wwwroot/images/solutions/    Cozumler sayfasi gorselleri
wwwroot/lib/                 Bootstrap, jQuery ve validation kutuphaneleri
Properties/launchSettings.json
appsettings.json
appsettings.Development.json
curosoftai_v2.csproj
sirket_girisim_memory_v0_1.md
```

## Controller ve View Envanteri

| Controller | Action | View | Not |
| --- | --- | --- | --- |
| `HomeController` | `Index` | `Views/Home/Index.cshtml` | Ana sayfa |
| `HomeController` | `Privacy` | `Views/Home/Privacy.cshtml` | Varsayilan ASP.NET privacy metni |
| `HomeController` | `Error` | `Views/Shared/Error.cshtml` | Varsayilan hata sayfasi, `ErrorViewModel` kullanir |
| `ServicesController` | `Index` | `Views/Services/Index.cshtml` | Hizmetler sayfasi |
| `SolutionsController` | `Index` | `Views/Solutions/Index.cshtml` | Cozum merkezi |
| `SolutionsController` | `BrandWeb` | `Views/Solutions/BrandWeb.cshtml` | Marka ve web deneyimi detay sayfasi |
| `SolutionsController` | `OperationalSoftware` | `Views/Solutions/OperationalSoftware.cshtml` | Operasyonel yazilim detay sayfasi |
| `SolutionsController` | `ProcessAutomation` | `Views/Solutions/ProcessAutomation.cshtml` | Surec otomasyonu detay sayfasi |
| `SolutionsController` | `DataDecision` | `Views/Solutions/DataDecision.cshtml` | Veri ve karar destek detay sayfasi |
| `SolutionsController` | `EcommercePortals` | `Views/Solutions/EcommercePortals.cshtml` | E-ticaret ve portal detay sayfasi |
| `AiSolutionsController` | `Index` | `Views/AiSolutions/Index.cshtml` | Three.js destekli AI cozumleri sayfasi |
| `ProjectController` | `Index` | `Views/Project/Index.cshtml` | Projeler, `BodyClass = projects-page` |
| `AboutController` | `Index` | `Views/About/Index.cshtml` | Hakkimizda/hikaye sayfasi |
| `BlogController` | `Index` | `Views/Blog/Index.cshtml` | `_ComingSoon` partial'i ile yakinda sayfasi |
| `ContactController` | `Index` | `Views/Contact/Index.cshtml` | Iletisim sayfasi, on yuz form validasyonu |

## Sayfalarin Mevcut Icerigi

### Ana Sayfa

`Views/Home/Index.cshtml` ve `wwwroot/js/home.js` kullanilir.

- Hero bolumunde `2026 için yeni projeler` metni ve yazilim/otomasyon/yapay zeka odakli ana mesaj var.
- Uc hizmet karti var: kurumsal web sitesi, yapay zeka asistanlari, ozel yazilim gelistirme.
- `mvp-showcase` bolumu, kaynakli dokuman yanitlari ureten AI firma asistani fikrini gosterir.
- Demo panelinde tamamen on yuzde calisan, scriptli bir sohbet akisi var.
- Calisma prensibi bolumunde 4 fazli surec var: Kesif & Analiz, Mimari & Tasarim, Gelistirme & Test, Teslim & Destek.
- Alt CTA kullaniciyi iletisim sayfasina yonlendirir.

### Hizmetler

`Views/Services/Index.cshtml`, `wwwroot/css/services.css` ve `wwwroot/js/services.js` kullanilir.

- Bes hizmet alani listelenir:
  - Kurumsal web ve dijital deneyim
  - Ozel yazilim gelistirme
  - AI entegrasyonu ve otomasyon
  - Urun stratejisi ve teknik danismanlik
  - Bakim, izleme ve surekli iyilestirme
- Teslimat kalitesi bolumunde 4 standart var.
- Calisma modeli bolumunde 5 adimli surec var: Kesif, Mimari, Tasarim ve gelistirme, Test ve yayin, Bakim.

### Cozum Merkezi

`Views/Solutions/Index.cshtml`, `wwwroot/css/solutions.css` ve `wwwroot/js/solutions.js` kullanilir.

Alti cozum karti var:

- AI Cozumleri
- Marka ve Web Deneyimi
- Operasyonel Yazilim Sistemleri
- Akilli Surec Otomasyonu
- Veri ve Karar Destek
- E-Ticaret ve Musteri Portallari

Bu sayfadaki kart gorselleri `wwwroot/images/solutions/` altindaki `.jpg` dosyalarina baglidir.

### AI Cozumler

`Views/AiSolutions/Index.cshtml`, `wwwroot/css/ai-solutions.css` ve `wwwroot/js/ai-solutions.js` kullanilir.

- Sayfa body class'i: `ai-solutions-page`.
- Full-screen canvas uzerinde Three.js parcacik sahnesi render edilir.
- Scriptte normal modda `30000`, reduced-motion modda `14000` parcacik kullanilir.
- GSAP ScrollTrigger ile 6 asamali scrollytelling akis vardir:
  - Giris
  - Butunlesik Zeka
  - Duzen & Erisim
  - Moduler Mimari
  - Guvenlik & Izolasyon
  - Vizyon
- CTA'daki `Demo İste` linki `mailto:ensarcuroglu19@gmail.com` adresine gider.
- Sayfa Three.js'i CDN import map ile yukler.

### Cozum Detay Sayfalari

Her detay sayfasi statik Razor icerigi, sayfaya ozel CSS ve GSAP tabanli animasyon/parallax script'i kullanir.

| Sayfa | CSS | JS |
| --- | --- | --- |
| Marka ve Web Deneyimi | `wwwroot/css/brandweb.css` | `wwwroot/js/brandweb.js` |
| Operasyonel Yazilim Sistemleri | `wwwroot/css/operationalsoftware.css` | `wwwroot/js/operationalsoftware.js` |
| Akilli Surec Otomasyonu | `wwwroot/css/processautomation.css` | `wwwroot/js/processautomation.js` |
| Veri ve Karar Destek | `wwwroot/css/datadecision.css` | `wwwroot/js/datadecision.js` |
| E-Ticaret ve Musteri Portallari | `wwwroot/css/ecommerceportals.css` | `wwwroot/js/ecommerceportals.js` |

Bu sayfalardaki yuzde, skor, artis, hiz, uptime ve benzeri degerler statik pazarlama metinleridir; uygulama tarafindan olculen runtime metrikleri degildir.

### Projeler

`Views/Project/Index.cshtml`, `wwwroot/css/project.css` ve `wwwroot/js/project.js` kullanilir.

Proje verileri view icindeki inline `projects` dizisinde tutulur; veritabani veya ayri model yoktur.

Mevcut uc proje:

| Proje | Kategori | Gorsel |
| --- | --- | --- |
| AI Destekli Depo Yonetim Sistemi (WMS) | Depo & Lojistik, Yapay Zeka, Simulasyon | `wwwroot/images/projects/depo-yonetim-sistemi.jpg` |
| Ozbektasogullari Insaat Kurumsal Web Platformu | Kurumsal Web Sitesi, Dijital Altyapi | `wwwroot/images/projects/ozbektasogullari-kurumsal.jpg` |
| EduMind.AI: Akilli Ogrenci Performans Kocu | Egitim Teknolojileri, Yapay Zeka, Bilgisayarli Goru | `wwwroot/images/projects/ogrenci-performans-tahmin.jpg` |

### Hakkimizda

`Views/About/Index.cshtml`, `wwwroot/css/about.css` ve `wwwroot/js/about.js` kullanilir.

- Hero bolumunde `EST. 2026` ve kurumsal hikaye mesaji var.
- Story bolumunde teknoloji, verimlilik ve yapay zeka anlatimi var.
- Manifesto bolumunde 4 kart var.
- Desktop'ta manifesto alani yatay scroll/pin animasyonu kullanir; mobilde dikey listeye duser.
- CTA ile iletisim sayfasina gidilir.

### Blog

`Views/Blog/Index.cshtml` su anda blog yazisi listelemez.

- `Views/Shared/_ComingSoon.cshtml` partial'i kullanilir.
- Metin: `Teknik notlarımız yolda.`
- Kullaniciya ana sayfaya donme ve hakkimizda sayfasina gitme linkleri sunulur.

### Iletisim

`Views/Contact/Index.cshtml`, `wwwroot/css/contact.css` ve `wwwroot/js/contact.js` kullanilir.

- Gorunen e-posta: `hello@curosoftai.com`
- Lokasyon metni: `Remote & Worldwide`
- Yerel saat `Europe/Istanbul` timezone'u ile on yuzde her saniye guncellenir.
- Sosyal linkler `LinkedIn`, `GitHub`, `X (Twitter)` olarak gorunur fakat `href="#"` placeholder durumundadir.
- `15 dakikalık tanışma` linki de `href="#"` placeholder durumundadir.
- Form alanlari:
  - Ad Soyad
  - E-posta
  - Sirket / Marka
  - Hizmet secimi: Kurumsal Web, Ozel Yazilim, Yapay Zeka & AI
  - Mesaj
- Form submit'i backend'e gitmez. JavaScript, zorunlu alanlari ve e-posta formatini kontrol eder; basarili durumda `setTimeout` ile simule edilmis basari mesaji gosterir.

### Privacy ve Error

- `Views/Home/Privacy.cshtml` varsayilan ASP.NET privacy sablon metnini tasir.
- `Views/Shared/Error.cshtml` varsayilan ASP.NET hata sablon metnini tasir.
- Privacy sayfasi ana navigasyonda veya footer'da linkli degildir; rota olarak calisir.

## Layout ve Navigasyon

`Views/Shared/_Layout.cshtml` tum ana sayfalarda kullanilir.

- HTML dili `tr`.
- Sayfa title formati: `@ViewData["Title"] - curosoftai`
- Header'da logo: `curosoftai.`
- Ana navigasyon:
  - Ana Sayfa
  - Hizmetler
  - Cozumler
  - Projeler
  - Hakkimizda
  - Blog
  - Iletisim CTA
- Aktif nav class'i mevcut controller'a gore hesaplanir.
- `Solutions` ve `AiSolutions` controller'lari Cozumler nav item'ini aktif yapar.
- Footer'da Cozumler ve Studyo link gruplari vardir.
- Footer yili `DateTime.Now.Year` ile dinamik basilir.
- Global CSS: `wwwroot/css/layout.css`
- Global JS: `wwwroot/js/layout.js`

`layout.js` davranislari:

- Scroll durumuna gore header class degisimi
- Mobil menu ac/kapat
- Sayfa yukleme progress bari
- Nav hover indicator
- GSAP varsa header giris animasyonu

## Statik Varliklar

### CSS

Mevcut CSS dosyalari:

- `about.css`
- `ai-solutions.css`
- `brandweb.css`
- `coming-soon.css`
- `contact.css`
- `datadecision.css`
- `ecommerceportals.css`
- `home.css`
- `home-alternative.css`
- `layout.css`
- `operationalsoftware.css`
- `processautomation.css`
- `project.css`
- `services.css`
- `site.css`
- `solutions.css`

`site.css` ve `home-alternative.css` mevcut dosya olarak durur; mevcut layout/view akisi icinde dogrudan yuklenmiyor.

### JavaScript

Mevcut JS dosyalari:

- `about.js`
- `ai-solutions.js`
- `brandweb.js`
- `contact.js`
- `datadecision.js`
- `ecommerceportals.js`
- `home.js`
- `home-alternative.js`
- `layout.js`
- `operationalsoftware.js`
- `processautomation.js`
- `project.js`
- `services.js`
- `site.js`
- `solutions.js`

`site.js` ve `home-alternative.js` mevcut dosya olarak durur; mevcut layout/view akisi icinde dogrudan yuklenmiyor.

### Gorseller

`wwwroot/images/projects/`:

- `depo-yonetim-sistemi.jpg`
- `ogrenci-performans-tahmin.jpg`
- `ozbektasogullari-kurumsal.jpg`
- `README.md`

`wwwroot/images/solutions/`:

- `ai-cozumleri.jpg`
- `eticaret-musteri-portali.jpg`
- `marka-web-deneyimi.jpg`
- `operasyonel-yazilim-sistemleri.jpg`
- `surec-otomasyonu.jpg`
- `veri-karar-destek.jpg`
- `README.md`

Kok static varlik:

- `wwwroot/favicon.ico`

## Yerel Kutuphaneler

`wwwroot/lib/` altinda su kutuphaneler bulunur:

- Bootstrap
- jQuery
- jQuery Validation
- jQuery Validation Unobtrusive

Mevcut `_Layout.cshtml` Bootstrap veya jQuery dosyalarini global olarak yuklemez. `_ValidationScriptsPartial.cshtml` validation script'lerini referanslar, fakat mevcut view'larda bu partial render edilmiyor.

## Strateji / Hafiza Dokumani

Kok dizinde `sirket_girisim_memory_v0_1.md` dosyasi vardir.

- Baslik: `Şirket Girişimi Hafıza Dokümanı`
- Durum: `initial-strategy`
- Olusturma ve guncelleme tarihi: `2026-05-19`
- Owner: `Ensar Sami Curoğlu`
- Amac: AI destekli yazilim ve urun gelistirme girisiminin strateji, MVP, marka ve agent memory notlarini tutmak

Bu dosya web uygulamasinin calisma zamani icin gerekli bir kod dosyasi degildir; stratejik/proje hafizasi dokumanidir.

## Mevcut Durumda Olmayanlar

Bu repoda su anda asagidaki parcalar yoktur:

- Veritabani baglantisi
- Entity/model katmani, servis katmani veya repository katmani
- API controller veya JSON endpoint
- Server-side iletisim formu gonderimi
- E-posta/SMTP entegrasyonu
- Admin panel veya CMS
- Blog yazisi veri modeli veya blog detay sayfalari
- Auth, kullanici girisi, rol veya yetkilendirme kurgusu
- Otomatik test projesi
- CI/CD tanimi
- Dockerfile veya docker-compose
- Deployment dokumani
- Ozellestirilmis gizlilik politikasi

## Bilinen Placeholder ve Tamamlanmamis Alanlar

- Blog sayfasi `coming soon` durumunda.
- Iletisim formu gercek gonderim yapmiyor; basari durumu on yuzde simule ediliyor.
- Iletisim sayfasindaki sosyal medya linkleri `#`.
- Iletisim sayfasindaki takvim/tanisma linki `#`.
- `Views/Home/IndexAlternative.cshtml` dosyasi bos; `HomeController` icinde buna karsilik gelen action yok.
- `Views/Home/Privacy.cshtml` varsayilan sablon metni tasiyor.
- `Views/Shared/Error.cshtml` varsayilan sablon metni tasiyor.
- Bazi sayfa script'leri GSAP'in global olarak yuklenmesine dogrudan baglidir; GSAP CDN erisimi olmazsa bu sayfalardaki animasyonlar beklenen sekilde calismayabilir.
- AI cozumleri sayfasi Three.js'i CDN uzerinden yukler; CDN erisimi olmazsa parcacik sahnesi calismaz.

## Dogrulama Komutlari

Bu README hazirlanirken kullanilan ana dogrulama komutlari:

```bash
dotnet build
dotnet run --no-build --urls http://localhost:5261
```

Yerel sunucu uzerinde `Invoke-WebRequest` ile ana sayfalarin HTTP durum kodlari kontrol edildi.
