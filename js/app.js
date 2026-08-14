"use strict";

/* =========================================================
   SHOHIN WEATHER V3.3
   GLOBAL WEATHER MAP
   Open-Meteo + Leaflet
========================================================= */

const SHOHIN = {
    map: null,
    marker: null,

    standardLayer: null,
    satelliteLayer: null,

    temperatureLayer: null,
    rainLayer: null,

    selectedLocation: null,

    currentMode: "temperature",

    defaultLocation: [38.5598, 68.7870],

    gridRequest: 0
};


/* =========================================================
   SHORT DOM HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    try {

        initMap();
        setupGPS();
        setupSearch();
        setupMapControls();
        setupLayers();
        setupCloseButton();
        setupBottomNavigation();

        setTimeout(function () {
            hideLoading();
        }, 700);

    } catch (error) {

        console.error("SHOHIN START ERROR:", error);

        hideLoading();

    }

});


/* =========================================================
   MAP INITIALIZATION
========================================================= */

function initMap() {

    if (!window.L) {
        console.error("Leaflet not loaded.");
        return;
    }

    SHOHIN.map = L.map("map", {
        zoomControl: false,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true,
        preferCanvas: true
    }).setView(
        SHOHIN.defaultLocation,
        4
    );


    /* NORMAL MAP */

    SHOHIN.standardLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    );

    SHOHIN.standardLayer.addTo(
        SHOHIN.map
    );


    /* SATELLITE */

    SHOHIN.satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 19,
            attribution: "Tiles © Esri"
        }
    );


    /* TEMPERATURE */

    SHOHIN.temperatureLayer =
        L.layerGroup();

    SHOHIN.temperatureLayer.addTo(
        SHOHIN.map
    );


    /* RAIN */

    SHOHIN.rainLayer =
        L.layerGroup();


    /* MAP CLICK */

    SHOHIN.map.on(
        "click",
        function (event) {

            selectLocation(
                event.latlng.lat,
                event.latlng.lng,
                null
            );

        }
    );


    /* MOVE */

    SHOHIN.map.on(
        "moveend",
        function () {

            updateActiveGrid();

        }
    );


    /* ZOOM */

    SHOHIN.map.on(
        "zoomend",
        function () {

            updateActiveGrid();

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
   UPDATE ACTIVE WEATHER GRID
========================================================= */

function updateActiveGrid() {

    if (
        SHOHIN.currentMode === "temperature"
    ) {

        updateTemperatureGrid();

    }

    if (
        SHOHIN.currentMode === "rain"
    ) {

        updateRainGrid();

    }

}


/* =========================================================
   SELECT LOCATION
========================================================= */

async function selectLocation(
    lat,
    lon,
    name
) {

    if (!SHOHIN.map) {
        return;
    }


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

    if (SHOHIN.marker) {

        SHOHIN.map.removeLayer(
            SHOHIN.marker
        );

    }


    /* CREATE MARKER */

    SHOHIN.marker = L.marker(
        [lat, lon]
    ).addTo(
        SHOHIN.map
    );


    SHOHIN.marker.bindPopup(
        `
        <div style="
            min-width:180px;
            text-align:center;
            padding:6px;
        ">

            <strong>
                SHOHIN WEATHER
            </strong>

            <br>

            <small>
                ${lat.toFixed(4)}°,
                ${lon.toFixed(4)}°
            </small>

            <br><br>

            <span>
                Получаем погоду...
            </span>

        </div>
        `
    );


    SHOHIN.marker.openPopup();


    /* MOVE MAP */

    SHOHIN.map.flyTo(
        [lat, lon],
        Math.max(
            SHOHIN.map.getZoom(),
            6
        ),
        {
            animate: true,
            duration: 0.8
        }
    );


    /* WEATHER */

    await loadWeather(
        lat,
        lon
    );

}


/* =========================================================
   REAL WEATHER
========================================================= */

async function loadWeather(
    lat,
    lon
) {

    setWeatherLoading();


    try {

        const url =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + encodeURIComponent(lat) +
            "&longitude=" + encodeURIComponent(lon) +
            "&current=" +
            "temperature_2m," +
            "relative_humidity_2m," +
            "apparent_temperature," +
            "precipitation," +
            "weather_code," +
            "cloud_cover," +
            "pressure_msl," +
            "wind_speed_10m," +
            "wind_direction_10m" +
            "&daily=" +
            "uv_index_max," +
            "sunrise," +
            "sunset" +
            "&timezone=auto";


        const response =
            await fetch(url);


        if (!response.ok) {
            throw new Error(
                "Open-Meteo error"
            );
        }


        const data =
            await response.json();


        displayWeather(data);

    }

    catch (error) {

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

function displayWeather(data) {

    if (
        !data ||
        !data.current
    ) {
        return;
    }


    const current =
        data.current;


    const temperature =
        Number(current.temperature_2m);


    const humidity =
        Number(current.relative_humidity_2m);


    const wind =
        Number(current.wind_speed_10m);


    const windDirection =
        Number(current.wind_direction_10m);


    const clouds =
        Number(current.cloud_cover);


    const rain =
        Number(current.precipitation);


    const pressure =
        Number(current.pressure_msl);


    const apparent =
        Number(current.apparent_temperature);


    const code =
        Number(current.weather_code);


    /* TEMPERATURE */

    const tempElement =
        document.querySelector(
            ".weather-temperature"
        );


    if (tempElement) {

        tempElement.textContent =
            Math.round(temperature) + "°C";

    }


    /* DESCRIPTION */

    const description =
        document.querySelector(
            ".weather-description"
        );


    if (description) {

        description.textContent =
            weatherDescription(code);

    }


    /* MINI CARDS */

    const cards =
        document.querySelectorAll(
            ".weather-mini-grid > div"
        );


    if (cards.length >= 4) {

        cards[0]
            .querySelector("strong")
            .textContent =
            Math.round(wind) +
            " km/h " +
            windDirectionArrow(
                windDirection
            );


        cards[1]
            .querySelector("strong")
            .textContent =
            Math.round(humidity) +
            "%";


        cards[2]
            .querySelector("strong")
            .textContent =
            Math.round(clouds) +
            "%";


        cards[3]
            .querySelector("strong")
            .textContent =
            rain.toFixed(1) +
            " mm";

    }


    updateExtraWeather(
        pressure,
        apparent
    );


    /* POPUP */

    if (SHOHIN.marker) {

        SHOHIN.marker.bindPopup(
            `
            <div style="
                min-width:190px;
                text-align:center;
                padding:6px;
            ">

                <strong style="
                    font-size:26px;
                ">
                    ${Math.round(temperature)}°C
                </strong>

                <br>

                ${weatherDescription(code)}

                <hr>

                💨 ${Math.round(wind)} km/h

                <br>

                💧 ${Math.round(humidity)}%

                <br>

                ☁️ ${Math.round(clouds)}%

                <br>

                🌧️ ${rain.toFixed(1)} mm

                <br>

                🔽 ${Math.round(pressure)} hPa

            </div>
            `
        );

    }

}


/* =========================================================
   WIND DIRECTION
========================================================= */

function windDirectionArrow(degrees) {

    if (isNaN(degrees)) {
        return "";
    }

    const arrows = [
        "↑",
        "↗",
        "→",
        "↘",
        "↓",
        "↙",
        "←",
        "↖"
    ];

    const index =
        Math.round(degrees / 45) % 8;

    return arrows[index];

}


/* =========================================================
   EXTRA WEATHER
========================================================= */

function updateExtraWeather(
    pressure,
    apparent
) {

    const card =
        $("locationCard");


    if (!card) {
        return;
    }


    let extra =
        card.querySelector(
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
                ${Math.round(apparent)}°C
            </strong>
        </div>

        <div>
            <span>🔽 Pressure</span>
            <strong>
                ${Math.round(pressure)} hPa
            </strong>
        </div>
        `;

}


/* =========================================================
   TEMPERATURE GRID
========================================================= */

async function updateTemperatureGrid() {

    if (
        !SHOHIN.map ||
        SHOHIN.currentMode !== "temperature"
    ) {
        return;
    }


    const requestId =
        ++SHOHIN.gridRequest;


    const points =
        createGridPoints();


    if (!points.length) {
        return;
    }


    const lats =
        points.map(
            p => p[0]
        ).join(",");


    const lons =
        points.map(
            p => p[1]
        ).join(",");


    const url =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" + lats +
        "&longitude=" + lons +
        "&current=temperature_2m" +
        "&timezone=auto";


    try {

        const response =
            await fetch(url);


        if (!response.ok) {
            throw new Error(
                "Temperature grid error"
            );
        }


        const data =
            await response.json();


        if (
            requestId !==
            SHOHIN.gridRequest
        ) {
            return;
        }


        drawTemperatureGrid(
            points,
            data
        );

    }

    catch (error) {

        console.error(
            "TEMP GRID:",
            error
        );

    }

}


/* =========================================================
   GRID POINTS
========================================================= */

function createGridPoints() {

    if (!SHOHIN.map) {
        return [];
    }


    const zoom =
        SHOHIN.map.getZoom();


    let step;


    if (zoom <= 2) {

        step = 12;

    }

    else if (zoom <= 3) {

        step = 8;

    }

    else if (zoom <= 4) {

        step = 5;

    }

    else if (zoom <= 5) {

        step = 3;

    }

    else {

        step = 2;

    }


    const bounds =
        SHOHIN.map.getBounds();


    const north =
        Math.min(
            bounds.getNorth(),
            85
        );


    const south =
        Math.max(
            bounds.getSouth(),
            -60
        );


    const west =
        Math.max(
            bounds.getWest(),
            -180
        );


    const east =
        Math.min(
            bounds.getEast(),
            180
        );


    const points = [];


    for (
        let lat = south;
        lat <= north;
        lat += step
    ) {

        for (
            let lon = west;
            lon <= east;
            lon += step
        ) {

            points.push([
                Number(lat.toFixed(3)),
                Number(lon.toFixed(3))
            ]);


            if (
                points.length >= 250
            ) {
                return points;
            }

        }

    }


    return points;

}


/* =========================================================
   DRAW TEMPERATURE
========================================================= */

function drawTemperatureGrid(
    points,
    data
) {

    if (!SHOHIN.temperatureLayer) {
        return;
    }


    SHOHIN.temperatureLayer.clearLayers();


    const weather =
        Array.isArray(data)
            ? data
            : [data];


    points.forEach(
        function (
            point,
            index
        ) {

            const item =
                weather[index];


            if (
                !item ||
                !item.current
            ) {
                return;
            }


            const temperature =
                Number(
                    item.current.temperature_2m
                );


            const circle =
                L.circle(
                    point,
                    {
                        radius:
                            getGridRadius(),

                        stroke:
                            false,

                        fillColor:
                            temperatureColor(
                                temperature
                            ),

                        fillOpacity:
                            0.38,

                        interactive:
                            false
                    }
                );


            circle.addTo(
                SHOHIN.temperatureLayer
            );


            /* TEMPERATURE LABEL */

            if (
                SHOHIN.map.getZoom() >= 4
            ) {

                const label =
                    L.marker(
                        point,
                        {
                            interactive:
                                false,

                            icon:
                                L.divIcon({
                                    className:
                                        "shohin-temp-label",

                                    html:
                                        `
                                        <div style="
                                            font-weight:800;
                                            font-size:12px;
                                            color:white;
                                            text-shadow:
                                                0 1px 4px
                                                rgba(0,0,0,.9);
                                        ">
                                            ${Math.round(
                                                temperature
                                            )}°
                                        </div>
                                        `,

                                    iconSize:
                                        [35, 20],

                                    iconAnchor:
                                        [17, 10]
                                })
                        }
                    );


                label.addTo(
                    SHOHIN.temperatureLayer
                );

            }

        }
    );

}


/* =========================================================
   TEMPERATURE COLORS
========================================================= */

function temperatureColor(temp) {

    if (temp <= -30) return "#4b0082";
    if (temp <= -20) return "#0000ff";
    if (temp <= -10) return "#008cff";
    if (temp <= 0) return "#00c8ff";
    if (temp <= 10) return "#00d084";
    if (temp <= 20) return "#a8d400";
    if (temp <= 25) return "#ffe000";
    if (temp <= 30) return "#ffae00";
    if (temp <= 35) return "#ff6400";
    if (temp <= 40) return "#ff2200";

    return "#c00000";

}


/* =========================================================
   GRID RADIUS
========================================================= */

function getGridRadius() {

    const zoom =
        SHOHIN.map.getZoom();


    if (zoom <= 2) return 700000;
    if (zoom <= 3) return 450000;
    if (zoom <= 4) return 280000;
    if (zoom <= 5) return 170000;

    return 100000;

}


/* =========================================================
   RAIN GRID
========================================================= */

async function updateRainGrid() {

    if (
        !SHOHIN.map ||
        SHOHIN.currentMode !== "rain"
    ) {
        return;
    }


    const requestId =
        ++SHOHIN.gridRequest;


    const points =
        createGridPoints();


    if (!points.length) {
        return;
    }


    const lats =
        points.map(
            p => p[0]
        ).join(",");


    const lons =
        points.map(
            p => p[1]
        ).join(",");


    const url =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" + lats +
        "&longitude=" + lons +
        "&current=precipitation,rain,showers,snowfall" +
        "&timezone=auto";


    try {

        const response =
            await fetch(url);


        if (!response.ok) {
            throw new Error(
                "Rain grid error"
            );
        }


        const data =
            await response.json();


        if (
            requestId !==
            SHOHIN.gridRequest
        ) {
            return;
        }


        drawRainGrid(
            points,
            data
        );

    }

    catch (error) {

        console.error(
            "RAIN GRID:",
            error
        );

    }

}


/* =========================================================
   DRAW RAIN
========================================================= */

function drawRainGrid(
    points,
    data
) {

    if (!SHOHIN.rainLayer) {
        return;
    }


    SHOHIN.rainLayer.clearLayers();


    const weather =
        Array.isArray(data)
            ? data
            : [data];


    points.forEach(
        function (
            point,
            index
        ) {

            const item =
                weather[index];


            if (
                !item ||
                !item.current
            ) {
                return;
            }


            const rain =
                Number(
                    item.current.precipitation || 0
                );


            if (rain <= 0) {
                return;
            }


            const circle =
                L.circle(
                    point,
                    {
                        radius:
                            getGridRadius(),

                        stroke:
                            false,

                        fillColor:
                            rainColor(rain),

                        fillOpacity:
                            rainOpacity(rain),

                        interactive:
                            false
                    }
                );


            circle.addTo(
                SHOHIN.rainLayer
            );


            if (
                SHOHIN.map.getZoom() >= 5
            ) {

                const label =
                    L.marker(
                        point,
                        {
                            interactive:
                                false,

                            icon:
                                L.divIcon({
                                    className:
                                        "shohin-rain-label",

                                    html:
                                        `
                                        <div style="
                                            font-weight:800;
                                            font-size:11px;
                                            color:white;
                                            text-shadow:
                                                0 1px 4px
                                                rgba(0,0,0,.9);
                                        ">
                                            ${rain.toFixed(1)}
                                        </div>
                                        `,

                                    iconSize:
                                        [30, 18],

                                    iconAnchor:
                                        [15, 9]
                                })
                        }
                    );


                label.addTo(
                    SHOHIN.rainLayer
                );

            }

        }
    );

}


/* =========================================================
   RAIN COLORS
========================================================= */

function rainColor(rain) {

    if (rain < 0.2) return "#75d7ff";
    if (rain < 1) return "#2196f3";
    if (rain < 3) return "#3949ab";
    if (rain < 7) return "#7e57c2";
    if (rain < 15) return "#d81b60";
    if (rain < 30) return "#f4511e";

    return "#b71c1c";

}


/* =========================================================
   RAIN OPACITY
========================================================= */

function rainOpacity(rain) {

    if (rain < 0.2) return 0.25;
    if (rain < 1) return 0.35;
    if (rain < 3) return 0.42;
    if (rain < 7) return 0.50;
    if (rain < 15) return 0.58;

    return 0.65;

}


/* =========================================================
   WEATHER DESCRIPTION
========================================================= */

function weatherDescription(code) {

    const list = {

        0: "Ясно ☀️",
        1: "Преимущественно ясно 🌤️",
        2: "Переменная облачность ⛅",
        3: "Пасмурно ☁️",

        45: "Туман 🌫️",
        48: "Туман 🌫️",

        51: "Морось 🌦️",
        53: "Морось 🌦️",
        55: "Сильная морось 🌧️",

        56: "Ледяная морось 🌧️",
        57: "Сильная ледяная морось 🌧️",

        61: "Небольшой дождь 🌦️",
        63: "Дождь 🌧️",
        65: "Сильный дождь 🌧️",

        66: "Ледяной дождь 🌧️",
        67: "Сильный ледяной дождь 🌧️",

        71: "Снег 🌨️",
        73: "Снег ❄️",
        75: "Сильный снег ❄️",

        77: "Снежные зёрна 🌨️",

        80: "Ливень 🌦️",
        81: "Сильный ливень 🌧️",
        82: "Очень сильный ливень ⛈️",

        85: "Снегопад 🌨️",
        86: "Сильный снегопад ❄️",

        95: "Гроза ⛈️",
        96: "Гроза с градом ⛈️",
        99: "Сильная гроза ⛈️"

    };


    return list[code] || "Погода";

}


/* =========================================================
   WEATHER LOADING
========================================================= */

function setWeatherLoading() {

    const temp =
        document.querySelector(
            ".weather-temperature"
        );


    const description =
        document.querySelector(
            ".weather-description"
        );


    if (temp) {
        temp.textContent = "…";
    }


    if (description) {
        description.textContent =
            "Получаем погоду...";
    }

}


/* =========================================================
   WEATHER ERROR
========================================================= */

function showWeatherError() {

    const description =
        document.querySelector(
            ".weather-description"
        );


    if (description) {

        description.textContent =
            "Не удалось получить погоду";

    }

}


/* =========================================================
   LOCATION UI
========================================================= */

function updateLocationUI(
    lat,
    lon,
    name
) {

    if ($("locationName")) {

        $("locationName").textContent =
            name || "Selected location";

    }


    if ($("locationCoords")) {

        $("locationCoords").textContent =
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
        function () {

            if (!navigator.geolocation) {

                alert(
                    "GPS не поддерживается."
                );

                return;
            }


            button.textContent = "⌛";


            navigator.geolocation.getCurrentPosition(

                async function(position) {

                    const lat =
                        position.coords.latitude;

                    const lon =
                        position.coords.longitude;


                    SHOHIN.map.flyTo(
                        [lat, lon],
                        10,
                        {
                            duration: 1.2
                        }
                    );


                    await selectLocation(
                        lat,
                        lon,
                        "Моё местоположение"
                    );


                    button.textContent =
                        "📍";

                },

                function(error) {

                    console.error(
                        "GPS ERROR:",
                        error
                    );


                    button.textContent =
                        "📍";


                    alert(
                        "Разрешите доступ к местоположению."
                    );

                },

                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0
                }

            );

        }
    );

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


    let timer = null;


    input.addEventListener(
        "input",
        function () {

            clearTimeout(timer);


            const query =
                input.value.trim();


            if (query.length < 2) {

                hideSearchResults();

                return;

            }


            timer =
                setTimeout(
                    function() {

                        searchCity(query);

                    },
                    400
                );

        }
    );


    document.addEventListener(
        "click",
        function(event) {

            if (
                !event.target.closest(
                    ".search-wrapper"
                )
            ) {

                hideSearchResults();

            }

        }
    );

}


/* =========================================================
   SEARCH CITY
========================================================= */

async function searchCity(query) {

    try {

        const url =
            "https://geocoding-api.open-meteo.com/v1/search" +
            "?name=" +
            encodeURIComponent(query) +
            "&count=8" +
            "&language=ru" +
            "&format=json";


        const response =
            await fetch(url);


        if (!response.ok) {
            return;
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

    }

}


/* =========================================================
   SEARCH RESULTS
========================================================= */

function renderSearchResults(results) {

    const box =
        $("searchResults");


    if (!box) {
        return;
    }


    if (!results.length) {

        box.style.display =
            "none";

        return;

    }


    box.innerHTML =
        results.map(
            function(place) {

                return `
                    <div
                        class="search-result"
                        data-lat="${place.latitude}"
                        data-lon="${place.longitude}"
                        data-name="${escapeHTML(place.name)}"
                    >

                        <strong>
                            ${escapeHTML(place.name)}
                        </strong>

                        <small>
                            ${escapeHTML(
                                place.admin1 || ""
                            )}

                            ${
                                place.country
                                    ? " • " +
                                      escapeHTML(
                                          place.country
                                      )
                                    : ""
                            }
                        </small>

                    </div>
                `;

            }
        ).join("");


    box.style.display =
        "block";


    box.querySelectorAll(
        ".search-result"
    ).forEach(
        function(item) {

            item.addEventListener(
                "click",
                async function() {

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


                    if ($("searchInput")) {
                        $("searchInput").value =
                            "";
                    }


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
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   HIDE SEARCH
========================================================= */

function hideSearchResults() {

    const box =
        $("searchResults");


    if (box) {
        box.style.display =
            "none";
    }

}


/* =========================================================
   MAP CONTROLS
========================================================= */

function setupMapControls() {

    const zoomIn =
        $("zoomIn");


    if (zoomIn) {

        zoomIn.addEventListener(
            "click",
            function() {

                SHOHIN.map.zoomIn();

            }
        );

    }


    const zoomOut =
        $("zoomOut");


    if (zoomOut) {

        zoomOut.addEventListener(
            "click",
            function() {

                SHOHIN.map.zoomOut();

            }
        );

    }


    const center =
        $("centerMap");


    if (center) {

        center.addEventListener(
            "click",
            function() {

                SHOHIN.map.flyTo(
                    SHOHIN.defaultLocation,
                    4,
                    {
                        duration: 1
                    }
                );

            }
        );

    }

}


/* =========================================================
   LAYERS
========================================================= */

function setupLayers() {

    const mapButton =
        $("mapLayer");


    const satelliteButton =
        $("satelliteLayer");


    const temperatureButton =
        $("temperatureLayer");


    const rainButton =
        $("rainLayer");


    /* MAP */

    if (mapButton) {

        mapButton.addEventListener(
            "click",
            function() {

                SHOHIN.currentMode =
                    "none";


                hideWeatherLayers();

                removeSatellite();

                setActiveLayerButton(
                    mapButton
                );

            }
        );

    }


    /* SATELLITE */

    if (satelliteButton) {

        satelliteButton.addEventListener(
            "click",
            function() {

                SHOHIN.currentMode =
                    "none";


                hideWeatherLayers();


                if (
                    SHOHIN.map.hasLayer(
                        SHOHIN.standardLayer
                    )
                ) {

                    SHOHIN.map.removeLayer(
                        SHOHIN.standardLayer
                    );

                }


                SHOHIN.satelliteLayer.addTo(
                    SHOHIN.map
                );


                setActiveLayerButton(
                    satelliteButton
                );

            }
        );

    }


    /* TEMPERATURE */

    if (temperatureButton) {

        temperatureButton.addEventListener(
            "click",
            async function() {

                SHOHIN.currentMode =
                    "temperature";


                removeSatellite();

                hideRain();


                SHOHIN.temperatureLayer.addTo(
                    SHOHIN.map
                );


                setActiveLayerButton(
                    temperatureButton
                );


                await updateTemperatureGrid();

            }
        );

    }


    /* RAIN */

    if (rainButton) {

        rainButton.addEventListener(
            "click",
            async function() {

                SHOHIN.currentMode =
                    "rain";


                removeSatellite();

                hideTemperature();


                SHOHIN.rainLayer.addTo(
                    SHOHIN.map
                );


                setActiveLayerButton(
                    rainButton
                );


                await updateRainGrid();

            }
        );

    }


    /* WIND */

    setupWindButton();


    /* CLOUDS */

    setupCloudButton();

}


/* =========================================================
   WIND BUTTON
========================================================= */

function setupWindButton() {

    const button =
        $("windLayer");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function() {

            SHOHIN.currentMode =
                "wind";


            hideTemperature();

            hideRain();


            removeSatellite();


            setActiveLayerButton(
                button
            );


            if (
                typeof window.enableWind ===
                "function"
            ) {

                window.enableWind();

            } else {

                alert(
                    "Wind animation пока не загружена."
                );

            }

        }
    );

}


/* =========================================================
   CLOUD BUTTON
========================================================= */

function setupCloudButton() {

    const button =
        $("cloudLayer");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function() {

            alert(
                "☁️ Clouds\n\nСледующий этап SHOHIN WEATHER."
            );

        }
    );

}


/* =========================================================
   HIDE WEATHER LAYERS
========================================================= */

function hideWeatherLayers() {

    hideTemperature();
    hideRain();

}


/* =========================================================
   HIDE TEMPERATURE
========================================================= */

function hideTemperature() {

    if (!SHOHIN.temperatureLayer) {
        return;
    }


    SHOHIN.temperatureLayer.clearLayers();


    if (
        SHOHIN.map &&
        SHOHIN.map.hasLayer(
            SHOHIN.temperatureLayer
        )
    ) {

        SHOHIN.map.removeLayer(
            SHOHIN.temperatureLayer
        );

    }

}


/* =========================================================
   HIDE RAIN
========================================================= */

function hideRain() {

    if (!SHOHIN.rainLayer) {
        return;
    }


    SHOHIN.rainLayer.clearLayers();


    if (
        SHOHIN.map &&
        SHOHIN.map.hasLayer(
            SHOHIN.rainLayer
        )
    ) {

        SHOHIN.map.removeLayer(
            SHOHIN.rainLayer
        );

    }

}


/* =========================================================
   SATELLITE
========================================================= */

function removeSatellite() {

    if (
        !SHOHIN.map
    ) {
        return;
    }


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

}


/* =========================================================
   ACTIVE LAYER BUTTON
========================================================= */

function setActiveLayerButton(
    button
) {

    document
        .querySelectorAll(
            ".layer-button"
        )
        .forEach(
            function(item) {

                item.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


/* =========================================================
   CLOSE WEATHER CARD
========================================================= */

function setupCloseButton() {

    const button =
        $("closeCard");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function() {

            if (SHOHIN.marker) {

                SHOHIN.map.removeLayer(
                    SHOHIN.marker
                );

                SHOHIN.marker =
                    null;

            }

        }
    );

}


/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

function setupBottomNavigation() {

    const navMap =
        $("navMap");


    const navWeather =
        $("navWeather");


    const navWind =
        $("navWind");


    const navRain =
        $("navRain");


    const navSettings =
        $("navSettings");


    if (navMap) {

        navMap.addEventListener(
            "click",
            function() {

                if ($("mapLayer")) {
                    $("mapLayer").click();
                }

            }
        );

    }


    if (navWeather) {

        navWeather.addEventListener(
            "click",
            function() {

                if ($("temperatureLayer")) {
                    $("temperatureLayer").click();
                }

            }
        );

    }


    if (navWind) {

        navWind.addEventListener(
            "click",
            function() {

                if ($("windLayer")) {
                    $("windLayer").click();
                }

            }
        );

    }


    if (navRain) {

        navRain.addEventListener(
            "click",
            function() {

                if ($("rainLayer")) {
                    $("rainLayer").click();
                }

            }
        );

    }


    if (navSettings) {

        navSettings.addEventListener(
            "click",
            function() {

                alert(
                    "⚙️ SHOHIN WEATHER\n\nНастройки будут добавлены следующим этапом."
                );

            }
        );

    }

}


/* =========================================================
   LOADING
========================================================= */

function hideLoading() {

    const loading =
        $("loading");


    if (loading) {

        loading.classList.add(
            "hide"
        );

    }

}


/* =========================================================
   GLOBAL API
========================================================= */

window.SHOHIN =
    SHOHIN;

window.selectLocation =
    selectLocation;

window.enableTemperature =
    function() {

        if ($("temperatureLayer")) {
            $("temperatureLayer").click();
        }

    };

window.enableRain =
    function() {

        if ($("rainLayer")) {
            $("rainLayer").click();
        }

    };

window.hideTemperature =
    hideTemperature;

window.hideRain =
    hideRain;


/* =========================================================
   END
========================================================= */