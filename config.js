// API Konfigürasyonu
const CONFIG = {
    // OpenWeatherMap API - Ücretsiz hesap oluşturup kendi API key'inizi buraya girin
    WEATHER_API: {
        KEY: '9ade89c8cc190509a07210e8a2dc667e',
        BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
        FORECAST_URL: 'https://api.openweathermap.org/data/2.5/forecast',
        DEFAULT_UNITS: 'metric', // metric = Celsius, imperial = Fahrenheit
        DEFAULT_LANG: 'tr' // Türkçe açıklamalar için
    },
    
    // Unsplash API - Şehir fotoğrafları için (opsiyonel)
    UNSPLASH_API: {
        KEY: 'UpjvxfHUHhQLSgjV8022HEwRDJ15q8WYF0mIqldy4oU', // https://unsplash.com/developers adresinden alabilirsiniz
        BASE_URL: 'https://api.unsplash.com/search/photos',
        DEFAULT_QUERY: 'city skyline landscape',
        PER_PAGE: 5,
        ORIENTATION: 'portrait' // Dikey fotoğraflar için
    },
    
    // Varsayılan şehir resimleri (Unsplash API olmadığında kullanılacak)
   /* DEFAULT_CITY_IMAGES: {
        'istanbul': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'ankara': 'https://images.unsplash.com/photo-1582467906653-d59c57ddd0c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'izmir': 'https://images.unsplash.com/photo-1598555834355-a2e7bb7e0c7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'antalya': 'https://images.unsplash.com/photo-1566737236500-c8ac43014a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'bursa': 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'adana': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'gaziantep': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'default': 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }, */
    
    // Hava durumu ikonları
    WEATHER_ICONS: {
        '01d': 'fas fa-sun', // açık gündüz
        '01n': 'fas fa-moon', // açık gece
        '02d': 'fas fa-cloud-sun', // parçalı bulutlu gündüz
        '02n': 'fas fa-cloud-moon', // parçalı bulutlu gece
        '03d': 'fas fa-cloud', // scattered clouds
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud', // broken clouds
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain', // sağanak yağmur
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain', // yağmur gündüz
        '10n': 'fas fa-cloud-moon-rain', // yağmur gece
        '11d': 'fas fa-bolt', // gök gürültüsü
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake', // kar
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog', // sis
        '50n': 'fas fa-smog'
    },
    
    // Uygulama ayarları
    APP_SETTINGS: {
        DEFAULT_CITY: 'İstanbul',
        ANIMATION_DURATION: 1500, // milisaniye
        CACHE_DURATION: 300000, // 5 dakika (milisaniye)
        MAX_SEARCH_RESULTS: 5
    }
};

// API Key kontrolü
function checkAPIKeys() {
    if (CONFIG.WEATHER_API.KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        console.warn('⚠️ OpenWeatherMap API key tanımlanmamış! Lütfen config.js dosyasında API key\'inizi tanımlayın.');
        console.info('📘 API key almak için: https://openweathermap.org/api');
        return false;
    }
    return true;
}

// Dil ayarları
const TRANSLATIONS = {
    tr: {
        loading: 'Yükleniyor...',
        error: 'Hata oluştu',
        cityNotFound: 'Şehir bulunamadı',
        networkError: 'İnternet bağlantısı hatası',
        searchPlaceholder: 'Şehir adını girin...',
        feels_like: 'Hissedilen',
        humidity: 'Nem',
        pressure: 'Basınç',
        wind_speed: 'Rüzgar Hızı',
        visibility: 'Görüş',
        uv_index: 'UV İndeksi'
    }
};

// Export (ES6 modülleri için)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, TRANSLATIONS, checkAPIKeys };
}