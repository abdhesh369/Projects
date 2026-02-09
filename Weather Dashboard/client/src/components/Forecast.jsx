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
function Forecast({ forecastData = dummyForecastData }) {
  return (
    <div className="forecast-container">
      {/* We use the standard JavaScript .map() function to iterate over our forecastData array. */}
      {/* For each `day` object in the array, we return a <ForecastCard> component. */}
      {forecastData.map((day, index) => (
        // This is the core of list rendering in React.
        <ForecastCard
          // The `key` prop is crucial for React's performance and stability.
          // It helps React identify which items have changed, are added, or are removed.
          // Keys should be stable, predictable, and unique among their siblings.
          // For now, the day name + index is a decent unique key. In a real app, you'd use a unique ID from the API.
          key={`${day.day}-${index}`}
          // We pass the individual `day` object as the `dayData` prop to the ForecastCard.
          // This is how each card gets its unique information to display.
          dayData={day}
        />
      ))}
    </div>
  );
}

export default Forecast;
