# API Gereksinimleri Raporu
## Road Accident Risk Predictor - Otomatik Veri Toplama

**Tarih:** 2025-10-30
**Proje:** Road Accident Risk Predictor
**Amaç:** Form verilerinin API'ler üzerinden otomatik çekilebilmesi için gerekli entegrasyonlar

---

## Mevcut Durum

### Aktif API'ler

| API | Elde Edilen Veriler | Durum |
|-----|---------------------|-------|
| **OpenWeatherMap API** | • Hava durumu (weather_condition)<br>• Sıcaklık (temperature)<br>• Nem (humidity)<br>• Görüş mesafesi (visibility)<br>• Rüzgar hızı (wind_speed) | ✅ Aktif ve çalışıyor |
| **Cihaz Saati** | • Saat (hour_of_day)<br>• Gün (day_of_week)<br>• Ay (month)<br>• Yoğun saat tespiti (is_rush_hour) | ✅ Otomatik çekiliyor |

**Kapsam:** 21+ parametrenin 9 tanesi otomatik olarak çekiliyor (%43 otomasyon)

---

## Otomatik Çekilebilecek Veriler İçin Gerekli API'ler

### 1. Trafik & Yol Verileri (Google Maps Platform)

| API | Elde Edilebilecek Form Verileri | Kullanım Amacı | Öncelik |
|-----|--------------------------------|----------------|---------|
| **Directions API** | • Trafik yoğunluğu (traffic_density)<br>• Ortalama hız (average_speed)<br>• Tahmini araç sayısı (vehicle_count)<br>• Yol tipi (road_type)<br>• Şehir/kırsal (urban_rural) | Başlangıç ve varış noktası arasındaki rota üzerinde gerçek zamanlı trafik durumu, hız ve yol tipi analizi | 🔴 Yüksek |
| **Roads API** | • Hız limiti (speed_limit)<br>• Yol tipi (road_type)<br>• Şerit sayısı tahmini (number_of_lanes) | GPS koordinatlarına göre yol özellikleri ve metadata (hız limiti, yol sınıflandırması) | 🟡 Orta |
| **Traffic Model API** | • Gelecek trafik yoğunluğu (traffic_density)<br>• Tahmini araç sayısı (vehicle_count) | Gelecekteki trafik durumu tahminleri (planlanan yolculuklar için) | 🟢 Düşük |
| **Distance Matrix API** | • Çoklu rotalar arası trafik karşılaştırması<br>• Alternatif rota analizleri | Çoklu konum analizi ve karşılaştırma | 🟢 Düşük |

**Not:** Directions API tek başına trafik ve yol verilerinin %70'ini karşılayabilir.

---

### 2. Konum & Bağlam Verileri (Google Maps Platform)

| API | Elde Edilebilecek Form Verileri | Kullanım Amacı | Öncelik |
|-----|--------------------------------|----------------|---------|
| **Places API** | • Okul bölgesi (school_zone)<br>• İnşaat bölgesi (construction_zone)<br>• Kavşak tipi (intersection_type)<br>• Şehir/kırsal (urban_rural) | Koordinat etrafındaki özel bölgelerin (okul, inşaat, kavşak) tespiti ve sınıflandırması | 🟡 Orta |
| **Geocoding API** | • Adres → Koordinat<br>• Koordinat → Adres | Kullanıcı tarafından girilen adreslerin koordinatlara dönüştürülmesi | 🟡 Orta |
| **Geolocation API** | • Mevcut konum koordinatları | WiFi ve baz istasyonları kullanarak GPS olmadan konum tespiti | 🟢 Düşük |

---

### 3. Yol Durumu & Çevre Verileri

| API | Elde Edilebilecek Form Verileri | Kullanım Amacı | Öncelik |
|-----|--------------------------------|----------------|---------|
| **Yol Durumu API'si**<br>(Özel/Kamu Servisleri) | • Yol durumu (road_condition)<br>• Asfalt kalitesi<br>• Bakım/tamir durumu | Yol yüzeyinin fiziksel durumu hakkında bilgi (çukur, tamir, kaplama kalitesi). Genellikle belediye/karayolları servisleri tarafından sağlanır. | 🔴 Yüksek<br>(ama zor) |

**Not:** Yol durumu için standart bir global API bulunmuyor. Bölgesel kamu servisleri veya özel hizmetler (TomTom, HERE Maps) gerekebilir.

---

### 4. Özel Takvim & Tatil Verileri

| API | Elde Edilebilecek Form Verileri | Kullanım Amacı | Öncelik |
|-----|--------------------------------|----------------|---------|
| **Holiday API**<br>(Calendarific, Nager.Date vb.) | • Tatil günü (is_holiday) | Ülke/bölgeye özel resmi tatil günlerinin tespiti | 🟢 Düşük |

---

## Manuel Kalması Gereken Veriler

Aşağıdaki veriler **API ile otomatik çekilemez** veya **sensör/cihaz entegrasyonu** gerektirir:

| Kategori | Veri | Neden Manuel? | Olası Çözüm |
|----------|------|---------------|-------------|
| **Sürücü Durumu** | Alkol tüketimi (alcohol_consumption) | Kişisel sağlık verisi, alkol sensörü gerektirir | Akıllı breathalyzer cihazı (IoT) |
| | Alkol detayı (alcohol_details) | Kullanıcı beyanı | - |
| | Sürücü yorgunluğu (driver_fatigue) | Kişisel durum, biometrik sensör gerektirir | Wearable cihaz (kalp atışı, göz takibi) |
| | Sürücü deneyimi (driver_experience) | Kullanıcı profil bilgisi | Kullanıcı hesabından çekilebilir |
| **Araç Güvenliği** | Emniyet kemeri (seatbelt_usage) | Araç içi sensör gerektirir | OBD-II cihazı / Araç CAN Bus |
| | Araç bakım kontrolü (vehicle_maintenance_check) | Araç sensör verisi | OBD-II cihazı / Araç servis kayıtları API |

**IoT/Cihaz Entegrasyonu ile Otomasyon:**
- **OBD-II Bluetooth Adaptörü:** Emniyet kemeri, motor durumu, hız gibi araç verilerini sağlayabilir
- **Akıllı Saat/Bileklik:** Kalp atışı, stres seviyesi üzerinden yorgunluk tahmini yapılabilir
- **Breathalyzer IoT Cihazı:** Bluetooth üzerinden alkol seviyesi ölçümü

---

## Önerilen API Entegrasyon Stratejisi

### Minimum Paket (Hızlı Başlangıç)

**Gerekli API'ler:**
1. ✅ OpenWeatherMap API (mevcut)
2. ➕ Google Maps **Directions API** (trafik + yol bilgisi)
3. ➕ Google Maps **Places API** (çevre bölgesi tespiti)

**Beklenen Otomasyon:** %70-75
**Maliyet:** ~$200-300/ay (orta kullanım için)
**Geliştirme Süresi:** 1-2 hafta

---

### Gelişmiş Paket (Tam Otomasyon)

**Gerekli API'ler:**
1. ✅ OpenWeatherMap API (mevcut)
2. ➕ Google Maps **Directions API**
3. ➕ Google Maps **Places API**
4. ➕ Google Maps **Roads API** (hız limiti)
5. ➕ Google Maps **Geolocation API** (otomatik konum)
6. ➕ Holiday API (Calendarific / Nager.Date)
7. ➕ Yol Durumu API (TomTom / HERE Maps / Bölgesel kamu servisi)

**Beklenen Otomasyon:** %85-90
**Maliyet:** ~$400-600/ay (orta kullanım için)
**Geliştirme Süresi:** 3-4 hafta

---

### Premium Paket (IoT + Tam Otomasyon)

Gelişmiş paket + IoT cihaz entegrasyonları:
- OBD-II Bluetooth adaptörü (araç verileri)
- Akıllı saat/bileklik (sürücü durumu)
- Breathalyzer cihazı (alkol tespiti)

**Beklenen Otomasyon:** %95-100
**Maliyet:** API maliyeti + Cihaz maliyeti (~$150-300 donanım)
**Geliştirme Süresi:** 6-8 hafta

---

## Maliyet Analizi (Google Maps Platform)

### Google Maps API Fiyatlandırması (Örnek)

| API | İlk 100K İstek/Ay | Sonraki İstekler (1000 başına) |
|-----|-------------------|--------------------------------|
| Directions API | Ücretsiz | $5 |
| Places API (Nearby Search) | Ücretsiz | $32 |
| Roads API | - | $10 |
| Geolocation API | - | $5 |

**Not:** Google Maps $200/ay ücretsiz kredi sağlıyor.

**Aylık kullanım tahmini (1000 aktif kullanıcı):**
- Directions API: ~30,000 istek → $0 (kredi dahilinde)
- Places API: ~10,000 istek → ~$320
- Roads API: ~15,000 istek → ~$150

**Toplam:** ~$270/ay (ücretsiz kredi ile birlikte ~$70/ay)

---

## Önerilen Geliştirme Yol Haritası

### Faz 1: Trafik Entegrasyonu (Yüksek Öncelik)
**Süre:** 1-2 hafta
- [ ] Google Maps Directions API entegrasyonu
- [ ] Trafik yoğunluğu, ortalama hız, yol tipi çekimi
- [ ] Forma otomatik doldurma butonu eklenmesi

**Kazanç:** +5 parametre otomasyonu (%67 otomasyon)

---

### Faz 2: Konum Bağlamı (Orta Öncelik)
**Süre:** 1 hafta
- [ ] Google Maps Places API entegrasyonu
- [ ] Okul bölgesi, inşaat bölgesi, kavşak tipi tespiti
- [ ] Geocoding entegrasyonu (adres → koordinat)

**Kazanç:** +3 parametre otomasyonu (%81 otomasyon)

---

### Faz 3: Yol Özellikleri (Orta Öncelik)
**Süre:** 1 hafta
- [ ] Google Maps Roads API entegrasyonu
- [ ] Hız limiti ve şerit sayısı tahmini
- [ ] Yol durumu API araştırması (bölgesel servisler)

**Kazanç:** +2 parametre otomasyonu (%90 otomasyon)

---

### Faz 4: Ek Özellikler (Düşük Öncelik)
**Süre:** 1 hafta
- [ ] Holiday API entegrasyonu (tatil günü tespiti)
- [ ] Geolocation API (otomatik konum)
- [ ] Kullanıcı profil sistemi (sürücü deneyimi kaydı)

**Kazanç:** +2 parametre iyileştirmesi

---

## Alternatif API Sağlayıcıları

Google Maps dışında alternatifler:

| Sağlayıcı | Güçlü Yönler | Fiyat Karşılaştırması |
|-----------|--------------|----------------------|
| **TomTom Maps API** | Gelişmiş trafik verileri, Avrupa kapsama | Google'dan %20-30 daha ucuz |
| **HERE Maps API** | Yol durumu, araç filosu yönetimi | Google'a benzer fiyat |
| **Mapbox API** | Özelleştirilebilir haritalar, görselleştirme | %40-50 daha ucuz |
| **OpenStreetMap + Overpass API** | Tamamen ücretsiz, topluluk verileri | Ücretsiz (ama sınırlı trafik verisi) |

**Öneri:** Google Maps Platform güvenilirlik ve veri kalitesi açısından lider konumda. Alternatifler maliyet hassasiyeti varsa değerlendirilebilir.

---

## Sonuç ve Öneri

### Kısa Vadeli Öneri (3 ay içinde)
**Minimum Paket** ile başlayın:
- Google Maps Directions API + Places API
- %70+ otomasyon sağlanır
- Makul maliyet ($70-100/ay)
- Hızlı geliştirme (2-3 hafta)

### Orta Vadeli Hedef (6-12 ay)
**Gelişmiş Paket** ile %90 otomasyona ulaşın:
- Tüm Google Maps API'leri
- Yol durumu entegrasyonu
- Holiday API

### Uzun Vadeli Vizyon (12+ ay)
**Premium Paket** ile %100 otomasyona yaklaşın:
- IoT cihaz entegrasyonları
- Kullanıcı profil sistemi
- Makine öğrenmesi ile tahmin iyileştirme

---

**Hazırlayan:** Claude Code
**Versiyon:** 1.0
**Son Güncelleme:** 2025-10-30
