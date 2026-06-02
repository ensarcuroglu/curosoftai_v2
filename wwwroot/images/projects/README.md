# Proje Görselleri

Projeler sayfasındaki (`Views/Project/Index.cshtml`) vaka görsellerini bu klasöre koy.
View bu klasöre `~/images/projects/...` üzerinden referans veriyor; dosya adları **birebir**
aşağıdaki gibi olmalı:

| Sıra | Proje | Dosya adı |
|------|-------|-----------|
| 01 (öne çıkan / featured) | DepoPilot — AI Destekli Depo Yönetimi | `depo-yonetim-sistemi.jpg` |
| 02 | Özbektaşoğulları Kurumsal Web Sitesi | `ozbektasogullari-kurumsal.jpg` |
| 03 | EduPredict — Öğrenci Performans Tahmin & Öneri | `ogrenci-performans-tahmin.jpg` |

## Görsel önerileri

- **Yön/oran:** Yatay (landscape). İlk proje ~16:11, diğer ikisi ~4:3 kırpılır.
  `object-fit: cover` kullanıldığı için tam oran şart değil — yatay ve yeterince geniş olması yeter.
- **Çözünürlük:** En az **1400px** genişlik (retina ekranlar için 1600–2000px ideal).
- **Format:** `.jpg` veya `.webp`. (webp daha küçük dosya verir.)
- **Dosya boyutu:** Optimize et — ideal olarak **< 300 KB**.
- **İçerik:** Panel/arayüz ekran görüntüsü, mockup veya kurumsal görsel olabilir.

## Notlar

- **webp kullanırsan:** Dosya adındaki `.jpg` uzantısını `.webp` yap **ve**
  `Views/Project/Index.cshtml` içindeki ilgili `Image = "~/images/projects/....jpg"`
  satırını da güncelle.
- **Dosya adını değiştirmek istersen:** Aynı şekilde view'daki `Image` alanını da güncelle.
- Görseller eklenene kadar sayfada o kutular boş/kırık görünebilir; dosyaları koyduğunda
  otomatik gelir (ek bir işlem gerekmez).

> Bu `README.md` yalnızca kılavuzdur; sayfanın çalışmasını etkilemez, istersen silebilirsin.
