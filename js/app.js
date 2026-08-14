"use strict";

/* =========================================================
   SHOHIN WEATHER V2
   REAL WEATHER + GLOBAL MAP + GPS + SEARCH
========================================================= */

const SHOHIN = {

    map: null,
    marker: null,

    standardLayer: null,
    satelliteLayer: null,

    selectedLocation: null,

    searchTimer: null,

    defaultLocation: [
        38.5598,
        68.7870
    ]

};


/* =========================================================
   SHORT DOM FUNCTION
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   START APP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initMap();

        setupGPS();

        setupSearch();

        setupMapControls();

        setupCloseButton();

        setupLayers();

        setupBottomNavigation();

        hideLoading();

    }
);


/* =========================================================
   MAP
========================================================= */

function initMap() {

    SHOHIN.map = L.map(
        "map",
        {
            zoomControl: false,
            minZoom: 2,
            maxZoom: 19,
            worldCopyJump: true,
            preferCanvas: true
        }
    ).setView(
        SHOHIN.defaultLocation,
        5
    );


    /* STANDARD MAP */

    SHOHIN.standardLayer = L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {
            maxZoom: 19,

            attribution:
                '&copy; OpenStreetMap contributors'
        }

    ).addTo(
        SHOHIN.map
    );


    /* SATELLITE */

    SHOHIN.satelliteLayer = L.tileLayer(

        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

        {
            maxZoom: 19,

            attribution:
                "Tiles © Esri"
        }

    );


    /* CLICK ON MAP */

    SHOHIN.map.on(
        "click",
        function (event) {

            const lat =
                event.latlng.lat;

            const lon =
                event.latlng.lng;

            selectLocation(
                lat,
                lon,
                null
            );

        }
    );


    /* DEFAULT LOCATION */

    selectLocation(
        SHOHIN.defaultLocation[0],
        SHOHIN.defaultLocation[1],
        "Dushanbe"
    );

}


/* =========================================================
   SELECT LOCATION
========================================================= */

async function selectLocation(
    lat,
    lon,
    name
) {

    SHOHIN.selectedLocation = {

        lat: lat,
        lon: lon,
        name: name

    };


    updateLocationUI(
        lat,
        lon,
        name || "Selected location"
    );


    /* REMOVE OLD MARKER */

    if (
        SHOHIN.marker
    ) {

        SHOHIN.map.removeLayer(
            SHOHIN.marker
        );

    }


    /* CREATE MARKER */

    SHOHIN.marker = L.marker(
        [
            lat,
            lon
        ]
    ).addTo(
        SHOHIN.map
    );


    /* POPUP */

    SHOHIN.marker.bindPopup(

        `
        <div style="
            min-width:150px;
            text-align:center;
            padding:5px;
        ">

            <strong>
                SHOHIN WEATHER
            </strong>

            <br>

            <span style="
                color:#888;
                font-size:11px;
            ">

                ${lat.toFixed(4)}°,
                ${lon.toFixed(4)}°

            </span>

        </div>
        `

    );


    SHOHIN.marker.openPopup();


    /* MOVE MAP */

    SHOHIN.map.flyTo(
        [
            lat,
            lon
        ],
        Math.max(
            SHOHIN.map.getZoom(),
            6
        ),
        {
            animate: true,
            duration: 0.8
        }
    );


    /* LOAD REAL WEATHER */

    await loadWeather(
        lat,
        lon,
        name
    );

}


/* =========================================================
   REAL WEATHER
========================================================= */

async function loadWeather(
    lat,
    lon,
    name
) {

    setWeatherLoading();


    try {

        const url =

            "https://api.open-meteo.com/v1/forecast" +

            "?latitude=" +
            encodeURIComponent(lat) +

            "&longitude=" +
            encodeURIComponent(lon) +

            "&current=" +

            "temperature_2m," +

            "relative_humidity_2m," +

            "apparent_temperature," +

            "is_day," +

            "precipitation," +

            "rain," +

            "showers," +

            "snowfall," +

            "weather_code," +

            "cloud_cover," +

            "pressure_msl," +

            "surface_pressure," +

            "wind_speed_10m," +

            "wind_direction_10m," +

            "wind_gusts_10m" +

            "&hourly=" +

            "temperature_2m," +

            "relative_humidity_2m," +

            "precipitation_probability," +

            "precipitation," +

            "weather_code," +

            "cloud_cover," +

            "wind_speed_10m," +

            "wind_direction_10m" +

            "&daily=" +

            "weather_code," +

            "temperature_2m_max," +

            "temperature_2m_min," +

            "sunrise," +

            "sunset," +

            "uv_index_max" +

            "&timezone=auto";


        const response =
            await fetch(
                url
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Weather API error: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "SHOHIN WEATHER DATA:",
            data
        );


        displayWeather(
            data
        );


    } catch (error) {

        console.error(
            "WEATHER ERROR:",
            error
        );


        showWeatherError();

    }

}


/* =========================================================
   DISPLAY WEATHER
========================================================= */

function displayWeather(
    data
) {

    const current =
        data.current;


    if (!current) {

        showWeatherError();

        return;

    }


    const temperature =
        current.temperature_2m;


    const humidity =
        current.relative_humidity_2m;


    const wind =
        current.wind_speed_10m;


    const windDirection =
        current.wind_direction_10m;


    const clouds =
        current.cloud_cover;


    const rain =
        current.precipitation;


    const pressure =
        current.pressure_msl;


    const apparent =
        current.apparent_temperature;


    const weatherCode =
        current.weather_code;


    const uv =
        data.daily &&
        data.daily.uv_index_max
            ? data.daily.uv_index_max[0]
            : null;


    /* TEMPERATURE */

    const tempElement =
        document.querySelector(
            ".weather-temperature"
        );


    if (tempElement) {

        tempElement.textContent =
            formatNumber(
                temperature
            ) +
            "°C";

    }


    /* DESCRIPTION */

    const descriptionElement =
        document.querySelector(
            ".weather-description"
        );


    if (descriptionElement) {

        descriptionElement.textContent =
            weatherDescription(
                weatherCode
            );

    }


    /* MINI CARDS */

    const miniCards =
        document.querySelectorAll(
            ".weather-mini-grid > div"
        );


    if (miniCards.length >= 4) {

        /* WIND */

        miniCards[0]
            .querySelector("strong")
            .textContent =
            formatNumber(
                wind
            ) +
            " km/h";


        miniCards[0]
            .querySelector("span")
            .textContent =
            "💨";


        /* HUMIDITY */

        miniCards[1]
            .querySelector("strong")
            .textContent =
            formatNumber(
                humidity
            ) +
            "%";


        /* CLOUDS */

        miniCards[2]
            .querySelector("strong")
            .textContent =
            formatNumber(
                clouds
            ) +
            "%";


        /* RAIN */

        miniCards[3]
            .querySelector("strong")
            .textContent =
            formatNumber(
                rain
            ) +
            " mm";

    }


    /* EXTRA WEATHER INFORMATION */

    updateWeatherExtra(

        pressure,

        apparent,

        windDirection,

        uv

    );


    /* UPDATE POPUP */

    if (
        SHOHIN.marker
    ) {

        SHOHIN.marker.bindPopup(

            `
            <div style="
                min-width:180px;
                text-align:center;
                padding:6px;
            ">

                <strong style="
                    font-size:15px;
                ">
                    ${formatNumber(temperature)}°C
                </strong>

                <br>

                <span>
                    ${weatherDescription(weatherCode)}
                </span>

                <hr style="
                    border:0;
                    border-top:1px solid #ddd;
                    margin:8px 0;
                ">

                <small>
                    💨 ${formatNumber(wind)} km/h
                </small>

                <br>

                <small>
                    💧 ${formatNumber(humidity)}%
                </small>

                <br>

                <small>
                    ☁️ ${formatNumber(clouds)}%
                </small>

            </div>
            `

        );

    }


    console.log(
        "Temperature:",
        temperature
    );

    console.log(
        "Wind:",
        wind,
        windDirection
    );

    console.log(
        "Humidity:",
        humidity
    );

    console.log(
        "Clouds:",
        clouds
    );

    console.log(
        "Rain:",
        rain
    );

    console.log(
        "Pressure:",
        pressure
    );

}


/* =========================================================
   EXTRA WEATHER DATA
========================================================= */

function updateWeatherExtra(

    pressure,

    apparent,

    windDirection,

    uv

) {

    const card =
        $("locationCard");


    if (!card) {

        return;

    }


    let extra =
        document.querySelector(
            ".weather-extra"
        );


    if (!extra) {

        extra =
            document.createElement(
                "div"
            );

        extra.className =
            "weather-extra";


        card.appendChild(
            extra
        );

    }


    extra.innerHTML =

        `
        <div>
            <span>🌡️ Feels</span>
            <strong>
                ${formatNumber(apparent)}°C
            </strong>
        </div>

        <div>
            <span>🔽 Pressure</span>
            <strong>
                ${formatNumber(pressure)} hPa
            </strong>
        </div>

        <div>
            <span>🧭 Wind</span>
            <strong>
                ${formatNumber(windDirection)}°
            </strong>
        </div>

        <div>
            <span>☀️ UV</span>
            <strong>
                ${
                    uv !== null
                    ? formatNumber(uv)
                    : "—"
                }
            </strong>
        </div>
        `;

}


/* =========================================================
   LOADING WEATHER
========================================================= */

function setWeatherLoading() {

    const temp =
        document.querySelector(
            ".weather-temperature"
        );


    const desc =
        document.querySelector(
            ".weather-description"
        );


    if (temp) {

        temp.textContent =
            "…";

    }


    if (desc) {

        desc.textContent =
            "Получаем погоду...";

    }


    const cards =
        document.querySelectorAll(
            ".weather-mini-grid strong"
        );


    cards.forEach(
        function (card) {

            card.textContent =
                "…";

        }
    );

}


/* =========================================================
   WEATHER ERROR
========================================================= */

function showWeatherError() {

    const desc =
        document.querySelector(
            ".weather-description"
        );


    if (desc) {

        desc.textContent =
            "Не удалось получить погоду";

    }

}


/* =========================================================
   WEATHER DESCRIPTION
========================================================= */

function weatherDescription(
    code
) {

    const weather = {

        0: "Ясно ☀️",

        1: "Преимущественно ясно 🌤️",

        2: "Переменная облачность ⛅",

        3: "Пасмурно ☁️",

        45: "Туман 🌫️",

        48: "Изморозь 🌫️",

        51: "Лёгкая морось 🌦️",

        53: "Морось 🌦️",

        55: "Сильная морось 🌧️",

        56: "Ледяная морось 🌧️",

        57: "Сильная ледяная морось 🌧️",

        61: "Небольшой дождь 🌦️",

        63: "Дождь 🌧️",

        65: "Сильный дождь 🌧️",

        66: "Ледяной дождь 🌧️",

        67: "Сильный ледяной дождь 🌧️",

        71: "Небольшой снег 🌨️",

        73: "Снег ❄️",

        75: "Сильный снег ❄️",

        77: "Снежные зёрна ❄️",

        80: "Ливень 🌦️",

        81: "Сильный ливень 🌧️",

        82: "Очень сильный ливень ⛈️",

        85: "Снегопад 🌨️",

        86: "Сильный снегопад ❄️",

        95: "Гроза ⛈️",

        96: "Гроза с градом ⛈️",

        99: "Сильная гроза с градом ⛈️"

    };


    return (
        weather[code] ||
        "Погода"
    );

}


/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(
    value
) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(
            Number(value)
        )
    ) {

        return "—";

    }


    return Number(
        value
    ).toFixed(0);

}


/* =========================================================
   LOCATION UI
========================================================= */

function updateLocationUI(
    lat,
    lon,
    name
) {

    if (
        $("locationName")
    ) {

        $("locationName")
            .textContent =
            name ||
            "Selected location";

    }


    if (
        $("locationCoords")
    ) {

        $("locationCoords")
            .textContent =

            lat.toFixed(5) +
            "°, " +
            lon.toFixed(5) +
            "°";

    }

}


/* =========================================================
   GPS
========================================================= */

function setupGPS() {

    const button =
        $("gpsButton");


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        locateUser
    );

}


function locateUser() {

    if (
        !navigator.geolocation
    ) {

        alert(
            "Ваш браузер не поддерживает GPS."
        );

        return;

    }


    const button =
        $("gpsButton");


    button.textContent =
        "⌛";


    button.disabled =
        true;


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;


            console.log(
                "GPS:",
                lat,
                lon
            );


            SHOHIN.map.flyTo(

                [
                    lat,
                    lon
                ],

                13,

                {
                    animate: true,

                    duration: 1.5
                }

            );


            await selectLocation(

                lat,

                lon,

                "Моё местоположение"

            );


            button.textContent =
                "📍";


            button.disabled =
                false;


            reverseGeocode(
                lat,
                lon
            );

        },


        function (error) {

            console.error(
                "GPS ERROR:",
                error
            );


            button.textContent =
                "📍";


            button.disabled =
                false;


            if (
                error.code === 1
            ) {

                alert(
                    "Разрешите браузеру доступ к местоположению."
                );

            }

            else if (
                error.code === 2
            ) {

                alert(
                    "Местоположение недоступно. Включите GPS."
                );

            }

            else if (
                error.code === 3
            ) {

                alert(
                    "GPS не ответил вовремя. Попробуйте ещё раз."
                );

            }

            else {

                alert(
                    "Не удалось определить местоположение."
                );

            }

        },

        {
            enableHighAccuracy:
                true,

            timeout:
                20000,

            maximumAge:
                0

        }

    );

}


/* =========================================================
   REVERSE GEOCODING
========================================================= */

async function reverseGeocode(
    lat,
    lon
) {

    try {

        const url =

            "https://nominatim.openstreetmap.org/reverse" +

            "?format=json" +

            "&lat=" +
            encodeURIComponent(lat) +

            "&lon=" +
            encodeURIComponent(lon) +

            "&zoom=10" +

            "&addressdetails=1" +

            "&accept-language=ru";


        const response =
            await fetch(
                url
            );


        if (!response.ok) {

            throw new Error(
                "Reverse geocoding failed"
            );

        }


        const data =
            await response.json();


        const address =
            data.address ||
            {};


        const name =

            address.city ||

            address.town ||

            address.village ||

            address.municipality ||

            address.county ||

            address.state ||

            address.country ||

            "Моё местоположение";


        updateLocationUI(
            lat,
            lon,
            name
        );

    }

    catch (error) {

        console.warn(
            "Reverse geocoding:",
            error
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const input =
        $("searchInput");


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function () {

            const query =
                input.value.trim();


            clearTimeout(
                SHOHIN.searchTimer
            );


            if (
                query.length < 2
            ) {

                hideSearchResults();

                return;

            }


            SHOHIN.searchTimer =

                setTimeout(
                    function () {

                        searchCity(
                            query
                        );

                    },
                    350
                );

        }
    );


    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                input.value = "";

                hideSearchResults();

            }

        }
    );

}


/* =========================================================
   SEARCH CITY
========================================================= */

async function searchCity(
    query
) {

    try {

        const url =

            "https://geocoding-api.open-meteo.com/v1/search" +

            "?name=" +
            encodeURIComponent(query) +

            "&count=8" +

            "&language=ru" +

            "&format=json";


        const response =
            await fetch(
                url
            );


        if (!response.ok) {

            throw new Error(
                "Search error"
            );

        }


        const data =
            await response.json();


        renderSearchResults(
            data.results || []
        );

    }

    catch (error) {

        console.error(
            "SEARCH ERROR:",
            error
        );

        hideSearchResults();

    }

}


/* =========================================================
   SEARCH RESULTS
========================================================= */

function renderSearchResults(
    results
) {

    const container =
        $("searchResults");


    if (!container) {

        return;

    }


    if (
        !results.length
    ) {

        container.style.display =
            "none";

        return;

    }


    container.innerHTML =

        results.map(
            function (place) {

                const name =
                    escapeHTML(
                        place.name ||
                        "Unknown"
                    );


                const country =
                    escapeHTML(
                        place.country ||
                        ""
                    );


                const admin =
                    escapeHTML(
                        place.admin1 ||
                        ""
                    );


                return `

                    <div
                        class="search-result"

                        data-lat="${place.latitude}"

                        data-lon="${place.longitude}"

                        data-name="${name}"
                    >

                        <strong>
                            ${name}
                        </strong>

                        <small>

                            ${admin}

                            ${
                                admin &&
                                country
                                    ? " • "
                                    : ""
                            }

                            ${country}

                        </small>

                    </div>

                `;

            }
        ).join("");


    container.style.display =
        "block";


    container
        .querySelectorAll(
            ".search-result"
        )
        .forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    async function () {

                        const lat =
                            Number(
                                item.dataset.lat
                            );


                        const lon =
                            Number(
                                item.dataset.lon
                            );


                        const name =
                            item.dataset.name;


                        $("searchInput")
                            .value =
                            "";


                        hideSearchResults();


                        await selectLocation(

                            lat,

                            lon,

                            name

                        );

                    }
                );

            }
        );

}


/* =========================================================
   HIDE SEARCH
========================================================= */

function hideSearchResults() {

    const container =
        $("searchResults");


    if (container) {

        container.style.display =
            "none";

    }

}


/* =========================================================
   MAP CONTROLS
========================================================= */

function setupMapControls() {

    if (
        $("zoomIn")
    ) {

        $("zoomIn")
            .addEventListener(
                "click",
                function () {

                    SHOHIN.map.zoomIn();

                }
            );

    }


    if (
        $("zoomOut")
    ) {

        $("zoomOut")
            .addEventListener(
                "click",
                function () {

                    SHOHIN.map.zoomOut();

                }
            );

    }


    if (
        $("centerMap")
    ) {

        $("centerMap")
            .addEventListener(
                "click",
                function () {

                    SHOHIN.map.flyTo(

                        SHOHIN.defaultLocation,

                        5,

                        {
                            duration: 1
                        }

                    );

                }
            );

    }

}


/* =========================================================
   MAP LAYERS
========================================================= */

function setupLayers() {

    const mapButton =
        $("mapLayer");


    const satelliteButton =
        $("satelliteLayer");


    if (mapButton) {

        mapButton.addEventListener(
            "click",
            function () {

                if (
                    SHOHIN.map.hasLayer(
                        SHOHIN.satelliteLayer
                    )
                ) {

                    SHOHIN.map.removeLayer(
                        SHOHIN.satelliteLayer
                    );

                }


                if (
                    !SHOHIN.map.hasLayer(
                        SHOHIN.standardLayer
                    )
                ) {

                    SHOHIN.standardLayer.addTo(
                        SHOHIN.map
                    );

                }


                setActiveLayerButton(
                    mapButton
                );

            }
        );

    }


    if (satelliteButton) {

        satelliteButton.addEventListener(
            "click",
            function () {

                if (
                    SHOHIN.map.hasLayer(
                        SHOHIN.standardLayer
                    )
                ) {

                    SHOHIN.map.removeLayer(
                        SHOHIN.standardLayer
                    );

                }


                if (
                    !SHOHIN.map.hasLayer(
                        SHOHIN.satelliteLayer
                    )
                ) {

                    SHOHIN.satelliteLayer.addTo(
                        SHOHIN.map
                    );

                }


                setActiveLayerButton(
                    satelliteButton
                );

            }
        );

    }


    /* WEATHER LAYER BUTTONS */

    setupWeatherLayerButton(
        "temperatureLayer",
        "🌡️ Temperature"
    );


    setupWeatherLayerButton(
        "windLayer",
        "💨 Wind"
    );


    setupWeatherLayerButton(
        "rainLayer",
        "🌧️ Rain"
    );


    setupWeatherLayerButton(
        "cloudLayer",
        "☁️ Clouds"
    );

}


/* =========================================================
   WEATHER LAYER BUTTON
========================================================= */

function setupWeatherLayerButton(
    id,
    title
) {

    const button =
        $(id);


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            setActiveLayerButton(
                button
            );


            showWeatherLayerMessage(
                title
            );

        }
    );

}


/* =========================================================
   ACTIVE LAYER
========================================================= */

function setActiveLayerButton(
    button
) {

    document
        .querySelectorAll(
            ".layer-button"
        )
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

            }
        );


    button.classList.add(
        "active"
    );

}


/* =========================================================
   WEATHER LAYER MESSAGE
========================================================= */

function showWeatherLayerMessage(
    title
) {

    console.log(
        "Selected layer:",
        title
    );


    /*
       IMPORTANT:
       These buttons are prepared for
       V3 Weather Grid.

       We do NOT display fake
       weather maps.
    */

    alert(
        title +
        "\n\nГлобальный погодный слой будет подключён в V3."
    );

}


/* =========================================================
   BOTTOM NAV
========================================================= */

function setupBottomNavigation() {

    const map =
        $("navMap");


    const weather =
        $("navWeather");


    const wind =
        $("navWind");


    const rain =
        $("navRain");


    if (map) {

        map.addEventListener(
            "click",
            function () {

                activateNav(
                    map
                );

            }
        );

    }


    if (weather) {

        weather.addEventListener(
            "click",
            function () {

                activateNav(
                    weather
                );

                focusWeather();

            }
        );

    }


    if (wind) {

        wind.addEventListener(
            "click",
            function () {

                activateNav(
                    wind
                );

                showWeatherLayerMessage(
                    "💨 Wind"
                );

            }
        );

    }


    if (rain) {

        rain.addEventListener(
            "click",
            function () {

                activateNav(
                    rain
                );

                showWeatherLayerMessage(
                    "🌧️ Rain"
                );

            }
        );

    }


    const settings =
        $("navSettings");


    if (settings) {

        settings.addEventListener(
            "click",
            function () {

                activateNav(
                    settings
                );

                alert(
                    "SHOHIN WEATHER V2\n\nНастройки будут добавлены позже."
                );

            }
        );

    }

}


/* =========================================================
   NAV ACTIVE
========================================================= */

function activateNav(
    button
) {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

            }
        );


    button.classList.add(
        "active"
    );

}


/* =========================================================
   FOCUS WEATHER
========================================================= */

function focusWeather() {

    if (
        SHOHIN.selectedLocation
    ) {

        const location =
            SHOHIN.selectedLocation;


        loadWeather(

            location.lat,

            location.lon,

            location.name

        );

    }

}


/* =========================================================
   CLOSE LOCATION
========================================================= */

function setupCloseButton() {

    const button =
        $("closeCard");


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            if (
                SHOHIN.marker
            ) {

                SHOHIN.map.removeLayer(
                    SHOHIN.marker
                );

                SHOHIN.marker =
                    null;

            }


            if (
                $("locationName")
            ) {

                $("locationName")
                    .textContent =
                    "Select a location";

            }


            if (
                $("locationCoords")
            ) {

                $("locationCoords")
                    .textContent =
                    "Tap anywhere on the map";

            }

        }
    );

}


/* =========================================================
   LOADING SCREEN
========================================================= */

function hideLoading() {

    setTimeout(
        function () {

            const loading =
                $("loading");


            if (loading) {

                loading.classList.add(
                    "hide"
                );

            }

        },
        800
    );

}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   START MESSAGE
========================================================= */

console.log(
    "🌍 SHOHIN WEATHER V2 — REAL WEATHER ENGINE LOADED"
);