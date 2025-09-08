/**
 * Ana Uygulama Dosyası
 * Tüm modülleri bir araya getirir ve kullanıcı etkileşimlerini yönetir
 */

class WeatherApp {
    constructor() {
        this.currentCity = CONFIG.APP_SETTINGS.DEFAULT_CITY;
        this.isLoading = false;
        
        // DOM elementleri
        this.elements = {
            cityInput: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            weatherContent: document.getElementById('weatherContent'),
            cityName: document.getElementById('cityName'),
            countryName: document.getElementById('countryName'),
            currentDate: document.getElementById('currentDate'),
            temperature: document.getElementById('temperature'),
            weatherIcon: document.getElementById('weatherIcon'),
            weatherDescription: document.getElementById('weatherDescription'),
            visibility: document.getElementById('visibility'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            feelsLike: document.getElementById('feelsLike'),
            pressure: document.getElementById('pressure'),
            uvIndex: document.getElementById('uvIndex'),
            errorModal: document.getElementById('errorModal'),
            errorMessage: document.getElementById('errorMessage')
        };

        this.initializeApp();
    }

    /**
     * Uygulamayı başlat
     */
    async initializeApp() {
        console.log('🚀 Hava Durumu Uygulaması Başlatılıyor...');
        
        // API key kontrolü
        if (!checkAPIKeys()) {
            this.showError('API anahtarları tanımlanmamış! Lütfen config.js dosyasını kontrol edin.');
            return;
        }

        // Event listener'ları ekle
        this.setupEventListeners();
        
        // Tarih göster
        this.updateCurrentDate();
        
        // Varsayılan şehri yükle
        await this.loadWeatherData(this.currentCity);
        
        console.log('✅ Uygulama başarıyla başlatıldı');
    }

    /**
     * Event listener'ları kur
     */
    setupEventListeners() {
        // Arama butonu
        this.elements.searchBtn.addEventListener('click', () => {
            this.handleSearch();
        });

        // Enter tuşu ile arama
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Input focus/blur efektleri
        this.elements.cityInput.addEventListener('focus', () => {
            this.elements.cityInput.style.transform = 'scale(1.02)';
        });

        this.elements.cityInput.addEventListener('blur', () => {
            this.elements.cityInput.style.transform = 'scale(1)';
        });

        // Modal kapatma
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideError();
            });
        }

        // Modal dışına tıklayınca kapatma
        this.elements.errorModal.addEventListener('click', (e) => {
            if (e.target === this.elements.errorModal) {
                this.hideError();
            }
        });

        // Escape tuşu ile modal kapatma
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideError();
            }
        });

        // Sayfa yenilendiğinde uyarı (geliştirme sırasında faydalı)
        window.addEventListener('beforeunload', (e) => {
            if (this.isLoading) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    /**
     * Arama işlemini yönet
     */
    async handleSearch() {
        const cityName = this.elements.cityInput.value.trim();
        
        if (!cityName) {
            this.showError('Lütfen geçerli bir şehir adı girin! 🌍');
            return;
        }

        if (cityName === this.currentCity) {
            console.log('Aynı şehir, yeniden yükleme yapılmıyor');
            return;
        }

        await this.loadWeatherData(cityName);
    }

    /**
     * Hava durumu verilerini yükle
     */
    async loadWeatherData(cityName) {
        if (this.isLoading) {
            console.log('Zaten yükleme işlemi devam ediyor...');
            return;
        }

        try {
            this.isLoading = true;
            this.showLoading();

            console.log(`🔍 ${cityName} için hava durumu verisi alınıyor...`);

            // Hava durumu verilerini al
            const weatherData = await weatherAPI.getWeatherData(cityName);
            
            // UI'yi güncelle
            this.updateWeatherUI(weatherData);
            
            // Arka planı değiştir
            await backgroundManager.changeBackground(
                weatherData.city.name, 
                weatherData.current.condition
            );

            // Hava durumuna göre arka plan filtresini uygula
            backgroundManager.applyWeatherFilter(weatherData.current.condition);
            
            // Gece/gündüz efektini uygula
            backgroundManager.applyTimeOfDayEffect(
                weatherData.sunrise, 
                weatherData.sunset
            );

            // Chatbot'u güncelle
            chatbotUI.updateWeatherData(weatherData);

            // Mevcut şehri güncelle
            this.currentCity = weatherData.city.name;
            this.elements.cityInput.value = '';

            console.log('✅ Hava durumu verisi başarıyla yüklendi');

        } catch (error) {
            console.error('❌ Hava durumu verisi yüklenirken hata:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * Hava durumu UI'sini güncelle
     */
    updateWeatherUI(weatherData) {
        const { city, current, wind } = weatherData;

        // Şehir bilgileri
        this.elements.cityName.textContent = city.name;
        this.elements.countryName.textContent = city.country;

        // Ana hava durumu
        this.elements.temperature.textContent = `${current.temperature}°`;
        this.elements.weatherDescription.textContent = current.description;
        
        // Hava durumu ikonu
        const iconClass = weatherAPI.getWeatherIcon(current.icon);
        this.elements.weatherIcon.className = `weather-icon ${iconClass}`;

        // Detaylar
        this.elements.visibility.textContent = `${current.visibility} km`;
        this.elements.humidity.textContent = `${current.humidity}%`;
        this.elements.windSpeed.textContent = `${wind.speed} km/h`;
        this.elements.feelsLike.textContent = `${current.feelsLike}°C`;
        this.elements.pressure.textContent = `${current.pressure} hPa`;
        this.elements.uvIndex.textContent = current.uvIndex;

        // Smooth transition efekti
        this.elements.weatherContent.style.opacity = '0';
        setTimeout(() => {
            this.elements.weatherContent.style.opacity = '1';
        }, 100);
    }

    /**
     * Yükleme durumunu göster
     */
    showLoading() {
        this.elements.loadingSpinner.style.display = 'block';
        this.elements.weatherContent.style.display = 'none';
        this.elements.searchBtn.disabled = true;
        this.elements.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    /**
     * Yükleme durumunu gizle
     */
    hideLoading() {
        this.elements.loadingSpinner.style.display = 'none';
        this.elements.weatherContent.style.display = 'block';
        this.elements.searchBtn.disabled = false;
        this.elements.searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    }

    /**
     * Hata mesajı göster
     */
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorModal.style.display = 'block';
        
        // Modal animasyonu
        setTimeout(() => {
            this.elements.errorModal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    }

    /**
     * Hata modalını gizle
     */
    hideError() {
        this.elements.errorModal.querySelector('.modal-content').style.transform = 'scale(0.8)';
        setTimeout(() => {
            this.elements.errorModal.style.display = 'none';
        }, 300);
    }

    /**
     * Mevcut tarihi güncelle
     */
    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const dateString = now.toLocaleDateString('tr-TR', options);
        this.elements.currentDate.textContent = dateString;

        // Her dakika güncelle
        setTimeout(() => {
            this.updateCurrentDate();
        }, 60000);
    }

    /**
     * Uygulamayı yenile
     */
    async refreshApp() {
        console.log('🔄 Uygulama yenileniyor...');
        
        // Cache'leri temizle
        weatherAPI.clearCache();
        backgroundManager.clearCache();
        
        // Mevcut şehri yeniden yükle
        await this.loadWeatherData(this.currentCity);
        
        console.log('✅ Uygulama yenilendi');
    }

    /**
     * Geolocation ile mevcut konumu al
     */
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation desteklenmiyor'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    reject(new Error('Konum alınamadı'));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    /**
     * Mevcut konuma göre hava durumunu al
     */
    async loadCurrentLocationWeather() {
        try {
            this.showLoading();
            const location = await this.getCurrentLocation();
            
            // Koordinatlardan şehir adını al (reverse geocoding)
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${location.lat}&lon=${location.lon}&limit=1&appid=${CONFIG.WEATHER_API.KEY}`
            );
            
            const data = await response.json();
            
            if (data.length > 0) {
                const cityName = data[0].local_names?.tr || data[0].name;
                await this.loadWeatherData(cityName);
            } else {
                throw new Error('Konum bilgisi alınamadı');
            }
            
        } catch (error) {
            console.error('Konum tabanlı hava durumu hatası:', error);
            this.showError('Konum bilgisi alınamadı. Varsayılan şehir yükleniyor.');
            await this.loadWeatherData(CONFIG.APP_SETTINGS.DEFAULT_CITY);
        }
    }
}

// Sayfa yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM yüklendi, uygulama başlatılıyor...');
    
    // Global app instance'ı oluştur
    window.weatherApp = new WeatherApp();
    
    // Konsola yardımcı komutları yazdır
    console.log(`
🌤️ Hava Durumu Uygulaması
========================
Konsol komutları:
- weatherApp.refreshApp() : Uygulamayı yenile
- weatherApp.loadCurrentLocationWeather() : Mevcut konumu kullan
- weatherAPI.clearCache() : API cache'ini temizle
- backgroundManager.clearCache() : Resim cache'ini temizle

API Durumu: ${CONFIG.WEATHER_API.KEY !== 'YOUR_OPENWEATHERMAP_API_KEY' ? '✅ Aktif' : '❌ Tanımlanmamış'}
    `);
});

// Service Worker kayıt (PWA için opsiyonel)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('🔧 Service Worker kayıtlı:', registration.scope);
            })
            .catch((error) => {
                console.log('❌ Service Worker kayıt hatası:', error);
            });
    });
}

// Performans izleme
window.addEventListener('load', () => {
    setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        console.log(`⚡ Sayfa yüklenme süresi: ${loadTime.toFixed(2)}ms`);
    }, 1000);
});