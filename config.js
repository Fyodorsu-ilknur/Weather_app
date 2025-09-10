// API Konfigürasyonu
const CONFIG = {
    // OpenWeatherMap API
    WEATHER_API: {
        KEY: '9ade89c8cc190509a07210e8a2dc667e',
        BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
        FORECAST_URL: 'https://api.openweathermap.org/data/2.5/forecast',
        DEFAULT_UNITS: 'metric',
        DEFAULT_LANG: 'tr'
    },
    
    // Unsplash API - Türkiye dışı şehirler için
    UNSPLASH_API: {
        KEY: 'UpjvxfHUHhQLSgjV8022HEwRDJ15q8WYF0mIqldy4oU',
        BASE_URL: 'https://api.unsplash.com/search/photos',
        DEFAULT_QUERY: 'city skyline landscape',
        PER_PAGE: 5,
        ORIENTATION: 'landscape'
    },
    
    // Türkiye şehirleri için yerel resimler
    TURKEY_CITY_IMAGES: {
        // A
        'adana': 'images/adana.png',
        'adiyaman': 'images/adiyaman.png',
        'afyon': 'images/afyon.png',
        'agri': 'images/agri.png',
        'aksaray': 'images/aksaray.png',
        'amasya': 'images/amasya.png',
        'ankara': 'images/ankara.png',
        'antalya': 'images/antalya.png',
        'ardahan': 'images/ardahan.png',
        'artvin': 'images/artvin.png',
        'aydin': 'images/aydin.png',
        
        // B
        'balikesir': 'images/balikesir.png',
        'bartin': 'images/bartin.png',
        'batman': 'images/batman.png',
        'bayburt': 'images/bayburt.png',
        'bilecik': 'images/bilecik.png',
        'bingol': 'images/bingol.png',
        'bitlis': 'images/bitlis.png',
        'bolu': 'images/bolu.png',
        'burdur': 'images/burdur.png',
        'bursa': 'images/bursa.png',
        
        // C
        'canakkale': 'images/canakkale.png',
        'cankiri': 'images/cankiri.png',
        'corum': 'images/corum.png',
        
        // D
        'denizli': 'images/denizli.png',
        'diyarbakir': 'images/diyarbakir.png',
        'duzce': 'images/duzce.png',
        
        // E
        'edirne': 'images/edirne.png',
        'elazig': 'images/elazig.png',
        'erzincan': 'images/erzincan.png',
        'erzurum': 'images/erzurum.png',
        'eskisehir': 'images/eskisehir.png',
        
        // G
        'gaziantep': 'images/gaziantep.png',
        'giresun': 'images/giresun.png',
        'gumushane': 'images/gumushane.png',
        
        // H
        'hakkari': 'images/hakkari.png',
        'hatay': 'images/hatay.png',
        
        // I
        'igdir': 'images/igdir.png',
        'isparta': 'images/isparta.png',
        'istanbul': 'images/istanbul.png',
        'izmir': 'images/izmir.png',
        
        // K
        'karabuk': 'images/karabuk.png',
        'karaman': 'images/karaman.png',
        'kars': 'images/kars.png',
        'kastamonu': 'images/kastamonu.png',
        'kayseri': 'images/kayseri.png',
        'kilis': 'images/kilis.png',
        'kirikkale': 'images/kirikkale.png',
        'kirklareli': 'images/kirklareli.png',
        'kirsehir': 'images/kirsehir.png',
        'kocaeli': 'images/kocaeli.jpg',
        'konya': 'images/konya.png',
        'kutahya': 'images/kutahya.png',
        
        // M
        'malatya': 'images/malatya.png',
        'manisa': 'images/manisa.png',
        'maras': 'images/maras.png',
        'mardin': 'images/mardin.png',
        'mersin': 'images/mersin.png',
        'mugla': 'images/mugla.png',
        'mus': 'images/mus.png',
        
        // N
        'nevsehir': 'images/nevsehir.png',
        'nigde': 'images/nigde.png',
        
        // O
        'ordu': 'images/ordu.png',
        'osmaniye': 'images/osmaniye.png',
        
        // R
        'rize': 'images/rize.png',
        
        // S
        'sakarya': 'images/sakarya.png',
        'samsun': 'images/samsun.png',
        'sanliurfa': 'images/sanliurfa.png',
        'siirt': 'images/siirt.png',
        'sinop': 'images/sinop.png',
        'sirnak': 'images/sirnak.png',
        'sivas': 'images/sivas.png',
        
        // T
        'tekirdag': 'images/tekirdag.png',
        'tokat': 'images/tokat.png',
        'trabzon': 'images/trabzon.png',
        'tunceli': 'images/tunceli.png',
        
        // U
        'usak': 'images/usak.png',
        
        // V
        'van': 'images/van.png',
        
        // Y
        'yalova': 'images/yalova.png',
        'yozgat': 'images/yozgat.png',
        
        // Z
        'zonguldak': 'images/zonguldak.png'
    },
    
    // Türkiye şehir isimleri (normalizasyon için)
    TURKEY_CITIES: [
        'adana', 'adiyaman', 'afyon', 'agri', 'aksaray', 'amasya', 
        'ankara', 'antalya', 'ardahan', 'artvin', 'aydin', 'balikesir', 'bartin', 
        'batman', 'bayburt', 'bilecik', 'bingol', 'bitlis', 'bolu', 'burdur', 'bursa',
        'canakkale', 'cankiri', 'corum', 'denizli', 'diyarbakir', 'duzce', 'edirne',
        'elazig', 'erzincan', 'erzurum', 'eskisehir', 'gaziantep', 'giresun', 'gumushane',
        'hakkari', 'hatay', 'igdir', 'isparta', 'istanbul', 'izmir', 'karabuk', 'karaman',
        'kars', 'kastamonu', 'kayseri', 'kilis', 'kirikkale', 'kirklareli', 'kirsehir',
        'kocaeli', 'konya', 'kutahya', 'malatya', 'manisa','maras',
        'mardin', 'mersin', 'mugla', 'mus', 'nevsehir', 'nigde', 'ordu', 'osmaniye',
        'rize', 'sakarya', 'samsun', 'sanliurfa', 'siirt', 'sinop', 'sirnak', 'sivas',
        'tekirdag', 'tokat', 'trabzon', 'tunceli', 'usak', 'van', 'yalova', 'yozgat',
        'zonguldak'
    ],
      
    // Varsayılan resim
    DEFAULT_IMAGE: 'images/default.jpg',
    
    // Hava durumu ikonları
    WEATHER_ICONS: {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    },
    
    // Uygulama ayarları
    APP_SETTINGS: {
        DEFAULT_CITY: 'İstanbul',
        ANIMATION_DURATION: 2000,
        FADE_DURATION: 1000,
        CACHE_DURATION: 300000,
        MAX_SEARCH_RESULTS: 5
    }
};

// API Key kontrolü
function checkAPIKeys() {
    if (CONFIG.WEATHER_API.KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        console.warn('⚠️ OpenWeatherMap API key tanımlanmamış!');
        return false;
    }
    return true;
}

// Türkiye şehri kontrolü
function isTurkishCity(cityName, countryCode = '') {
    if (countryCode && countryCode !== 'TR') {
        return false;
    }
    
    const normalized = normalizeCityName(cityName);
    return CONFIG.TURKEY_CITIES.includes(normalized);
}

// Şehir adını normalize et
function normalizeCityName(cityName) {
    return cityName
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/â/g, 'a') // YENİ EKLENEN SATIR: Şapkalı 'a' harfini düzeltir.
        .replace(/\s+/g, '') 
        .replace(/[^a-z0-9]/g, '');
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
    module.exports = { CONFIG, TRANSLATIONS, checkAPIKeys, isTurkishCity, normalizeCityName };
}