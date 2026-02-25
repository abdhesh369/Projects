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
  if (!condition) return <WiDayCloudy />;
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
    <div className="forecast-card">
      <h3 className="forecast-day">{day}</h3>
      <div className="forecast-icon">
        {getWeatherIcon(condition)}
      </div>
      <div className="forecast-temps">
        <span className="temp-high">{convertTemp(tempHigh)}°</span>
        <span className="temp-low">{convertTemp(tempLow)}°</span>
      </div>
    </div>
  );
}

export default ForecastCard;