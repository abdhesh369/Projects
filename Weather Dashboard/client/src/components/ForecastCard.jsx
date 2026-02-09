// client/src/components/ForecastCard.js

import React from 'react';

// To build our component in isolation, we'll create a dummy data object.
// This represents the data for a single day in the forecast.
const dummyForecastData = {
  day: "Tue",
  icon: "10d", // Example icon code for 'rain'
  tempHigh: 19,
  tempLow: 12,
};

function ForecastCard({ dayData = dummyForecastData }) {
  const { day, icon, tempHigh, tempLow } = dayData;

  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    
    <div className="forecast-card">
      <h3 className="forecast-day">{day}</h3>
      <img src={iconUrl} alt="Weather icon" className="forecast-icon" />
      <div className="forecast-temps">
        <span className="temp-high">{Math.round(tempHigh)}°</span>
        <span className="temp-low">{Math.round(tempLow)}°</span>
      </div>
    </div>
  );
}

export default ForecastCard;