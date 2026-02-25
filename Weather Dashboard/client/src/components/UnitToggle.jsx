function UnitToggle({ units, setUnits }) {
    return (
        <div className="unit-toggle animate-fade">
            <button
                className={units === 'metric' ? 'active' : ''}
                onClick={() => setUnits('metric')}
            >
                Metric
            </button>
            <button
                className={units === 'imperial' ? 'active' : ''}
                onClick={() => setUnits('imperial')}
            >
                Imperial
            </button>
        </div>
    );
}

export default UnitToggle;
