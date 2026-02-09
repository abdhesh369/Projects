function SearchForm() {
    return (
        <form className="search-form">

            <input
                type="text"
                placeholder="Enter city name..."
                className="search-input"
            />
            <button className="search-button">Search</button>

        </form>
    )
}

export default SearchForm;
