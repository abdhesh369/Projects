// client/src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import SearchForm from './components/SearchForm';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import WeatherChart from './components/WeatherChart';
import FavoritesList from './components/FavoritesList';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnitToggle from './components/UnitToggle';

import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [units, setUnits] = useState(localStorage.getItem('units') || 'metric');

  useEffect(() => {
    localStorage.setItem('units', units);
  }, [units]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
    const defaultCity = localStorage.getItem('defaultCity');
    if (defaultCity) {
      fetchWeather({ city: defaultCity });
    } else {
      // Try geolocation as fallback if no default city
      handleUseMyLocation();
    }
  }, []);

  const convertTemp = (tempInCelsius) => {
    if (units === 'metric') return Math.round(tempInCelsius);
    return Math.round((tempInCelsius * 9 / 5) + 32);
  };

  const handleSetDefault = (city) => {
    localStorage.setItem('defaultCity', city);
    alert(`${city} has been set as your default city!`);
  };

  const fetchWeather = async (params) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/weather';
      if (params.city) {
        url += `?city=${encodeURIComponent(params.city)}`;
      } else if (params.lat && params.lon) {
        url = `/api/weather/coords?lat=${params.lat}&lon=${params.lon}`;
      }

      const response = await axios.get(url);
      const data = response.data;
      setWeatherData(data);

      const cityName = data.current.city;
      const updatedHistory = [cityName, ...searchHistory.filter(item => item !== cityName)].slice(0, 5);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setError("Unable to retrieve your location");
      }
    );
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
                  <div className="header-top">
                    <h1>Weather Dashboard</h1>
                    <UnitToggle units={units} setUnits={setUnits} />
                  </div>
                  <div className="search-container">
                    <SearchForm onSearch={(city) => fetchWeather({ city })} />
                    <button className="btn-location" onClick={handleUseMyLocation} title="Use my current location">
                      Use My Location
                    </button>
                  </div>
                  {searchHistory.length > 0 && (
                    <div className="search-history">
                      <h3>Recent Searches</h3>
                      <ul className="history-list">
                        {searchHistory.map(city => (
                          <li
                            key={city}
                            className="history-item"
                            onClick={() => fetchWeather({ city })}
                          >
                            {city}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <FavoritesList onCityClick={(city) => fetchWeather({ city })} />
                </header>
                <main>
                  {loading && <p className="loading-message">Loading...</p>}
                  {error && !loading && <p className="error-message">{error}</p>}
                  {weatherData && !loading && !error && (
                    <>
                      <CurrentWeather
                        weatherData={weatherData.current}
                        onSetDefault={handleSetDefault}
                        convertTemp={convertTemp}
                        units={units}
                      />
                      <Forecast
                        forecastData={weatherData.forecast}
                        convertTemp={convertTemp}
                        units={units}
                      />
                      {(() => {
                        const chartData = weatherData.forecast.map(day => ({
                          name: day.day,
                          temperature: convertTemp(day.tempHigh),
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