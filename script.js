document.getElementById('getWeather').addEventListener('click', function() {
    const city = document.getElementById('city').value;
    const tomorrowApiKey = 'YZJKBtaz8432Jt6mimxCIURhEhZGD108'; // API Keys (Kupal na api key nato hirap makuha 😭)
    const geocodingApiKey = '3dbb9f2e6fad46c2a641a5aeae1ca72b'; // API Keys (Kupal na api key nato hirap makuha 😭)

    const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${geocodingApiKey}`;

    fetch(geoUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching geolocation data');
            }
            return response.json();
        })
        .then(data => {
            if (data.results.length === 0) {
                throw new Error('City not found');
            }

            const lat = data.results[0].geometry.lat;
            const lon = data.results[0].geometry.lng;

            const weatherUrl = `https://api.tomorrow.io/v4/timelines?location=${lat},${lon}&fields=temperature,weatherCode&timesteps=current&units=metric&apikey=${tomorrowApiKey}`;

            return fetch(weatherUrl);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching weather data');
            }
            return response.json();
        })
        .then(data => {
            const currentWeather = data.data.timelines[0].intervals[0].values;
            const temp = currentWeather.temperature;
            const weatherCode = currentWeather.weatherCode;

            const weatherIconCode = getOpenWeatherIcon(weatherCode);
            const weatherDescription = getWeatherDescription(weatherCode);
            const stormStatus = checkStormConditions(weatherCode); // Check for storm conditions

            const weatherIconUrl = `http://openweathermap.org/img/wn/${weatherIconCode}@4x.png`;
            document.getElementById('weatherIcon').src = weatherIconUrl;
            document.getElementById('weatherIcon').style.display = 'block';
            document.getElementById('weatherDetails').innerHTML = `
                <h2>${city}</h2>
                <p>Temperature: ${temp}°C</p>
                <p>Conditions: ${weatherDescription}</p>
                <p id="stormStatus">${stormStatus}</p> <!-- Display storm status here -->
            `;
        })
        .catch(error => {
            document.getElementById('weatherResult').innerHTML = `<p>${error.message}</p>`;
        });
});

// Function to get the OpenWeatherMap icon code
function getOpenWeatherIcon(weatherCode) {
    // Map Tomorrow.io weather codes to OpenWeatherMap icon codes
    const iconMap = {
        1000: '01d', // Clear sky
        1100: '02d', // Mostly clear
        1101: '03d', // Partly cloudy
        1102: '04d', // Mostly cloudy
        1001: '04d', // Cloudy
        2000: '50d', // Fog
        2100: '09d', // Light rain
        2101: '10d', // Light rain
        3000: '09d', // Light drizzle
        3100: '10d', // Rain
        4000: '13d', // Light snow
        4200: '13d', // Snow showers
        5000: '13d', // Snow
        5100: '13d', // Light snow
        6000: '09d', // Freezing drizzle
        6200: '09d', // Freezing rain
        7000: '13d', // Ice pellets (Sleet)
        7101: '13d', // Heavy sleet
        8000: '11d'  // Thunderstorm
    };
    return iconMap[weatherCode] || '01d'; // Default to clear icon if not found
}

// Function to get a weather description based on the weather code
function getWeatherDescription(weatherCode) {
    const descriptions = {
        1000: "Clear sky",
        1100: "Mostly clear",
        1101: "Partly cloudy",
        1102: "Mostly cloudy",
        1001: "Cloudy",
        2000: "Fog",
        2100: "Light rain",
        2101: "Rain",
        3000: "Light drizzle",
        3100: "Rain",
        4000: "Light snow",
        4200: "Snow showers",
        5000: "Snow",
        5100: "Light snow",
        6000: "Freezing drizzle",
        6200: "Freezing rain",
        7000: "Ice pellets (sleet)",
        7101: "Heavy sleet",
        8000: "Thunderstorm"
    };
    return descriptions[weatherCode] || "Unknown weather condition"; // Default message
}

// Function to check for storm conditions
function checkStormConditions(weatherCode) {
    const stormCodes = [200, 201, 202, 230, 231, 232];
    if (stormCodes.includes(weatherCode)) {
        return "Storm expected. Stay safe!";
    } else {
        return "No storm expected.";
    }
}