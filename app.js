/**
 * Ana Uygulama Dosyası - Geliştirilmiş Hata Yönetimi
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
     * Uygulamayı başlat - HATA KORUMALI
     */
    async initializeApp() {
        try {
            console.log('🚀 Hava Durumu Uygulaması Başlatılıyor...');
            
            // API key kontrolü
            if (!checkAPIKeys()) {
                this.showError('⚠️ API anahtarları tanımlanmamış!\n\nLütfen config.js dosyasını kontrol edin.\n\n📘 Yeni API key: https://openweathermap.org/api');
                return;
            }

            // Event listener'ları ekle
            this.setupEventListeners();
            
            // Tarih göster
            this.updateCurrentDate();
            
            // Varsayılan şehri yükle (hata kontrolü ile)
            await this.loadWeatherDataSafe(this.currentCity);
            
            console.log('✅ Uygulama başarıyla başlatıldı');

        } catch (error) {
            console.error('❌ Uygulama başlatma hatası:', error);
            this.showError('Uygulama başlatılırken hata oluştu. Sayfayı yenileyin.');
        }
    }

    /**
     * Event listener'ları kur
     */
    setupEventListeners() {
        // Arama butonu
        this.elements.searchBtn.addEventListener('click', () => {
            this.handleSearchSafe();
        });

        // Enter tuşu ile arama
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearchSafe();
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
        if (this.elements.errorModal) {
            this.elements.errorModal.addEventListener('click', (e) => {
                if (e.target === this.elements.errorModal) {
                    this.hideError();
                }
            });
        }

        // Escape tuşu ile modal kapatma
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideError();
            }
        });

        // Sayfa yenilendiğinde uyarı (yükleme sırasında)
        window.addEventListener('beforeunload', (e) => {
            if (this.isLoading) {
                e.preventDefault();
                e.returnValue = 'Veri yükleniyor, çıkmak istediğinizden emin misiniz?';
            }
        });
    }

    /**
     * Güvenli arama işlemi
     */
    async handleSearchSafe() {
        try {
            const cityName = this.elements.cityInput.value.trim();
            
            if (!cityName) {
                this.showError('🌍 Lütfen geçerli bir şehir adı girin!');
                return;
            }

            if (cityName === this.currentCity) {
                console.log('📍 Aynı şehir, yeniden yükleme yapılmıyor');
                this.elements.cityInput.value = '';
                return;
            }

            await this.loadWeatherDataSafe(cityName);

        } catch (error) {
            console.error('❌ Arama hatası:', error);
            this.showError('Arama sırasında hata oluştu.');
        }
    }

    /**
     * Güvenli hava durumu veri yükleme
     */
    async loadWeatherDataSafe(cityName) {
        if (this.isLoading) {
            console.log('⏳ Zaten yükleme işlemi devam ediyor...');
            return;
        }

        // Loading timeout (15 saniye)
        const loadingTimeout = setTimeout(() => {
            if (this.isLoading) {
                console.error('⏱️ Yükleme timeout!');
                this.hideLoading();
                this.isLoading = false;
                this.showError('⏱️ İstek zaman aşımına uğradı!\n\nİnternet bağlantınızı kontrol edin\nveya daha sonra tekrar deneyin.');
            }
        }, 15000);

        try {
            this.isLoading = true;
            this.showLoading();

            console.log(`🔍 ${cityName} için hava durumu verisi alınıyor...`);

            // 1. Hava durumu verilerini al
            const weatherData = await weatherAPI.getWeatherData(cityName);
            console.log('✅ Hava durumu verisi alındı:', weatherData);
            
            // 2. UI'yi güncelle
            this.updateWeatherUI(weatherData);
            
            // 3. Arka planı değiştir (async, hata olsa bile devam et)
            backgroundManager.changeBackground(
                weatherData.city.name, 
                weatherData.current.condition
            ).catch(error => {
                console.warn('⚠️ Arka plan değiştirme hatası (devam ediliyor):', error);
            });

            // 4. Hava durumu filtresi uygula
            backgroundManager.applyWeatherFilter(weatherData.current.condition);
            
            // 5. Gece/gündüz efektini uygula
            backgroundManager.applyTimeOfDayEffect(
                weatherData.sunrise, 
                weatherData.sunset
            );

            // 6. Chatbot'u güncelle
            if (typeof chatbotUI !== 'undefined') {
                chatbotUI.updateWeatherData(weatherData);
            }

            // 7. Mevcut şehri güncelle
            this.currentCity = weatherData.city.name;
            this.elements.cityInput.value = '';

            console.log('✅ Tüm veriler başarıyla yüklendi:', weatherData.city.name);

        } catch (error) {
            console.error('❌ Veri yükleme hatası:', error);
            
            // Kullanıcı dostu hata mesajları
            let errorMessage = '❌ Hava durumu verisi alınamadı!\n\n';
            
            if (error.message.includes('Şehir bulunamadı')) {
                errorMessage += '🔍 Şehir bulunamadı. Lütfen:\n• Şehir adını kontrol edin\n• İngilizce adını deneyin\n• Farklı bir şehir deneyin';
            } else if (error.message.includes('API anahtarı')) {
                errorMessage += '🔑 API anahtarı sorunu!\n\nOpenWeatherMap hesabınızdan\nyeni bir API key alın.\n\n📘 https://openweathermap.org/api';
            } else if (error.message.includes('429')) {
                errorMessage += '⏱️ Çok fazla istek!\n\n10 dakika bekleyip\ntekrar deneyin.';
            } else if (!navigator.onLine) {
                errorMessage += '📡 İnternet bağlantısı yok!\n\nBağlantınızı kontrol edin.';
            } else {
                errorMessage += `🔧 Teknik hata:\n${error.message}\n\nDaha sonra tekrar deneyin.`;
            }
            
            this.showError(errorMessage);
        } finally {
            clearTimeout(loadingTimeout);
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * Hava durumu UI'sini güncelle
     */
    updateWeatherUI(weatherData) {
        try {
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
            this.elements.uvIndex.textContent = current.uvIndex || 'N/A';

            // Smooth transition efekti
            this.elements.weatherContent.style.opacity = '0';
            setTimeout(() => {
                this.elements.weatherContent.style.opacity = '1';
            }, 200);

            console.log('✅ UI başarıyla güncellendi');

        } catch (error) {
            console.error('❌ UI güncelleme hatası:', error);
            this.showError('Veri gösterilirken hata oluştu.');
        }
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
        if (this.elements.errorMessage && this.elements.errorModal) {
            this.elements.errorMessage.textContent = message;
            this.elements.errorModal.style.display = 'block';
            
            // Modal animasyonu
            setTimeout(() => {
                const modalContent = this.elements.errorModal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.transform = 'scale(1)';
                }
            }, 10);
        } else {
            // Fallback: alert
            alert(message);
        }

        console.error('🚨 Kullanıcıya hata gösterildi:', message);
    }

    /**
     * Hata modalını gizle
     */
    hideError() {
        if (this.elements.errorModal) {
            const modalContent = this.elements.errorModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.transform = 'scale(0.8)';
            }
            setTimeout(() => {
                this.elements.errorModal.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Mevcut tarihi güncelle
     */
    updateCurrentDate() {
        try {
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

        } catch (error) {
            console.error('❌ Tarih güncelleme hatası:', error);
        }
    }

    /**
     * Uygulamayı yenile
     */
    async refreshApp() {
        try {
            console.log('🔄 Uygulama yenileniyor...');
            
            // Cache'leri temizle
            weatherAPI.clearCache();
            backgroundManager.clearCache();
            
            // Mevcut şehri yeniden yükle
            await this.loadWeatherDataSafe(this.currentCity);
            
            console.log('✅ Uygulama yenilendi');
        } catch (error) {
            console.error('❌ Yenileme hatası:', error);
            this.showError('Yenileme sırasında hata oluştu.');
        }
    }

    /**
     * Debug bilgisi
     */
    getDebugInfo() {
        return {
            currentCity: this.currentCity,
            isLoading: this.isLoading,
            weatherData: weatherAPI.cache?.get(this.currentCity.toLowerCase()),
            backgroundInfo: backgroundManager.getDebugInfo?.()
        };
    }
}

// Sayfa yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM yüklendi, uygulama başlatılıyor...');
    
    try {
        // Global app instance'ı oluştur
        window.weatherApp = new WeatherApp();
        
        // Global debug fonksiyonu
        window.debugApp = () => {
            console.log('🐛 App Debug Info:', weatherApp.getDebugInfo());
        };
        
        // Konsola yardımcı komutları yazdır
        console.log(`
🌤️ Hava Durumu Uygulaması v2.0
==============================
Debug Komutları:
- debugApp() : Uygulama durumunu göster
- debugBackground() : Arka plan durumunu göster  
- weatherApp.refreshApp() : Uygulamayı yenile
- weatherAPI.testAPIConnection() : API bağlantısını test et
- weatherAPI.clearCache() : API cache'ini temizle
- backgroundManager.clearCache() : Resim cache'ini temizle

API Durumu: ${CONFIG.WEATHER_API.KEY !== 'YOUR_OPENWEATHERMAP_API_KEY' ? '✅ Aktif' : '❌ Tanımlanmamış'}
Unsplash API: ${CONFIG.UNSPLASH_API.KEY !== 'YOUR_UNSPLASH_ACCESS_KEY' ? '✅ Aktif' : '❌ Tanımlanmamış'}
        `);
        
    } catch (error) {
        console.error('❌ Uygulama başlatma hatası:', error);
        alert('Uygulama başlatılamadı! Konsolu kontrol edin.');
    }
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
        try {
            const navigation = performance.getEntriesByType('navigation')[0];
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            console.log(`⚡ Sayfa yüklenme süresi: ${loadTime.toFixed(2)}ms`);
        } catch (error) {
            console.log('📊 Performans ölçümü yapılamadı');
        }
    }, 1000);
});

// Global hata yakalayıcı
window.addEventListener('error', (event) => {
    console.error('🚨 Global JavaScript hatası:', event.error);
    if (window.weatherApp) {
        window.weatherApp.showError('Beklenmeyen bir hata oluştu.\nSayfayı yenilemeyi deneyin.');
    }
});

// Promise hata yakalayıcı
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 İşlenmeyen Promise hatası:', event.reason);
    event.preventDefault(); // Console'da hata göstermemek için
});