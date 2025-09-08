/**
 * Mini Chatbot Modülü
 * Hava durumu verilerine göre akıllı cevaplar verir
 */

class WeatherChatbot {
    constructor() {
        this.currentWeatherData = null;
        this.responses = {
            greetings: [
                "Merhaba! Hava durumu hakkında size nasıl yardımcı olabilirim?",
                "Selam! Bugünkü hava için önerilerim var!",
                "İyi günler! Hava durumu konusunda sorularınızı bekliyorum!"
            ]
        };
    }

    /**
     * Hava durumu verilerini güncelle
     */
    updateWeatherData(weatherData) {
        this.currentWeatherData = weatherData;
        console.log('🤖 Chatbot hava durumu verisi güncellendi');
    }

    /**
     * Soruya göre cevap oluştur
     */
    getResponse(question) {
        if (!this.currentWeatherData) {
            return "Önce bir şehir seçmeniz gerekiyor! 🌍";
        }

        const temp = this.currentWeatherData.current.temperature;
        const condition = this.currentWeatherData.current.condition;
        const humidity = this.currentWeatherData.current.humidity;
        const windSpeed = this.currentWeatherData.wind.speed;
        const description = this.currentWeatherData.current.description;

        switch (question) {
            case "Bugün ne giymeliyim?":
                return this.getClothingAdvice(temp, condition, windSpeed);
            
            case "Şemsiye almalı mıyım?":
                return this.getUmbrellaAdvice(condition, description);
            
            case "Sürüş koşulları nasıl?":
                return this.getDrivingAdvice(condition, temp, windSpeed);
            
            case "Spor yapmak için uygun mu?":
                return this.getSportsAdvice(temp, condition, windSpeed, humidity);
            
            case "Akşam hava soğur mu?":
                return this.getEveningAdvice(temp, condition);
            
            default:
                return "Bu konuda size yardımcı olamam. Lütfen hazır sorulardan birini seçin! 😊";
        }
    }

    /**
     * Giysi önerisi
     */
    getClothingAdvice(temp, condition, windSpeed) {
        let advice = "";
        let emoji = "";

        if (temp > 30) {
            advice = "Hava çok sıcak! 🔥 Hafif, nefes alabilir kumaşlar tercih edin. Pamuklu tişört, şort veya ince elbise giyin. Güneş kremi ve şapka unutmayın!";
            emoji = "👕🩳";
        } else if (temp > 25) {
            advice = "Hava sıcak ve güzel! ☀️ Tişört, hafif pantolon veya etek giyebilirsiniz. Güneş gözlüğü almayı unutmayın!";
            emoji = "👕👖";
        } else if (temp > 20) {
            advice = "Hava ılık! 🌤️ Uzun kollu tişört veya hafif bir hırka yeterli olacaktır.";
            emoji = "👔";
            if (windSpeed > 20) {
                advice += " Rüzgarlı olduğu için hafif bir ceket alın.";
            }
        } else if (temp > 15) {
            advice = "Hava serin! 🍂 Sweatshirt, hırka veya hafif ceket giyin. Katmanlı giyim önerilir.";
            emoji = "🧥";
        } else if (temp > 10) {
            advice = "Hava soğuk! ❄️ Kalın kazak veya mont gerekli. Boyunluk veya atkı da alabilirsiniz.";
            emoji = "🧥🧣";
        } else if (temp > 0) {
            advice = "Hava çok soğuk! 🥶 Kalın mont, kazak, eldiven, atkı ve bere şart! Katmanlı giyinin.";
            emoji = "🧥🧤🧣";
        } else {
            advice = "Hava dondurucu! 🧊 En kalın kıyafetlerinizi giyin. Mont, kazak, termal iç çamaşırı, eldiven, atkı ve bere mutlaka gerekli!";
            emoji = "🧥🧤🧣🧢";
        }

        // Hava durumuna göre ek öneriler
        if (condition === "Rain" || condition === "Drizzle") {
            advice += " Su geçirmez bir mont veya yağmurluk giymeyi unutmayın! ☔";
        } else if (condition === "Snow") {
            advice += " Su geçirmez bot ve kaygan olmayan tabanlar tercih edin! ⛄";
        } else if (condition === "Thunderstorm") {
            advice += " Fırtına var, mümkünse dışarı çıkmayın! ⛈️";
        }

        return `${emoji} ${advice}`;
    }

    /**
     * Şemsiye önerisi
     */
    getUmbrellaAdvice(condition, description) {
        const rainConditions = ["Rain", "Drizzle", "Thunderstorm"];
        const lightRainKeywords = ["hafif", "çiseleyen", "yer yer"];
        
        if (rainConditions.includes(condition)) {
            if (condition === "Thunderstorm") {
                return "⛈️ Şiddetli fırtına bekleniyor! Şemsiye yerine sağlam bir yağmurluk tercih edin ve mümkünse dışarı çıkmayın.";
            } else if (condition === "Drizzle" || lightRainKeywords.some(keyword => description.includes(keyword))) {
                return "🌦️ Hafif yağmur bekleniyor. Şemsiye alın ama küçük bir şemsiye yeterli olabilir.";
            } else {
                return "☔ Yağmur kesin! Şemsiyenizi mutlaka yanınıza alın. Kapüşonlu bir mont da iyi alternatif olabilir.";
            }
        } else if (condition === "Clouds") {
            return "☁️ Bulutlu ama şimdilik yağmur yok. Güvenlik için küçük bir şemsiye alabilirsiniz.";
        } else {
            return "☀️ Güneşli hava! Şemsiye gerekli değil ama güneş şemsiyesi düşünebilirsiniz.";
        }
    }

    /**
     * Sürüş önerisi
     */
    getDrivingAdvice(condition, temp, windSpeed) {
        let advice = "🚗 Sürüş koşulları: ";
        let riskLevel = "Düşük";

        if (condition === "Snow") {
            advice += "⛄ Kar yağışı nedeniyle yollar kaygan! Kış lastiği takın, yavaş gidin ve ani fren yapmayın.";
            riskLevel = "Yüksek";
        } else if (condition === "Thunderstorm") {
            advice += "⛈️ Fırtına nedeniyle görüş mesafesi çok düşük! Mümkünse sürüşü erteleyin.";
            riskLevel = "Çok Yüksek";
        } else if (condition === "Rain") {
            advice += "☔ Yağmur nedeniyle yollar kaygan olabilir. Mesafeyi artırın ve dikkatli olun.";
            riskLevel = "Orta";
        } else if (condition === "Fog" || condition === "Mist") {
            advice += "🌫️ Sis nedeniyle görüş mesafesi düşük. Farları açın ve yavaş gidin.";
            riskLevel = "Orta";
        } else if (windSpeed > 40) {
            advice += "💨 Şiddetli rüzgar! Direksiyon kontrolünü kaybetmeyin, özellikle köprülerde dikkatli olun.";
            riskLevel = "Orta";
        } else if (temp < 5) {
            advice += "🧊 Buzlanma riski var! Yavaş gidin ve ani manevra yapmayın.";
            riskLevel = "Orta";
        } else {
            advice += "✅ İyi koşullar! Normal sürüş yapabilirsiniz.";
            riskLevel = "Düşük";
        }

        return `${advice}\n\n🎯 Risk Seviyesi: ${riskLevel}`;
    }

    /**
     * Spor önerisi
     */
    getSportsAdvice(temp, condition, windSpeed, humidity) {
        let advice = "🏃‍♂️ Spor durumu: ";
        let recommendation = "";

        // Sıcaklık değerlendirmesi
        if (temp > 35) {
            advice += "🔥 Çok sıcak! Açık havada spor yapmanız önerilmez.";
            recommendation = "Kapalı alan sporları tercih edin.";
        } else if (temp > 30) {
            advice += "☀️ Sıcak ama yapılabilir. Erken sabah veya akşam saatlerini tercih edin.";
            recommendation = "Bol su için ve güneş kremi sürün.";
        } else if (temp > 15 && temp <= 25) {
            advice += "🌟 Mükemmel spor havası! İdeal sıcaklık.";
            recommendation = "Tüm outdoor sporlar için harika!";
        } else if (temp > 5) {
            advice += "🍂 Serin ama uygun. Isınma hareketlerine önem verin.";
            recommendation = "Katmanlı giyim ve iyi ısınma önemli.";
        } else {
            advice += "❄️ Çok soğuk! Kapalı alan sporları tercih edin.";
            recommendation = "Dışarıda spor yapacaksanız çok iyi giyinin.";
        }

        // Hava durumu koşulları
        if (condition === "Rain" || condition === "Drizzle") {
            advice += "\n☔ Yağmur var! Kapalı alan sporları önerilir.";
        } else if (condition === "Thunderstorm") {
            advice += "\n⛈️ Fırtına! Kesinlikle dışarıda spor yapmayın.";
        } else if (condition === "Snow") {
            advice += "\n⛄ Kar yağışı! Kış sporları için ideal ama kaygan zemin dikkat.";
        } else if (windSpeed > 30) {
            advice += "\n💨 Çok rüzgarlı! Açık havada spor zor olabilir.";
        }

        // Nem oranı değerlendirmesi
        if (humidity > 80) {
            advice += "\n💧 Nem oranı yüksek, daha çabuk yorulabilirsiniz.";
        }

        return `${advice}\n\n💡 Önerim: ${recommendation}`;
    }

    /**
     * Akşam hava durumu tahmini
     */
    getEveningAdvice(temp, condition) {
        let advice = "🌅 Akşam hava durumu: ";
        
        // Mevsime göre genel eğilim
        const month = new Date().getMonth();
        const isWinter = month === 11 || month === 0 || month === 1;
        const isSummer = month === 5 || month === 6 || month === 7;
        const isSpring = month === 2 || month === 3 || month === 4;
        const isAutumn = month === 8 || month === 9 || month === 10;

        // Sıcaklık bazlı tahmin
        if (temp > 25) {
            if (isSummer) {
                advice += "Akşam hala sıcak olacak, ama hafif serinleyebilir. ";
            } else {
                advice += "Akşam biraz serinleyecek, hafif bir hırka alın. ";
            }
        } else if (temp > 15) {
            if (isWinter) {
                advice += "Akşam soğuyacak, mont almayı unutmayın. ";
            } else {
                advice += "Akşam serin olacak, ceket gerekebilir. ";
            }
        } else if (temp > 5) {
            advice += "Akşam oldukça soğuk olacak, kalın kıyafet gerekli. ";
        } else {
            advice += "Akşam çok soğuk olacak, en kalın kıyafetlerinizi giyin. ";
        }

        // Hava durumu koşullarına göre
        if (condition === "Clear") {
            advice += "☀️ Güneşli bir akşam bekleniyor!";
        } else if (condition === "Clouds") {
            advice += "☁️ Bulutlu bir akşam olacak.";
        } else if (condition === "Rain") {
            advice += "☔ Akşam yağmur devam edebilir.";
        } else if (condition === "Snow") {
            advice += "⛄ Kar yağışı akşam da sürebilir.";
        }

        // Mevsimsel öneriler
        if (isSpring) {
            advice += "\n🌸 İlkbahar akşamları değişken olabilir, yanınıza hafif bir ceket alın.";
        } else if (isAutumn) {
            advice += "\n🍂 Sonbahar akşamları serin geçer, ısınabilecek bir şeyler alın.";
        } else if (isWinter) {
            advice += "\n❄️ Kış akşamları erken kararır ve soğuk geçer.";
        } else if (isSummer) {
            advice += "\n☀️ Yaz akşamları genelde güzel geçer!";
        }

        return advice;
    }

    /**
     * Rastgele selamlama mesajı
     */
    getRandomGreeting() {
        const randomIndex = Math.floor(Math.random() * this.responses.greetings.length);
        return this.responses.greetings[randomIndex];
    }

    /**
     * Hava durumu özeti oluştur
     */
    getWeatherSummary() {
        if (!this.currentWeatherData) {
            return "Hava durumu verisi bulunamadı.";
        }

        const { current, city, wind } = this.currentWeatherData;
        
        return `📍 ${city.name}, ${city.country}
🌡️ Sıcaklık: ${current.temperature}°C (Hissedilen: ${current.feelsLike}°C)
🌤️ Durum: ${current.description}
💧 Nem: ${current.humidity}%
💨 Rüzgar: ${wind.speed} km/h
👁️ Görüş: ${current.visibility} km`;
    }

    /**
     * Günün önerisi
     */
    getDayRecommendation() {
        if (!this.currentWeatherData) {
            return "Önce bir şehir seçin! 🌍";
        }

        const { current } = this.currentWeatherData;
        const temp = current.temperature;
        const condition = current.condition;

        let recommendation = "🎯 Bugün için önerim: ";

        if (condition === "Clear" && temp > 20 && temp < 30) {
            recommendation += "Mükemmel bir gün! Açık havada vakit geçirin, piknik yapın veya yürüyüş yapın! 🌞";
        } else if (condition === "Rain") {
            recommendation += "Yağmurlu bir gün. Evde rahat vakit geçirin, kitap okuyun veya film izleyin! ☔📚";
        } else if (condition === "Snow") {
            recommendation += "Karlı bir gün! Sıcak içecekler için ve kar manzarasının tadını çıkarın! ⛄☕";
        } else if (temp > 30) {
            recommendation += "Çok sıcak! Gölgede vakit geçirin, bol su için ve serin yerleri tercih edin! 🏖️";
        } else if (temp < 5) {
            recommendation += "Çok soğuk! Sıcak kalın, sıcak içecekler için ve kapalı aktiviteler yapın! 🏠☕";
        } else {
            recommendation += "Normal bir gün. Aktivitelerinizi rahatlıkla yapabilirsiniz! 😊";
        }

        return recommendation;
    }

    /**
     * Sağlık önerisi
     */
    getHealthAdvice() {
        if (!this.currentWeatherData) {
            return "Hava durumu verisi gerekli! 🌍";
        }

        const { current } = this.currentWeatherData;
        const temp = current.temperature;
        const humidity = current.humidity;
        const condition = current.condition;

        let advice = "🏥 Sağlık önerisi: ";

        if (temp > 35) {
            advice += "Çok sıcak! Çok su için, gölgede kalın ve ağır aktivitelerden kaçının. Sıcak çarpması riski! 🌡️💧";
        } else if (temp < 0) {
            advice += "Dondurucu soğuk! Vücut ısısını koruyun, ekstremiteleri koruyun. Hipotermiye dikkat! 🧊🧥";
        } else if (humidity > 80) {
            advice += "Yüksek nem! Nefes almakta zorluk çekebilirsiniz. Astım hastalarının dikkatli olması gerekiyor. 💧😷";
        } else if (condition === "Fog" || condition === "Mist") {
            advice += "Sisli hava! Görüş bozukluğu ve nem nedeniyle solunum sorunları artabilir. 🌫️";
        } else if (condition === "Clear" && temp > 25) {
            advice += "Güneşli! UV ışınlarından korunun, güneş kremi sürün. D vitamini sentezi için güzel! ☀️🧴";
        } else {
            advice += "Sağlık açısından uygun bir hava! Normal aktivitelerinizi yapabilirsiniz. ✅";
        }

        return advice;
    }
}

// Event listener'lar için yardımcı fonksiyonlar
class ChatbotUI {
    constructor() {
        this.chatbot = new WeatherChatbot();
        this.responseElement = document.getElementById('chatbotResponse');
        this.responseTextElement = document.getElementById('responseText');
        this.questionButtons = document.querySelectorAll('.question-btn');
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.questionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const question = e.currentTarget.getAttribute('data-question');
                this.handleQuestion(question);
            });
        });
    }

    handleQuestion(question) {
        const response = this.chatbot.getResponse(question);
        this.showResponse(response);
        
        // Aktif button'u belirgin yap
        this.questionButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-question="${question}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    showResponse(response) {
        this.responseTextElement.textContent = response;
        this.responseElement.style.display = 'block';
        
        // Animasyon için kısa gecikme
        setTimeout(() => {
            this.responseElement.classList.add('show');
        }, 100);
    }

    hideResponse() {
        this.responseElement.classList.remove('show');
        setTimeout(() => {
            this.responseElement.style.display = 'none';
        }, 500);
    }

    updateWeatherData(weatherData) {
        this.chatbot.updateWeatherData(weatherData);
    }
}

// Aktif button için CSS
const chatbotStyle = document.createElement('style');
chatbotStyle.textContent = `
    .question-btn.active {
        background: rgba(255, 255, 255, 0.3) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
`;
document.head.appendChild(chatbotStyle);

// Global chatbot instance'ı oluştur
const chatbotUI = new ChatbotUI();