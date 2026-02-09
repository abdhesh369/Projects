import React from "react";

const dummyWeatherData = {
  city: "London",
  country: "GB",
  temperature: 15,
  description: "clear sky",
  icon: "01d", 
  humidity: 87,
  windSpeed: 4.63,
  feelsLike: 14.3
};

function CurrentWeather({ weatherData = dummyWeatherData }) {
  const { city, country, temperature, description, icon, humidity, windSpeed, feelsLike } = weatherData;

  
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    
    <div className="current-weather">
      <h2 className="city-name">{city}, {country}</h2>
      <div className="weather-main">
        <img src={iconUrl} alt={description} className="weather-icon" />
        <p className="temperature">{Math.round(temperature)}°C</p>
      </div>
      <p className="weather-description">{description}</p>
      <div className="weather-details">
        <p>Feels like: {Math.round(feelsLike)}°C</p>
        <p>Humidity: {humidity}%</p>
        <p>Wind: {windSpeed} m/s</p>
      </div>
    </div>
  );
}

export default CurrentWeather;