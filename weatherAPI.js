/**
 * Hava Durumu API Yöneticisi
 * OpenWeatherMap API ile iletişim kurar ve verileri işler
 * Ülke kodu bilgisini de döndürür
 */

class WeatherAPI {
    constructor() {
        this.cache = new Map();
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 saniye minimum bekleme
    }

    /**
     * Şehir adından koordinat bulma
     */
    async getCoordinates(cityName) {
        try {
          let searchQuery = cityName;
            if (isTurkishCity(cityName)) {
                searchQuery += ', TR';
            }
            // DEĞİŞİKLİK BURADA BİTİYOR

            const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=1&appid=${CONFIG.WEATHER_API.KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API hatası: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                throw new Error('Şehir bulunamadı');
            }
            
            return {
                lat: data[0].lat,
                lon: data[0].lon,
                name: data[0].local_names?.tr || data[0].name,
                country: data[0].country,
                countryCode: data[0].country // Ülke kodunu ekledik
            };
        } catch (error) {
            console.error('Koordinat alımında hata:', error);
            throw error;
        }
    }

    /**
     * Hava durumu verilerini getir
     */
    async getWeatherData(cityName) {
        // Cache kontrolü
        const cacheKey = cityName.toLowerCase();
        if (this.cache.has(cacheKey)) {
            const cachedData = this.cache.get(cacheKey);
            if (Date.now() - cachedData.timestamp < CONFIG.APP_SETTINGS.CACHE_DURATION) {
                console.log('🚀 Cache\'den veri alındı:', cityName);
                return cachedData.data;
            }
        }

        // Rate limiting
        const now = Date.now();
        if (now - this.lastRequestTime < this.minRequestInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minRequestInterval));
        }
        this.lastRequestTime = Date.now();

        try {
            // Önce koordinatları al
            const coordinates = await this.getCoordinates(cityName);
            
            console.log(`🌍 Şehir bilgisi: ${coordinates.name}, ${coordinates.country} (${coordinates.countryCode})`);
            
            // Sonra hava durumu verilerini al
            const weatherUrl = `${CONFIG.WEATHER_API.BASE_URL}?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${CONFIG.WEATHER_API.KEY}&units=${CONFIG.WEATHER_API.DEFAULT_UNITS}&lang=${CONFIG.WEATHER_API.DEFAULT_LANG}`;
            
            const response = await fetch(weatherUrl);
            
            if (!response.ok) {
                throw new Error(`Hava durumu API hatası: ${response.status}`);
            }
            
            const weatherData = await response.json();
            
            // Veriyi işle ve standart formata çevir
            const processedData = this.processWeatherData(weatherData, coordinates);
            
            // Cache'e kaydet
            this.cache.set(cacheKey, {
                data: processedData,
                timestamp: Date.now()
            });
            
            return processedData;
            
        } catch (error) {
            console.error('Hava durumu verisi alınırken hata:', error);
            throw this.handleAPIError(error);
        }
    }

    /**
     * API'dan gelen ham veriyi işle
     */
    processWeatherData(data, coordinates) {
        return {
            city: {
               name: coordinates.name.replace(/\s+(il merkezi|merkez|belediyesi|ili|il)$/i, '').trim(),
                country: this.getCountryName(coordinates.country),
                countryCode: coordinates.countryCode, 
                coordinates: {
                    lat: coordinates.lat,
                    lon: coordinates.lon
                }
            },
            current: {
                temperature: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                visibility: data.visibility ? Math.round(data.visibility / 1000) : 10,
                uvIndex: data.uvi || 0,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                condition: data.weather[0].main
            },
            wind: {
                speed: Math.round(data.wind.speed * 3.6), // m/s to km/h
                direction: data.wind.deg || 0,
                gust: data.wind.gust ? Math.round(data.wind.gust * 3.6) : null
            },
            timestamp: new Date().toISOString(),
            sunrise: data.sys.sunrise ? new Date(data.sys.sunrise * 1000) : null,
            sunset: data.sys.sunset ? new Date(data.sys.sunset * 1000) : null
        };
    }

    /**
     * Ülke kodunu ülke adına çevir
     */
    getCountryName(countryCode) {
        const countries = {
            'TR': 'Türkiye',
            'US': 'Amerika Birleşik Devletleri',
            'GB': 'Birleşik Krallık',
            'DE': 'Almanya',
            'FR': 'Fransa',
            'IT': 'İtalya',
            'ES': 'İspanya',
            'GR': 'Yunanistan',
            'BG': 'Bulgaristan',
            'RO': 'Romanya',
            'UA': 'Ukrayna',
            'RU': 'Rusya',
            'SA': 'Suudi Arabistan',
            'AE': 'Birleşik Arap Emirlikleri',
            'EG': 'Mısır',
            'JP': 'Japonya',
            'CN': 'Çin',
            'IN': 'Hindistan',
            'AU': 'Avustralya',
            'CA': 'Kanada',
            'BR': 'Brezilya',
            'MX': 'Meksika',
            'AR': 'Arjantin',
            'NL': 'Hollanda',
            'BE': 'Belçika',
            'CH': 'İsviçre',
            'AT': 'Avusturya',
            'SE': 'İsveç',
            'NO': 'Norveç',
            'DK': 'Danimarka',
            'FI': 'Finlandiya',
            'PL': 'Polonya',
            'CZ': 'Çek Cumhuriyeti',
            'HU': 'Macaristan',
            'PT': 'Portekiz',
            'IE': 'İrlanda',
            'IL': 'İsrail',
            'KR': 'Güney Kore',
            'TH': 'Tayland',
            'SG': 'Singapur',
            'MY': 'Malezya',
            'PH': 'Filipinler',
            'VN': 'Vietnam',
            'ID': 'Endonezya',
            'ZA': 'Güney Afrika',
            'MA': 'Fas',
            'DZ': 'Cezayir',
            'TN': 'Tunus',
            'LY': 'Libya',
            'SD': 'Sudan',
            'ET': 'Etiyopya',
            'KE': 'Kenya',
            'TZ': 'Tanzanya',
            'UG': 'Uganda',
            'GH': 'Gana',
            'NG': 'Nijerya',
            'CI': "Fildişi Sahili",
            'SN': 'Senegal',
            'ML': 'Mali',
            'BF': 'Burkina Faso',
            'NE': 'Nijer',
            'TD': 'Çad',
            'CF': 'Orta Afrika Cumhuriyeti',
            'CM': 'Kamerun',
            'GA': 'Gabon',
            'CG': 'Kongo',
            'CD': 'Demokratik Kongo Cumhuriyeti',
            'AO': 'Angola',
            'ZM': 'Zambiya',
            'ZW': 'Zimbabve',
            'BW': 'Botsvana',
            'NA': 'Namibya',
            'MW': 'Malavi',
            'MZ': 'Mozambik',
            'MG': 'Madagaskar',
            'MU': 'Mauritius',
            'SC': 'Seyşeller'
        };
        return countries[countryCode] || countryCode;
    }

    /**
     * API hatalarını işle
     */
    handleAPIError(error) {
        if (error.message.includes('401')) {
            return new Error('API anahtarı geçersiz. Lütfen config.js dosyasını kontrol edin.');
        } else if (error.message.includes('404')) {
            return new Error('Şehir bulunamadı. Lütfen şehir adını kontrol edin.');
        } else if (error.message.includes('429')) {
            return new Error('Çok fazla istek gönderildi. Lütfen biraz bekleyin.');
        } else if (error.message.includes('Şehir bulunamadı')) {
            return new Error('Girdiğiniz şehir bulunamadı. Lütfen farklı bir şehir deneyin.');
        } else if (!navigator.onLine) {
            return new Error('İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.');
        } else {
            return new Error('Hava durumu verileri alınamadı. Lütfen daha sonra tekrar deneyin.');
        }
    }

    /**
     * Hava durumu ikonunu Font Awesome sınıfına çevir
     */
    getWeatherIcon(iconCode) {
        return CONFIG.WEATHER_ICONS[iconCode] || 'fas fa-question-circle';
    }

    /**
     * Cache'i temizle
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Weather API cache temizlendi');
    }

    /**
     * 5 günlük tahmin al (opsiyonel)
     */
    async getForecastData(cityName) {
        try {
            const coordinates = await this.getCoordinates(cityName);
            const forecastUrl = `${CONFIG.WEATHER_API.FORECAST_URL}?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${CONFIG.WEATHER_API.KEY}&units=${CONFIG.WEATHER_API.DEFAULT_UNITS}&lang=${CONFIG.WEATHER_API.DEFAULT_LANG}`;
            
            const response = await fetch(forecastUrl);
            
            if (!response.ok) {
                throw new Error(`Tahmin API hatası: ${response.status}`);
            }
            
            const forecastData = await response.json();
            return this.processForecastData(forecastData);
            
        } catch (error) {
            console.error('Tahmin verisi alınırken hata:', error);
            throw this.handleAPIError(error);
        }
    }

    /**
     * Tahmin verilerini işle
     */
    processForecastData(data) {
        const dailyForecasts = {};
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    date: new Date(item.dt * 1000),
                    temperatures: [],
                    descriptions: [],
                    icons: [],
                    humidity: [],
                    windSpeed: []
                };
            }
            
            dailyForecasts[date].temperatures.push(item.main.temp);
            dailyForecasts[date].descriptions.push(item.weather[0].description);
            dailyForecasts[date].icons.push(item.weather[0].icon);
            dailyForecasts[date].humidity.push(item.main.humidity);
            dailyForecasts[date].windSpeed.push(item.wind.speed);
        });
        
        // Her gün için ortalama değerleri hesapla
        return Object.values(dailyForecasts).map(day => ({
            date: day.date,
            maxTemp: Math.round(Math.max(...day.temperatures)),
            minTemp: Math.round(Math.min(...day.temperatures)),
            avgTemp: Math.round(day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length),
            description: day.descriptions[0], // İlk açıklamayı al
            icon: day.icons[0], // İlk ikonu al
            humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
            windSpeed: Math.round((day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length) * 3.6)
        })).slice(0, 5); // İlk 5 günü al
    }
}

// Singleton pattern - tek bir instance oluştur
const weatherAPI = new WeatherAPI();