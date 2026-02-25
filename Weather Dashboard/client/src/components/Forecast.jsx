// client/src/components/Forecast.js

import React from 'react';
// We must import the child component we plan to use.
import ForecastCard from './ForecastCard';

// To build and test our list rendering, we'll create a dummy array of forecast data.
// This array mimics what we might get from a real API call for a 5-day forecast.
// Each object in the array matches the structure that our `ForecastCard` component expects as a prop.
const dummyForecastData = [
  { day: 'Mon', icon: '02d', tempHigh: 22, tempLow: 14 },
  { day: 'Tue', icon: '10d', tempHigh: 19, tempLow: 12 },
  { day: 'Wed', icon: '04d', tempHigh: 20, tempLow: 13 },
  { day: 'Thu', icon: '01d', tempHigh: 24, tempLow: 16 },
  { day: 'Fri', icon: '03d', tempHigh: 23, tempLow: 15 },
];

// This component will receive the forecast data array via props.
// We use a default value for development, just like in our other components.
function Forecast({ forecastData = [], convertTemp, units }) {
  return (
    <div className="forecast-container">
      {forecastData.map((day, index) => (
        <ForecastCard
          key={`${day.day}-${index}`}
          dayData={day}
          convertTemp={convertTemp}
          units={units}
        />
      ))}
    </div>
  );
}

export default Forecast;
