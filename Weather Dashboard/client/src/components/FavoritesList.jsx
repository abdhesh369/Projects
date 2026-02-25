import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function FavoritesList({ onCityClick }) {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, isAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [isAuthenticated, token]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/favorites', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFavorites(response.data);
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setError('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (city, e) => {
        e.stopPropagation();
        try {
            const response = await axios.delete('/api/favorites', {
                data: { city },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFavorites(response.data);
        } catch (err) {
            console.error('Error removing favorite:', err);
            alert('Failed to remove favorite');
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="favorites-list">
            <h3>Your Favorite Cities</h3>
            {loading && <p>Loading favorites...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && favorites.length === 0 && <p>No favorite cities added yet.</p>}
            <ul className="history-list">
                {favorites.map((city) => (
                    <li
                        key={city}
                        className="history-item favorite-item"
                        onClick={() => onCityClick(city)}
                    >
                        {city}
                        <button
                            className="btn-remove-favorite"
                            onClick={(e) => handleRemoveFavorite(city, e)}
                            title="Remove from favorites"
                        >
                            ×
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FavoritesList;
