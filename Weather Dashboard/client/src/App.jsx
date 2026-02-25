// client/src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import SearchForm from './components/SearchForm';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import WeatherChart from './components/WeatherChart';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

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

  const handleSetDefault = (city) => {
    localStorage.setItem('defaultCity', city);
    alert(`${city} has been set as your default city!`);
  };

  const fetchWeather = async (city) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <>
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
                          temperature: Math.round(day.tempHigh),
                        }));
                        return <WeatherChart data={chartData} />;
                      })()}
                    </>
                  )}
                </main>
              </>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;