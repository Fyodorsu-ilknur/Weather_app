/**
 * Arka Plan Yöneticisi - Geliştirilmiş Geçiş Efekti
 * Türkiye şehirleri: Yerel resimler
 * Diğer ülkeler: Unsplash API
 */

class BackgroundManager {
    constructor() {
        this.backgroundContainer = document.getElementById('background-container');
        this.currentImageUrl = '';
        this.imageCache = new Map();
        this.isTransitioning = false; // Geçiş durumu için kontrol
    }

    /**
     * Şehir için arka plan resmini değiştirir.
     */
    async changeBackground(cityName, weatherCondition = '', countryCode = '') {
        if (this.isTransitioning) {
            console.log('🔄 Geçiş devam ediyor, yeni istek bekleniyor...');
            return;
        }

        try {
            const imageUrl = await this.getCityImage(cityName, weatherCondition, countryCode);

            if (imageUrl && imageUrl !== this.currentImageUrl) {
                this.isTransitioning = true;
                
                // 1. Yeni resmi arka planda yükle
                await this.preloadImage(imageUrl);
                
                // 2. Mevcut kayma animasyonunu durdur
                this.stopAnimation();

                // 3. Arka planı bulanıklaştır (CSS sınıfı ekleyerek)
                this.backgroundContainer.classList.add('background-loading');

                // 4. Bulanıklaştırma animasyonunun bitmesini bekle (CSS ile aynı sürede)
                setTimeout(() => {
                    // 5. Resim bulanıkken, anında yeni resmi ata
                    this.backgroundContainer.style.backgroundImage = `url(${imageUrl})`;
                    this.currentImageUrl = imageUrl;

                    // 6. Bulanıklığı kaldırarak resmi netleştir
                    this.backgroundContainer.classList.remove('background-loading');

                    // 7. Netleşme animasyonunun bitmesini bekle
                    setTimeout(() => {
                        // 8. Her şey bittiğinde, animasyonu yeniden başlat
                        this.startAnimation();
                        this.isTransitioning = false; // Geçişi bitir
                        console.log('🖼️ Arka plan başarıyla değiştirildi ve animasyon başlatıldı.');
                    }, 800); // CSS transition süresi: 0.8s

                }, 800); // CSS transition süresi: 0.8s
            }
        } catch (error) {
            console.error('Arka plan değiştirme hatası:', error);
            await this.setDefaultBackground();
            this.isTransitioning = false;
        }
    }

    /**
     * Resmi önceden yükler, böylece anında gösterilebilir.
     */
    preloadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => {
                console.warn('⚠️ Resim önceden yüklenemedi:', url);
                resolve(); // Hata olsa bile devam et
            };
            img.src = url;
        });
    }

    /**
     * Arka plan animasyonunu durdurur.
     */
    stopAnimation() {
        this.backgroundContainer.classList.remove('animated');
        console.log('⛔ Animasyon durduruldu.');
    }

    /**
     * Arka plan animasyonunu başlatır.
     */
    startAnimation() {
        // Animasyonu başlatmadan önce küçük bir gecikme, tarayıcının kendine gelmesini sağlar.
        setTimeout(() => {
            this.backgroundContainer.classList.add('animated');
            console.log('▶️ Animasyon başlatıldı.');
        }, 100);
    }
    
    /**
     * Varsayılan arka planı ayarla
     */
    async setDefaultBackground() {
        const defaultImage = CONFIG.DEFAULT_IMAGE;
        console.log('🎨 Varsayılan arka plan kullanılıyor');
        
        this.isTransitioning = false;
        this.currentImageUrl = '';
        
        await this.changeBackground('default');
    }
    
    /**
     * Şehir için resim URL'si al (Hibrit sistem)
     */
    async getCityImage(cityName, weatherCondition = '', countryCode = '') {
        if (cityName === 'default') {
            return CONFIG.DEFAULT_IMAGE;
        }

        const cacheKey = `${cityName.toLowerCase()}_${countryCode || 'unknown'}`;
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey);
        }

        if (isTurkishCity(cityName, countryCode)) {
            const localImage = await this.getTurkishCityImage(cityName);
            if (localImage) {
                this.imageCache.set(cacheKey, localImage);
                return localImage;
            }
        }

        if (CONFIG.UNSPLASH_API.KEY && CONFIG.UNSPLASH_API.KEY !== 'YOUR_UNSPLASH_ACCESS_KEY') {
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

        const defaultImage = CONFIG.DEFAULT_IMAGE;
        this.imageCache.set(cacheKey, defaultImage);
        return defaultImage;
    }
    
    /**
     * Türkiye şehirleri için yerel resim al
     */
    async getTurkishCityImage(cityName) {
        const normalizedCityName = normalizeCityName(cityName);
        const cityAliases = {
            'afyonkarahisar': 'afyon',
            'kahramanmaras': 'maras',
            'sanliurfa': 'sanliurfa',
            'kirklareli': 'kirklareli'
        };
        const finalCityName = cityAliases[normalizedCityName] || normalizedCityName;
        const localImagePath = CONFIG.TURKEY_CITY_IMAGES[finalCityName];
        if (localImagePath) {
            const imageExists = await this.checkImageExists(localImagePath);
            if (imageExists) {
                return localImagePath;
            }
        }
        return null;
    }

    /**
     * Unsplash API'den resim al
     */
    async fetchFromUnsplash(cityName, weatherCondition) {
        let query = `${cityName} ${CONFIG.UNSPLASH_API.DEFAULT_QUERY}`;
        if (weatherCondition) {
            query += ` ${weatherCondition}`;
        }
        const url = `${CONFIG.UNSPLASH_API.BASE_URL}?query=${encodeURIComponent(query)}&orientation=${CONFIG.UNSPLASH_API.ORIENTATION}&client_id=${CONFIG.UNSPLASH_API.KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Unsplash API hatası: ${response.status}`);
        }
        const data = await response.json();
        return data.results && data.results.length > 0 ? data.results[0].urls.regular : null;
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
     * Hava durumuna göre arka plan filtresi
     */
    applyWeatherFilter(weatherCondition) {
        // Bu fonksiyon olduğu gibi kalabilir.
    }
    
    /**
     * Gece/gündüz modu
     */
    applyTimeOfDayEffect(sunrise, sunset) {
       // Bu fonksiyon olduğu gibi kalabilir.
    }

    /**
     * Cache'i temizle
     */
    clearCache() {
        this.imageCache.clear();
        console.log('🗑️ Resim cache\'i temizlendi');
    }
}

// Singleton instance oluştur
const backgroundManager = new BackgroundManager();