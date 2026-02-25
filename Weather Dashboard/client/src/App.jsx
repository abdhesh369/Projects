import React, { useEffect } from "react";
import SearchForm from "./components/SearchForm";
import CurrentWeather from "./components/CurrentWeather";
import WeatherChart from './components/WeatherChart';
import Forecast from "./components/Forecast";
import "./App.css";

function App() {

const [weatherData, setWeatherData] = React.useState(null);
const [loading, setloading] = React.useState(false);
const [error, setError] = React.useState(null);

const [searchHistory, setSearchHistory] = React.useState([]);

useEffect(() => {
  const storedHistory = localStorage.getItem('searchHistory');
  if (storedHistory) {
    setSearchHistory(JSON.parse(storedHistory));
  }
}, []);


const handleSetDefault = (city) => {
  localStorage.setItem('defaultCity', city);
  alert(`${city} has been set as your default city!`);
};

useEffect(() => {
  const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
    const defaultCity = localStorage.getItem('defaultCity');
    if (defaultCity) {
      fetchWeather(defaultCity);
    }
  }, []);



const fetchWeather = async (city) => {
  setloading(true);
  setError(null);
  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    setWeatherData(data);
    const newCity = data.current.city;
    const updatedHistory = [newCity, ...searchHistory.filter(item => item !== newCity)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));


  } catch (err) {
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
  } finally {
    setloading(false);
  }
};

  return (
   <div className="App">
      <header>
        <h1>Weather Dashboard</h1>
        <SearchForm onSearch={fetchWeather} />
        {searchHistory.length > 0 && (
          <div className="search-history">
            <h3>Recent Searches</h3>
            <ul className="history-list">
              {searchHistory.map(city => (
                <li 
                  key={city} 
                  className="history-item"
                  onClick={() => fetchWeather(city)}
                >
                  {city}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
      <main>
        {loading && <p className="loading-message">Loading...</p>}
        {error && !loading && <p className="error-message">{error}</p>}
        
        {weatherData && !loading && !error && (
          <>
            
            <CurrentWeather weatherData={weatherData.current} onSetDefault={handleSetDefault} />
            
            <Forecast forecastData={weatherData.forecast} />
             {(() => {
              const chartData = weatherData.forecast.map(day => ({
                name: day.day,
                temperature: Math.round(day.tempHigh)
              }));
              return <WeatherChart data={chartData} />;
            })()}
          </>
        )}
      </main>
    </div>
  );
}
export default App;
