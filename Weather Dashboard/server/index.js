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

    const rawData = weatherResponse.data;
    const processedWeatherData = {
      city: rawData.name,
      country: rawData.sys.country,
      temperature: rawData.main.temp,
      feelsLike: rawData.main.feels_like,
      humidity: rawData.main.humidity,
      windSpeed: rawData.wind.speed,
      condition: rawData.weather[0].main,
      description: rawData.weather[0].description,
      icon: rawData.weather[0].icon,
    };

    res.json(processedWeatherData);

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