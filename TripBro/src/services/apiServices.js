import { CONFIG } from '../constants/config';

// ─── HELPER ───────────────────────────────────────────────────────────────────
const isInvalidKey = (key) => !key || key.includes('your-');

const NO_WEATHER  = isInvalidKey(CONFIG.OPENWEATHER_API_KEY);
const NO_UNSPLASH = isInvalidKey(CONFIG.UNSPLASH_ACCESS_KEY);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_WEATHER = {
  temp: 24,
  feelsLike: 26,
  description: 'partly cloudy',
  icon: '02d',
  humidity: 65,
  windSpeed: 3.2,
  city: 'Your Destination',
  country: 'World',
};

const MOCK_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5,
  JPY: 149.5, AUD: 1.53, CAD: 1.36, SGD: 1.34,
  AED: 3.67, THB: 35.1, MYR: 4.72, IDR: 15800,
};

// ─── WEATHER ──────────────────────────────────────────────────────────────────
export const getWeather = async (city) => {
  if (NO_WEATHER) {
    console.log('Using mock weather: No API key');
    return { ...MOCK_WEATHER, city };
  }
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`
    );
    const data = await res.json();
    if (data.cod !== 200) return { ...MOCK_WEATHER, city };
    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      city: data.name,
      country: data.sys.country,
    };
  } catch (err) {
    console.warn('Weather API failed, using mock:', err.message);
    return { ...MOCK_WEATHER, city };
  }
};

export const getWeatherForecast = async (city) => {
  if (NO_WEATHER) {
    return ['Mon','Tue','Wed','Thu','Fri'].map((d, i) => ({
      date: d,
      temp: 22 + i,
      description: 'sunny',
      icon: '01d',
    }));
  }
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric&cnt=5`
    );
    const data = await res.json();
    if (data.cod !== "200") throw new Error(data.message);
    return (data.list || []).map(item => ({
      date: new Date(item.dt * 1000).toLocaleDateString(),
      temp: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
    }));
  } catch (err) {
    console.warn('Forecast API failed:', err.message);
    return [];
  }
};

// ─── CURRENCY ─────────────────────────────────────────────────────────────────
export const getExchangeRates = async (baseCurrency = 'USD') => {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    const data = await res.json();
    return data.rates || MOCK_RATES;
  } catch (err) {
    console.warn('Currency API failed, using mock rates:', err.message);
    return MOCK_RATES;
  }
};

export const convertCurrency = (amount, fromRate, toRate) =>
  (amount / fromRate) * toRate;

// ─── UNSPLASH ─────────────────────────────────────────────────────────────────
export const getDestinationImage = async (destination) => {
  if (NO_UNSPLASH) return [];
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination + ' travel')}&per_page=5&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}`
    );
    const data = await res.json();
    return (data.results || []).map(p => p.urls.regular);
  } catch (err) {
    console.warn('Unsplash API failed:', err.message);
    return [];
  }
};
