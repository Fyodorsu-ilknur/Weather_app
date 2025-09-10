/**
 * Arka Plan Yöneticisi - Hibrit Sistem
 * Türkiye şehirleri: Yerel resimler
 * Diğer ülkeler: Unsplash API
 */

class BackgroundManager {
    constructor() {
        this.backgroundContainer = document.getElementById('background-container');
        this.currentImageUrl = '';
        this.imageCache = new Map();
        this.isAnimating = false;
    }

    /**
     * Şehir için arka plan resmini değiştir
     */
    async changeBackground(cityName, weatherCondition = '', countryCode = '') {
        if (this.isAnimating) {
            console.log('🔄 Animasyon devam ediyor, bekleniyor...');
            return;
        }

        try {
            this.isAnimating = true;
            const imageUrl = await this.getCityImage(cityName, weatherCondition, countryCode);
            
            if (imageUrl && imageUrl !== this.currentImageUrl) {
                await this.smoothBackgroundTransition(imageUrl);
                this.currentImageUrl = imageUrl;
                console.log('🖼️ Arka plan değiştirildi:', cityName, countryCode ? `(${countryCode})` : '');
            }
        } catch (error) {
            console.error('Arka plan değiştirme hatası:', error);
            await this.setDefaultBackground();
        } finally {
            this.isAnimating = false;
        }
    }

    /**
     * Şehir için resim URL'si al (Hibrit sistem)
     */
    async getCityImage(cityName, weatherCondition = '', countryCode = '') {
        const cacheKey = `${cityName.toLowerCase()}_${countryCode || 'unknown'}`;
        
        // Cache kontrolü
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey);
        }

        // Türkiye şehri mi kontrol et
        if (isTurkishCity(cityName, countryCode)) {
            console.log('🇹🇷 Türkiye şehri algılandı:', cityName);
            const localImage = await this.getTurkishCityImage(cityName);
            if (localImage) {
                this.imageCache.set(cacheKey, localImage);
                return localImage;
            }
        }

        // Türkiye değilse veya yerel resim bulunamadıysa Unsplash'ten al
        console.log('🌍 Yabancı şehir veya yerel resim yok:', cityName, countryCode || 'Bilinmeyen ülke');
        
        if (CONFIG.UNSPLASH_API.KEY !== 'YOUR_UNSPLASH_ACCESS_KEY') {
            try {
                const unsplashImage = await this.fetchFromUnsplash(cityName, weatherCondition);
                if (unsplashImage) {
                    this.imageCache.set(cacheKey, unsplashImage);
                    return unsplashImage;
                }
            } catch (error) {
                console.warn('Unsplash API hatası:', error);
            }
        }

        // Hiçbiri yoksa varsayılanı kullan
        const defaultImage = CONFIG.DEFAULT_IMAGE;
        this.imageCache.set(cacheKey, defaultImage);
        return defaultImage;
    }

    /**
     * Türkiye şehirleri için yerel resim al
     */
    async getTurkishCityImage(cityName) {
        const normalizedCityName = normalizeCityName(cityName);
        
        // Özel isim eşleştirmeleri
        const cityAliases = {
            'afyonkarahisar': 'afyon',
            'kahramanmaras': 'maras',
            'sanliurfa': 'sanliurfa',
            'kirklareli': 'kirklarel'
        };
        
        const finalCityName = cityAliases[normalizedCityName] || normalizedCityName;
        const localImagePath = CONFIG.TURKEY_CITY_IMAGES[finalCityName];
        
        if (localImagePath) {
            // Resmin var olup olmadığını kontrol et
            const imageExists = await this.checkImageExists(localImagePath);
            if (imageExists) {
                console.log(`✅ Yerel resim bulundu: ${cityName} -> ${localImagePath}`);
                return localImagePath;
            } else {
                console.warn(`⚠️ Yerel resim bulunamadı: ${localImagePath}`);
            }
        }

        return null;
    }

    /**
     * Unsplash API'den resim al
     */
    async fetchFromUnsplash(cityName, weatherCondition) {
        try {
            // Arama terimi oluştur
            let query = `${cityName} ${CONFIG.UNSPLASH_API.DEFAULT_QUERY}`;
            if (weatherCondition) {
                query += ` ${weatherCondition}`;
            }

            const url = `${CONFIG.UNSPLASH_API.BASE_URL}?query=${encodeURIComponent(query)}&per_page=${CONFIG.UNSPLASH_API.PER_PAGE}&orientation=${CONFIG.UNSPLASH_API.ORIENTATION}&client_id=${CONFIG.UNSPLASH_API.KEY}`;

            console.log('🔍 Unsplash API sorgusu:', query);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Unsplash API hatası: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const photo = data.results[0];
                const imageUrl = photo.urls.regular || photo.urls.small;
                console.log('✅ Unsplash resmi alındı:', imageUrl);
                return imageUrl;
            }

            console.warn('⚠️ Unsplash\'te resim bulunamadı:', query);
            return null;
        } catch (error) {
            console.error('❌ Unsplash API hatası:', error);
            return null;
        }
    }

    /**
     * Resmin var olup olmadığını kontrol et
     */
    checkImageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
        });
    }

    /**
     * Yumuşak arka plan geçiş animasyonu
     */
    async smoothBackgroundTransition(newImageUrl) {
        return new Promise(async (resolve) => {
            // Resmi önceden yükle
            await this.preloadImage(newImageUrl);

            // Geçici div oluştur (yeni resim için)
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.top = '0';
            tempDiv.style.left = '0';
            tempDiv.style.width = '100%';
            tempDiv.style.height = '100%';
            tempDiv.style.backgroundImage = `url(${newImageUrl})`;
            tempDiv.style.backgroundSize = 'cover';
            tempDiv.style.backgroundPosition = 'center';
            tempDiv.style.backgroundRepeat = 'no-repeat';
            tempDiv.style.opacity = '0';
            tempDiv.style.transition = `opacity ${CONFIG.APP_SETTINGS.FADE_DURATION}ms ease-in-out`;
            tempDiv.style.zIndex = '-1';

            // Container'a geçici div'i ekle
            this.backgroundContainer.appendChild(tempDiv);

            // Kısa gecikme sonrası fade in başlat
            setTimeout(() => {
                tempDiv.style.opacity = '1';
                
                // Fade in tamamlandıktan sonra
                setTimeout(() => {
                    // Ana container'ın resmini değiştir
                    this.backgroundContainer.style.backgroundImage = `url(${newImageUrl})`;
                    
                    // Geçici div'i kaldır
                    this.backgroundContainer.removeChild(tempDiv);
                    
                    // Kayma animasyonunu başlat
                    this.startSmoothScrollAnimation();
                    
                    resolve();
                }, CONFIG.APP_SETTINGS.FADE_DURATION);
            }, 50);
        });
    }

    /**
     * Resmi önceden yükle
     */
    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => {
                console.warn('⚠️ Resim yüklenemedi:', url);
                resolve(); // Hata durumunda da devam et
            };
            img.src = url;
        });
    }

    /**
     * Yumuşak kayma animasyonu
     */
    startSmoothScrollAnimation() {
        // Mevcut animasyonu temizle
        this.backgroundContainer.style.animation = 'none';
        
        // Animasyonu başlat
        setTimeout(() => {
            this.backgroundContainer.classList.add('animated');
        }, 100);
    }

    /**
     * Varsayılan arka planı ayarla
     */
    async setDefaultBackground() {
        const defaultImage = CONFIG.DEFAULT_IMAGE;
        console.log('🎨 Varsayılan arka plan kullanılıyor');
        await this.smoothBackgroundTransition(defaultImage);
    }

    /**
     * Hava durumuna göre arka plan filtresi - BASİTLEŞTİRİLDİ
     */
    applyWeatherFilter(weatherCondition) {
        // Sadece basit filtreler - sınıf sistemi kaldırıldı
        const filters = {
            'Clear': 'brightness(1.05) contrast(1.1) saturate(1.1)',
            'Rain': 'brightness(0.8) contrast(1.1) saturate(0.9)',
            'Drizzle': 'brightness(0.85) contrast(1.0) saturate(0.95)',
            'Thunderstorm': 'brightness(0.6) contrast(1.2) saturate(0.8)',
            'Snow': 'brightness(1.0) contrast(0.95) saturate(0.9)',
            'Clouds': 'brightness(0.95) contrast(1.0) saturate(0.95)',
            'Mist': 'brightness(0.9) contrast(0.9) saturate(0.8)',
            'Fog': 'brightness(0.85) contrast(0.85) saturate(0.7)'
        };

        const filter = filters[weatherCondition] || 'none';
        this.backgroundContainer.style.filter = filter;
        
        console.log('🎨 Hava durumu filtresi:', weatherCondition);
    }

    /**
     * Gece/gündüz modu - BASİTLEŞTİRİLDİ
     */
    applyTimeOfDayEffect(sunrise, sunset) {
        const now = new Date();
        const currentTime = now.getTime();
        
        if (sunrise && sunset) {
            const sunriseTime = sunrise.getTime();
            const sunsetTime = sunset.getTime();
            
            if (currentTime < sunriseTime || currentTime > sunsetTime) {
                // Gece modu - sadece filtre
                const currentFilter = this.backgroundContainer.style.filter || 'none';
                this.backgroundContainer.style.filter = currentFilter + ' brightness(0.7) hue-rotate(180deg)';
                console.log('🌙 Gece modu aktif');
            } else {
                console.log('☀️ Gündüz modu aktif');
            }
        }
    }

    /**
     * Animasyonu durdur - DÜZELTME
     */
    stopAnimation() {
        this.backgroundContainer.classList.remove('animated');
        this.backgroundContainer.style.animation = 'none';
        this.backgroundContainer.style.transition = 'none';
        // Pozisyonu merkez tut
        this.backgroundContainer.style.backgroundPosition = 'center center';
        this.backgroundContainer.style.transform = 'scale(1)';
    }

    /**
     * Cache'i temizle
     */
    clearCache() {
        this.imageCache.clear();
        console.log('🗑️ Resim cache\'i temizlendi');
    }

    /**
     * Resim durumunu kontrol et
     */
    async validateTurkishCityImages() {
        console.log('🔍 Türkiye şehir resimleri kontrol ediliyor...');
        
        const results = {
            existing: [],
            missing: [],
            total: Object.keys(CONFIG.TURKEY_CITY_IMAGES).length
        };
        
        for (const [cityName, imagePath] of Object.entries(CONFIG.TURKEY_CITY_IMAGES)) {
            const exists = await this.checkImageExists(imagePath);
            
            if (exists) {
                results.existing.push(cityName);
            } else {
                results.missing.push({ city: cityName, path: imagePath });
                console.warn(`⚠️ Eksik resim: ${cityName} -> ${imagePath}`);
            }
        }
        
        console.log(`✅ Resim durumu: ${results.existing.length}/${results.total} mevcut`);
        
        if (results.missing.length > 0) {
            console.log('❌ Eksik resimler:', results.missing.map(item => item.city).join(', '));
        }
        
        return results;
    }

    /**
     * Şehir türünü belirleme
     */
    getCityType(cityName, countryCode) {
        if (isTurkishCity(cityName, countryCode)) {
            return 'turkish';
        }
        return 'foreign';
    }
}

// Singleton instance oluştur
const backgroundManager = new BackgroundManager();

// Geliştirme ortamında resim kontrolü
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Geliştirme modu algılandı');
        
        // Türkiye şehir resimlerini kontrol et
        const imageStatus = await backgroundManager.validateTurkishCityImages();
        
        // Unsplash API durumunu kontrol et
        if (CONFIG.UNSPLASH_API.KEY !== 'YOUR_UNSPLASH_ACCESS_KEY') {
            console.log('✅ Unsplash API aktif (yabancı şehirler için)');
        } else {
            console.warn('⚠️ Unsplash API tanımsız (yabancı şehirler varsayılan resimle gösterilecek)');
        }
        
        console.log(`
🌍 Hibrit Arka Plan Sistemi
============================
🇹🇷 Türkiye şehirleri: Yerel resimler (${imageStatus.existing.length}/${imageStatus.total})
🌎 Diğer ülkeler: ${CONFIG.UNSPLASH_API.KEY !== 'YOUR_UNSPLASH_ACCESS_KEY' ? 'Unsplash API' : 'Varsayılan resim'}
🎯 Cache sistemi aktif
        `);
    }
});