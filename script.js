// Map initialization
const map = L.map('map').setView([14.5995, 120.9842], 5); // Default center over the Philippines

// Add Carto tile layer with English labels
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 18
}).addTo(map);

// Hide map container initially
document.getElementById('map').style.display = 'none';

// Toggle map visibility
document.getElementById('toggleMap').addEventListener('click', () => {
    const mapContainer = document.getElementById('map');
    const isMapVisible = mapContainer.style.display === 'block';
    mapContainer.style.display = isMapVisible ? 'none' : 'block';
    if (!isMapVisible) {
        setTimeout(() => map.invalidateSize(), 0);
    }
});

// Handle map click to get weather based on coordinates
map.on('click', function(event) {
    const lat = event.latlng.lat;
    const lon = event.latlng.lng;
    getCityAndCountryName(lat, lon);
});

// Fetch city and country name by coordinates
function getCityAndCountryName(lat, lon) {
    const geocodingApiKey = '3dbb9f2e6fad46c2a641a5aeae1ca72b';
    const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${geocodingApiKey}`;

    fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length === 0) throw new Error('Location not found');
            const city = data.results[0].components.city || data.results[0].components.town || data.results[0].components.village || 'Unknown City';
            const country = data.results[0].components.country || 'Unknown Country';
            getWeatherByCoordinates(lat, lon, `${city}, ${country}`);
        })
        .catch(error => {
            document.getElementById('weatherDetails').innerHTML = `<p>${error.message}</p>`;
        });
}

// Get weather by city name from input box
document.getElementById('getWeather').addEventListener('click', () => {
    const city = document.getElementById('city').value;
    getWeatherByCityName(city);
});

// Fetch weather data using city name
function getWeatherByCityName(city) {
    const geocodingApiKey = '3dbb9f2e6fad46c2a641a5aeae1ca72b';
    const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${geocodingApiKey}`;

    fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length === 0) throw new Error('City not found');
            const lat = data.results[0].geometry.lat;
            const lon = data.results[0].geometry.lng;
            const country = data.results[0].components.country || 'Unknown Country';
            getWeatherByCoordinates(lat, lon, `${city}, ${country}`);
        })
        .catch(error => {
            document.getElementById('weatherDetails').innerHTML = `<p>${error.message}</p>`;
        });
}

// Get weather details by coordinates and display city/country
function getWeatherByCoordinates(lat, lon, locationName) {
    const tomorrowApiKey = '2pWaK4mf40GjE13tUhuGKjJHI1TbCInC'; // Second Api Key: YZJKBtaz8432Jt6mimxCIURhEhZGD108
    const weatherUrl = `https://api.tomorrow.io/v4/timelines?location=${lat},${lon}&fields=temperature,weatherCode&timesteps=current&units=metric&apikey=${tomorrowApiKey}`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            const currentWeather = data.data.timelines[0].intervals[0].values;
            const temp = currentWeather.temperature;
            const weatherCode = currentWeather.weatherCode;

            const weatherIconCode = getOpenWeatherIcon(weatherCode);
            const weatherDescription = getWeatherDescription(weatherCode);
            const stormStatus = checkStormConditions(weatherCode);

            const weatherIconUrl = `http://openweathermap.org/img/wn/${weatherIconCode}@4x.png`;
            document.getElementById('weatherIcon').src = weatherIconUrl;
            document.getElementById('weatherIcon').style.display = 'block';

            // Split the location into city and country
            const [city, country] = locationName.split(',').map(part => part.trim()); // Split by comma and trim whitespace

            let displayLocation = locationName;  // Default to showing both city and country

            // Remove country from the location string if it is the same as the country found in the location
            if (city && country && displayLocation.includes(country)) {
                displayLocation = `${city}, ${country}`; // If no redundancy, show both
            }

            document.getElementById('weatherDetails').innerHTML = `
                <h2>${displayLocation}</h2>
                <p>Temperature: ${temp}°C</p>
                <p>Conditions: ${weatherDescription}</p>
                <p id="stormStatus">${stormStatus}</p>
            `;
        })
        .catch(error => {
            document.getElementById('weatherDetails').innerHTML = `<p>${error.message}</p>`;
        });
}

// Map Tomorrow.io weather codes to OpenWeatherMap icon codes
function getOpenWeatherIcon(weatherCode) {
    const iconMap = {
        1000: '01d', // Clear
        1100: '02d', // Mostly Clear
        1101: '02d', // Partly Cloudy
        1102: '03d', // Mostly Cloudy
        1001: '04d', // Cloudy
        2100: '09d', // Light Rain
        2101: '10d', // Light Rain Showers
        2102: '10d', // Heavy Rain
        4200: '13d', // Light Snow
        4001: '13d', // Snow
        5000: '13d', // Flurries
        5001: '50d', // Fog
        6000: '11d', // Freezing Rain
        6001: '11d', // Freezing Drizzle
        7000: '11d', // Ice Pellets
        7101: '13d', // Heavy Ice Pellets
        8000: '11d'  // Thunderstorm
    };
    return iconMap[weatherCode] || '01d'; // Default to clear icon if not found
}

// Get a weather description based on Tomorrow.io weather code
function getWeatherDescription(weatherCode) {
    const descriptions = {
        1000: "Clear sky",
        1100: "Mostly clear",
        1101: "Partly cloudy",
        1102: "Mostly cloudy",
        1001: "Cloudy",
        2100: "Light rain",
        2101: "Light rain showers",
        2102: "Heavy rain",
        4200: "Light snow",
        4001: "Snow",
        5000: "Flurries",
        5001: "Fog",
        6000: "Freezing rain",
        6001: "Freezing drizzle",
        7000: "Ice pellets",
        7101: "Heavy ice pellets",
        8000: "Thunderstorm"
    };
    return descriptions[weatherCode] || "Unknown weather condition";
}

// Check for storm conditions
function checkStormConditions(weatherCode) {
    const stormCodes = [200, 201, 202, 230, 231, 232, 8000];
    return stormCodes.includes(weatherCode) ? "Storm expected. Stay safe!" : "No storm expected.";
}
