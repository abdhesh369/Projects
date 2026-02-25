import React from 'react';

function UnitToggle({ units, setUnits }) {
    return (
        <div className="unit-toggle">
            <button
                className={units === 'metric' ? 'active' : ''}
                onClick={() => setUnits('metric')}
            >
                °C
            </button>
            <button
                className={units === 'imperial' ? 'active' : ''}
                onClick={() => setUnits('imperial')}
            >
                °F
            </button>
        </div>
    );
}

export default UnitToggle;
