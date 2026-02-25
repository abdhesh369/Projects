import connectDB from './db.js';
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import favoritesRoutes from './routes/favorites.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
app.use(express.json());


const fetchWeatherData = async (params) => {
  const apiKey = process.env.WEATHER_API_KEY;
  let url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${apiKey}`;

  if (params.city) {
    url += `&q=${encodeURIComponent(params.city)}`;
  } else if (params.lat && params.lon) {
    url += `&lat=${params.lat}&lon=${params.lon}`;
  } else {
    throw new Error('Missing location parameters');
  }

  const weatherResponse = await axios.get(url);
  const forecastData = weatherResponse.data;

  const currentWeatherData = {
    city: forecastData.city.name,
    country: forecastData.city.country,
    temperature: forecastData.list[0].main.temp,
    feelsLike: forecastData.list[0].main.feels_like,
    humidity: forecastData.list[0].main.humidity,
    windSpeed: forecastData.list[0].wind.speed,
    condition: forecastData.list[0].weather[0].main,
    description: forecastData.list[0].weather[0].description,
    icon: forecastData.list[0].weather[0].icon,
  };

  const dailyForecasts = {};
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temps: [],
        icons: new Set(),
        conditions: new Set(),
      };
    }

    dailyForecasts[date].temps.push(item.main.temp);
    dailyForecasts[date].icons.add(item.weather[0].icon);
    dailyForecasts[date].conditions.add(item.weather[0].main);
  });

  const processedForecast = Object.values(dailyForecasts).map(dayData => ({
    day: dayData.day,
    tempHigh: Math.max(...dayData.temps),
    tempLow: Math.min(...dayData.temps),
    icon: dayData.icons.values().next().value,
    condition: dayData.conditions.values().next().value,
  })).slice(0, 5);

  return {
    current: currentWeatherData,
    forecast: processedForecast
  };
};

app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: 'City parameter is required' });

    const data = await fetchWeatherData({ city });
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'City not found.' });
    }
    res.status(500).json({ message: 'An error occurred while fetching weather data.' });
  }
});

app.get('/api/weather/coords', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'Latitude and longitude are required' });

    const data = await fetchWeatherData({ lat, lon });
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather data by coords:', error.message);
    res.status(500).json({ message: 'An error occurred while fetching weather data.' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});