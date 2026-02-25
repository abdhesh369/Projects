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

function CurrentWeather({ weatherData, onSetDefault, convertTemp, units }) {
  const { isAuthenticated, token } = useContext(AuthContext);

  const {
    city,
    country,
    temperature,
    description,
    condition,
    humidity,
    windSpeed,
    feelsLike,
  } = weatherData;

  const handleAddToFavorites = async () => {
    try {
      await axios.post(
        "/api/favorites",
        { city: `${city}, ${country}` },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`${city} added to favorites!`);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert("Failed to add city to favorites.");
    }
  };

  const unitLabel = units === 'metric' ? '°C' : '°F';

  return (
    <>
      <div className="current-weather">
        <h2 className="city-name">
          {city}, {country}
        </h2>
        <div className="weather-main">
          <div className="weather-icon-large">
            {getWeatherIcon(condition)}
          </div>
          <p className="temperature">{convertTemp(temperature)}{unitLabel}</p>
        </div>
        <p className="weather-description">{description}</p>
        <div className="weather-details">
          <p>Feels like: {convertTemp(feelsLike)}{unitLabel}</p>
          <p>Humidity: {humidity}%</p>
          <p>Wind: {windSpeed} m/s</p>
        </div>
        <div className="weather-actions">
          <button onClick={() => onSetDefault(city)} className="btn-set-default">
            Set as Default
          </button>
          {isAuthenticated && (
            <button onClick={handleAddToFavorites} className="btn-add-favorite">
              Add to Favorites
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default CurrentWeather;
