import { useState } from "react";
import { FiSearch } from "react-icons/fi";

function SearchForm({ onSearch }) {
    const [city, setCity] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        if (city.trim()) {
            onSearch(city);
            setCity("");
        }
    };

    return (
        <form className="search-form animate-fade" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Search city..."
                className="search-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <button className="search-button">
                <FiSearch size={20} />
            </button>
        </form>
    )
}

export default SearchForm;
