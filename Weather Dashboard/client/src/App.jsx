import SearchForm from "./components/SearchForm";
import CurrentWeather from "./components/CurrentWeather";
import Forecast from "./components/Forecast";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header>
        <h1>Weather Dashboard</h1>
        <SearchForm />
      </header>
      <main>
        <CurrentWeather />
        <Forecast />
      </main>
    </div>
  );
}
export default App;
