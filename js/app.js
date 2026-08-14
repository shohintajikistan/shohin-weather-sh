"use strict";

/* =========================================================
   SHOHIN WEATHER V3.1
   GLOBAL REAL TEMPERATURE GRID
========================================================= */

const SHOHIN = {

    map: null,
    marker: null,

    standardLayer: null,
    satelliteLayer: null,

    temperatureLayer: null,

    selectedLocation: null,

    weatherTimer: null,

    defaultLocation: [38.5598, 68.7870]

};


/* =========================================================
   DOM
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initMap();

        setupGPS();

        setupSearch();

        setupMapControls();

        setupLayers();

        setupCloseButton();

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
            maxZoom: 18,
            worldCopyJump: true
        }
    ).setView(
        SHOHIN.defaultLocation,
        4
    );


    /* NORMAL MAP */

    SHOHIN.standardLayer =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        );


    SHOHIN.standardLayer.addTo(
        SHOHIN.map
    );


    /* SATELLITE */

    SHOHIN.satelliteLayer =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                maxZoom: 19,
                attribution:
                    "Tiles © Esri"
            }
        );


    /* TEMPERATURE GROUP */

    SHOHIN.temperatureLayer =
        L.layerGroup().addTo(
            SHOHIN.map
        );


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


    /* UPDATE WEATHER GRID */

    SHOHIN.map.on(
        "moveend",
        function () {

            if (
                isTemperatureMode()
            ) {

                updateTemperatureGrid();

            }

        }
    );


    SHOHIN.map.on(
        "zoomend",
        function () {

            if (
                isTemperatureMode()
            ) {

                updateTemperatureGrid();

            }

        }
    );


    /* INITIAL */

    selectLocation(
        38.5598,
        68.7870,
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


    if (
        SHOHIN.marker
    ) {

        SHOHIN.map.removeLayer(
            SHOHIN.marker
        );

    }


    SHOHIN.marker =
        L.marker(
            [
                lat,
                lon
            ]
        ).addTo(
            SHOHIN.map
        );


    SHOHIN.marker.bindPopup(
        `
        <div style="
            text-align:center;
            min-width:160px;
        ">

            <strong>
                SHOHIN WEATHER
            </strong>

            <br>

            <span>
                ${lat.toFixed(4)}°,
                ${lon.toFixed(4)}°
            </span>

            <br>

            <span>
                Loading weather...
            </span>

        </div>
        `
    );


    SHOHIN.marker.openPopup();


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
            duration: 0.8
        }
    );


    await loadWeather(
        lat,
        lon,
        name
    );

}


/* =========================================================
   REAL WEATHER FOR SELECTED POINT
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
            lat +

            "&longitude=" +
            lon +

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
            "uv_index_max,sunrise,sunset" +

            "&timezone=auto";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Weather API error"
            );

        }


        const data =
            await response.json();


        displayWeather(
            data
        );


    }

    catch (error) {

        console.error(
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

    if (
        !data.current
    ) {

        return;

    }


    const current =
        data.current;


    const temp =
        current.temperature_2m;


    const humidity =
        current.relative_humidity_2m;


    const wind =
        current.wind_speed_10m;


    const clouds =
        current.cloud_cover;


    const rain =
        current.precipitation;


    const pressure =
        current.pressure_msl;


    const apparent =
        current.apparent_temperature;


    const code =
        current.weather_code;


    const tempElement =
        document.querySelector(
            ".weather-temperature"
        );


    if (tempElement) {

        tempElement.textContent =
            Math.round(temp) +
            "°C";

    }


    const description =
        document.querySelector(
            ".weather-description"
        );


    if (description) {

        description.textContent =
            weatherDescription(
                code
            );

    }


    const cards =
        document.querySelectorAll(
            ".weather-mini-grid > div"
        );


    if (
        cards.length >= 4
    ) {

        cards[0]
            .querySelector("strong")
            .textContent =
            Math.round(wind) +
            " km/h";


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
            Number(rain).toFixed(1) +
            " mm";

    }


    updateExtraWeather(
        pressure,
        apparent
    );


    if (
        SHOHIN.marker
    ) {

        SHOHIN.marker.bindPopup(

            `
            <div style="
                text-align:center;
                min-width:180px;
            ">

                <strong style="
                    font-size:22px;
                ">
                    ${Math.round(temp)}°C
                </strong>

                <br>

                ${weatherDescription(code)}

                <hr>

                💨 ${Math.round(wind)}
                km/h

                <br>

                💧 ${Math.round(humidity)}%

                <br>

                ☁️ ${Math.round(clouds)}%

                <br>

                🌧️ ${Number(rain).toFixed(1)}
                mm

            </div>
            `
        );

    }

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
        !SHOHIN.map
    ) {

        return;

    }


    const zoom =
        SHOHIN.map.getZoom();


    /*
       Too many API requests are avoided
       when zoomed far out.
    */

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
        bounds.getWest();


    const east =
        bounds.getEast();


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

            /*
               Keep requests reasonable.
            */

            if (
                points.length >= 300
            ) {

                break;

            }


            points.push(
                [
                    lat,
                    lon
                ]
            );

        }

        if (
            points.length >= 300
        ) {

            break;

        }

    }


    if (
        points.length === 0
    ) {

        return;

    }


    const lats =
        points
            .map(
                p => p[0]
            )
            .join(",");


    const lons =
        points
            .map(
                p => p[1]
            )
            .join(",");


    const url =

        "https://api.open-meteo.com/v1/forecast" +

        "?latitude=" +
        lats +

        "&longitude=" +
        lons +

        "&current=temperature_2m" +

        "&timezone=auto";


    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Grid request failed"
            );

        }


        const data =
            await response.json();


        drawTemperatureGrid(
            points,
            data
        );

    }

    catch (error) {

        console.error(
            "Temperature grid:",
            error
        );

    }

}


/* =========================================================
   DRAW TEMPERATURE GRID
========================================================= */

function drawTemperatureGrid(
    points,
    data
) {

    SHOHIN.temperatureLayer.clearLayers();


    /*
       Open-Meteo returns an array
       when multiple coordinates are used.
    */

    const weatherArray =
        Array.isArray(data)
            ? data
            : [data];


    points.forEach(
        function (point, index) {

            const weather =
                weatherArray[index];


            if (
                !weather ||
                !weather.current
            ) {

                return;

            }


            const temperature =
                weather.current
                    .temperature_2m;


            const radius =
                getGridRadius();


            const circle =
                L.circle(
                    point,
                    {
                        radius:
                            radius,

                        stroke:
                            false,

                        fillColor:
                            temperatureColor(
                                temperature
                            ),

                        fillOpacity:
                            0.42,

                        interactive:
                            false
                    }
                );


            circle.addTo(
                SHOHIN.temperatureLayer
            );


            /*
               Temperature label
            */

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
                                L.divIcon(
                                    {
                                        className:
                                            "shohin-temp-label",

                                        html:
                                            `<div>
                                                ${Math.round(temperature)}°
                                            </div>`,

                                        iconSize:
                                            [
                                                42,
                                                22
                                            ],

                                        iconAnchor:
                                            [
                                                21,
                                                11
                                            ]
                                    }
                                )
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
   GRID RADIUS
========================================================= */

function getGridRadius() {

    const zoom =
        SHOHIN.map.getZoom();


    if (
        zoom <= 2
    ) {

        return 700000;

    }


    if (
        zoom <= 3
    ) {

        return 450000;

    }


    if (
        zoom <= 4
    ) {

        return 280000;

    }


    if (
        zoom <= 5
    ) {

        return 170000;

    }


    return 100000;

}


/* =========================================================
   TEMPERATURE COLORS
========================================================= */

function temperatureColor(
    temp
) {

    if (temp <= -30)
        return "#4b0082";

    if (temp <= -20)
        return "#0000ff";

    if (temp <= -10)
        return "#008cff";

    if (temp <= 0)
        return "#00c8ff";

    if (temp <= 10)
        return "#00d084";

    if (temp <= 20)
        return "#a8d400";

    if (temp <= 25)
        return "#ffe000";

    if (temp <= 30)
        return "#ffae00";

    if (temp <= 35)
        return "#ff6400";

    if (temp <= 40)
        return "#ff2200";

    return "#c00000";

}


/* =========================================================
   CHECK TEMPERATURE MODE
========================================================= */

function isTemperatureMode() {

    const button =
        $("temperatureLayer");


    if (!button) {

        return false;

    }


    return button.classList.contains(
        "active"
    );

}


/* =========================================================
   WEATHER DESCRIPTION
========================================================= */

function weatherDescription(
    code
) {

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

        61: "Небольшой дождь 🌦️",

        63: "Дождь 🌧️",

        65: "Сильный дождь 🌧️",

        71: "Снег 🌨️",

        73: "Снег ❄️",

        75: "Сильный снег ❄️",

        80: "Ливень 🌦️",

        81: "Сильный ливень 🌧️",

        82: "Очень сильный ливень ⛈️",

        95: "Гроза ⛈️",

        96: "Гроза с градом ⛈️",

        99: "Сильная гроза ⛈️"

    };


    return (
        list[code] ||
        "Погода"
    );

}


/* =========================================================
   WEATHER LOADING
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
            "Ошибка получения погоды";

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
        function () {

            if (
                !navigator.geolocation
            ) {

                alert(
                    "GPS не поддерживается."
                );

                return;

            }


            button.textContent =
                "⌛";


            navigator.geolocation.getCurrentPosition(

                async function (
                    position
                ) {

                    const lat =
                        position.coords.latitude;


                    const lon =
                        position.coords.longitude;


                    await selectLocation(

                        lat,

                        lon,

                        "Моё местоположение"

                    );


                    button.textContent =
                        "📍";

                },

                function () {

                    button.textContent =
                        "📍";


                    alert(
                        "Разрешите доступ к GPS."
                    );

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


    input.addEventListener(
        "input",
        function () {

            clearTimeout(
                SHOHIN.weatherTimer
            );


            const query =
                input.value.trim();


            if (
                query.length < 2
            ) {

                hideSearchResults();

                return;

            }


            SHOHIN.weatherTimer =
                setTimeout(
                    function () {

                        searchCity(
                            query
                        );

                    },
                    400
                );

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
            await fetch(url);


        const data =
            await response.json();


        renderSearchResults(
            data.results || []
        );

    }

    catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   SEARCH RESULTS
========================================================= */

function renderSearchResults(
    results
) {

    const box =
        $("searchResults");


    if (!box) {

        return;

    }


    if (
        !results.length
    ) {

        box.style.display =
            "none";

        return;

    }


    box.innerHTML =

        results.map(
            function (place) {

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
                            ${escapeHTML(place.country || "")}
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
                        4
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


    if (mapButton) {

        mapButton.addEventListener(
            "click",
            function () {

                removeSatellite();

                hideTemperature();

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


                SHOHIN.satelliteLayer.addTo(
                    SHOHIN.map
                );


                hideTemperature();


                setActiveLayerButton(
                    satelliteButton
                );

            }
        );

    }


    if (temperatureButton) {

        temperatureButton.addEventListener(
            "click",
            async function () {

                removeSatellite();


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
                    temperatureButton
                );


                await updateTemperatureGrid();

            }
        );

    }


    setupFutureLayer(
        "windLayer",
        "Wind"
    );


    setupFutureLayer(
        "rainLayer",
        "Rain"
    );


    setupFutureLayer(
        "cloudLayer",
        "Clouds"
    );

}


/* =========================================================
   FUTURE WEATHER LAYERS
========================================================= */

function setupFutureLayer(
    id,
    name
) {

    const button =
        $(id);


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            alert(
                name +
                " layer будет добавлен следующим этапом."
            );

        }
    );

}


/* =========================================================
   SATELLITE
========================================================= */

function removeSatellite() {

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
   HIDE TEMPERATURE
========================================================= */

function hideTemperature() {

    SHOHIN.temperatureLayer.clearLayers();

}


/* =========================================================
   ACTIVE BUTTON
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
   CLOSE
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

        }
    );

}


/* =========================================================
   BOTTOM NAV
========================================================= */

function setupBottomNavigation() {

    const weather =
        $("navWeather");


    if (weather) {

        weather.addEventListener(
            "click",
            function () {

                if (
                    $("temperatureLayer")
                ) {

                    $("temperatureLayer")
                        .click();

                }

            }
        );

    }


    const map =
        $("navMap");


    if (map) {

        map.addEventListener(
            "click",
            function () {

                if (
                    $("mapLayer")
                ) {

                    $("mapLayer")
                        .click();

                }

            }
        );

    }


    const wind =
        $("navWind");


    if (wind) {

        wind.addEventListener(
            "click",
            function () {

                alert(
                    "Wind layer — V3.3"
                );

            }
        );

    }


    const rain =
        $("navRain");


    if (rain) {

        rain.addEventListener(
            "click",
            function () {

                alert(
                    "Rain layer — V3.2"
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

                alert(
                    "SHOHIN WEATHER V3.1"
                );

            }
        );

    }

}


/* =========================================================
   LOADING
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
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(value)

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
   START
========================================================= */

console.log(
    "🌍 SHOHIN WEATHER V3.1"
);

console.log(
    "🌡️ REAL GLOBAL TEMPERATURE GRID"
);