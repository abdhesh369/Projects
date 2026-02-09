require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();



app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: 'City parameter is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

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
      const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temps: [],
          icons: new Set(),
        };
      }
      
      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].icons.add(item.weather[0].icon);
    });



    const processedForecast = Object.values(dailyForecasts).map(dayData => ({
      day: dayData.day,
      tempHigh: Math.max(...dayData.temps),
      tempLow: Math.min(...dayData.temps),
      icon: dayData.icons.values().next().value, 
    })).slice(0, 5);

    res.json(processedForecast);

  } catch (error) {
    console.error('Error fetching weather data:', error.response ? error.response.data : error.message);

    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'City not found. Please check the spelling and try again.' });
    }

    res.status(500).json({ message: 'An error occurred while fetching weather data.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});