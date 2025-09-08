/**
 * Arka Plan Yöneticisi
 * Şehir değiştiğinde dinamik arka plan değişimi ve animasyonları yönetir
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
    async changeBackground(cityName, weatherCondition = '') {
        if (this.isAnimating) {
            console.log('🔄 Animasyon devam ediyor, bekleniyor...');
            return;
        }

        try {
            this.isAnimating = true;
            const imageUrl = await this.getCityImage(cityName, weatherCondition);
            
            if (imageUrl && imageUrl !== this.currentImageUrl) {
                await this.animateBackgroundChange(imageUrl);
                this.currentImageUrl = imageUrl;
                console.log('🖼️ Arka plan değiştirildi:', cityName);
            }
        } catch (error) {
            console.error('Arka plan değiştirme hatası:', error);
            await this.setDefaultBackground();
        } finally {
            this.isAnimating = false;
        }
    }

    /**
     * Şehir için resim URL'si al
     */
    async getCityImage(cityName, weatherCondition = '') {
        const cacheKey = cityName.toLowerCase();
        
        // Cache kontrolü
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey);
        }

        // Önce varsayılan resimleri kontrol et
        const defaultImage = this.getDefaultCityImage(cityName);
        if (defaultImage) {
            this.imageCache.set(cacheKey, defaultImage);
            return defaultImage;
        }

        // Unsplash API varsa kullan
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

        // Hiçbiri yoksa varsayılan resmi kullan
        const fallbackImage = CONFIG.DEFAULT_CITY_IMAGES.default;
        this.imageCache.set(cacheKey, fallbackImage);
        return fallbackImage;
    }

    /**
     * Varsayılan şehir resimlerinden kontrol et
     */
    getDefaultCityImage(cityName) {
        const normalizedCityName = this.normalizeCityName(cityName);
        return CONFIG.DEFAULT_CITY_IMAGES[normalizedCityName] || null;
    }

    /**
     * Şehir adını normalize et (Türkçe karakterler vs.)
     */
    normalizeCityName(cityName) {
        return cityName
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, '');
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

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Unsplash API hatası: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                // En yüksek çözünürlüklü resmi seç
                const photo = data.results[0];
                return photo.urls.regular || photo.urls.small;
            }

            return null;
        } catch (error) {
            console.error('Unsplash API hatası:', error);
            return null;
        }
    }

    /**
     * Arka plan değişim animasyonu
     */
    async animateBackgroundChange(newImageUrl) {
        return new Promise(async (resolve) => {
            // Resmi önceden yükle
            await this.preloadImage(newImageUrl);

            // Fade out animasyonu
            this.backgroundContainer.style.opacity = '0';
            this.backgroundContainer.style.transform = 'scale(1.1)';

            setTimeout(() => {
                // Resmi değiştir
                this.backgroundContainer.style.backgroundImage = `url(${newImageUrl})`;
                this.backgroundContainer.style.backgroundPosition = 'center top';

                // Fade in animasyonu
                setTimeout(() => {
                    this.backgroundContainer.style.opacity = '1';
                    this.backgroundContainer.style.transform = 'scale(1)';
                    
                    // Kayma animasyonu başlat
                    setTimeout(() => {
                        this.startScrollingAnimation();
                        resolve();
                    }, 500);
                }, 100);
            }, 750);
        });
    }

    /**
     * Resmi önceden yükle
     */
    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Resim yüklenemedi'));
            img.src = url;
        });
    }

    /**
     * Video gibi kayma animasyonu
     */
    startScrollingAnimation() {
        // Mevcut animasyonu temizle
        this.backgroundContainer.style.animation = 'none';
        
        // Kısa gecikme sonrası yeni animasyonu başlat
        setTimeout(() => {
            this.backgroundContainer.style.animation = `backgroundScroll ${CONFIG.APP_SETTINGS.ANIMATION_DURATION * 4}ms ease-in-out infinite alternate`;
        }, 100);
    }

    /**
     * Varsayılan arka planı ayarla
     */
    async setDefaultBackground() {
        const defaultImage = CONFIG.DEFAULT_CITY_IMAGES.default;
        await this.animateBackgroundChange(defaultImage);
    }

    /**
     * Hava durumuna göre arka plan filtresi uygula
     */
    applyWeatherFilter(weatherCondition) {
        const filters = {
            'Rain': 'brightness(0.7) contrast(1.1) saturate(0.8)',
            'Drizzle': 'brightness(0.8) contrast(1.0) saturate(0.9)',
            'Thunderstorm': 'brightness(0.5) contrast(1.3) saturate(0.7)',
            'Snow': 'brightness(1.1) contrast(0.9) saturate(0.8) hue-rotate(10deg)',
            'Mist': 'brightness(0.9) contrast(0.8) saturate(0.7) blur(1px)',
            'Fog': 'brightness(0.8) contrast(0.7) saturate(0.6) blur(2px)',
            'Clear': 'brightness(1.1) contrast(1.1) saturate(1.2)',
            'Clouds': 'brightness(0.9) contrast(1.0) saturate(0.9)'
        };

        const filter = filters[weatherCondition] || 'none';
        this.backgroundContainer.style.filter = filter;
    }

    /**
     * Animasyonu durdur
     */
    stopAnimation() {
        this.backgroundContainer.style.animation = 'none';
    }

    /**
     * Cache'i temizle
     */
    clearCache() {
        this.imageCache.clear();
        console.log('🗑️ Resim cache\'i temizlendi');
    }

    /**
     * Gece/gündüz moduna göre arka plan ayarla
     */
    applyTimeOfDayEffect(sunrise, sunset) {
        const now = new Date();
        const currentTime = now.getTime();
        
        if (sunrise && sunset) {
            const sunriseTime = sunrise.getTime();
            const sunsetTime = sunset.getTime();
            
            if (currentTime < sunriseTime || currentTime > sunsetTime) {
                // Gece modu
                this.backgroundContainer.style.filter += ' brightness(0.6) hue-rotate(200deg)';
                console.log('🌙 Gece modu aktif');
            } else {
                // Gündüz modu
                console.log('☀️ Gündüz modu aktif');
            }
        }
    }
}

// CSS animasyonu oluştur
const style = document.createElement('style');
style.textContent = `
    @keyframes backgroundScroll {
        0% {
            background-position: center top;
        }
        100% {
            background-position: center bottom;
        }
    }
`;
document.head.appendChild(style);

// Singleton instance oluştur
const backgroundManager = new BackgroundManager();