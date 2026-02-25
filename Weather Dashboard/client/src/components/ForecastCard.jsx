import React from 'react';
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiDayCloudy,
} from "react-icons/wi";

const getWeatherIcon = (condition) => {
  if (!condition) return <WiDaySunny />;
  switch (condition.toLowerCase()) {
    case "clear":
      return <WiDaySunny />;
    case "clouds":
      return <WiCloudy />;
    case "rain":
    case "drizzle":
      return <WiRain />;
    case "snow":
      return <WiSnow />;
    case "thunderstorm":
      return <WiThunderstorm />;
    case "fog":
    case "mist":
    case "haze":
      return <WiFog />;
    default:
      return <WiDayCloudy />;
  }
};

function ForecastCard({ dayData, convertTemp, units }) {
  const { day, tempHigh, tempLow, condition } = dayData;

  return (
    <div className="forecast-card glass-card animate-fade">
      <h3 className="forecast-day">{day}</h3>
      <div className="forecast-icon">
        {getWeatherIcon(condition)}
      </div>
      <div className="forecast-temps" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: '500', marginTop: '1rem' }}>
        <span className="temp-high" style={{ color: '#fff' }}>{convertTemp(tempHigh)}°</span>
        <span style={{ opacity: 0.3, fontWeight: '300' }}>/</span>
        <span className="temp-low" style={{ color: 'rgba(255,255,255,0.6)' }}>{convertTemp(tempLow)}°</span>
      </div>
    </div>
  );
}

export default ForecastCard;