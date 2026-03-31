import { CONFIG } from '../constants/config';

// Weather Service
export const getWeather = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();
    if (data.cod !== 200) throw new Error(data.message);
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
  } catch (error) {
    console.error('Weather API Error:', error);
    return null;
  }
};

export const getWeatherForecast = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric&cnt=5`
    );
    const data = await response.json();
    return data.list.map(item => ({
      date: new Date(item.dt * 1000).toLocaleDateString(),
      temp: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
    }));
  } catch (error) {
    console.error('Forecast API Error:', error);
    return [];
  }
};

// Currency Service
export const getExchangeRates = async (baseCurrency = 'USD') => {
  try {
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${baseCurrency}`
    );
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Exchange Rate API Error:', error);
    return null;
  }
};

export const convertCurrency = (amount, fromRate, toRate) => {
  return (amount / fromRate) * toRate;
};

// Unsplash Image Service
export const getDestinationImage = async (destination) => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination + ' travel')}&per_page=5&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results.map(photo => photo.urls.regular);
    }
    return [];
  } catch (error) {
    console.error('Unsplash API Error:', error);
    return [];
  }
};
