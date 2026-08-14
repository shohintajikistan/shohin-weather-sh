/* =========================================================
   SHOHIN WEATHER V1
   js/app.js
   GLOBAL MAP + GPS + SEARCH
========================================================= */

"use strict";


/* =========================================================
   APP STATE
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
   DOM HELPER
========================================================= */

function $(id) {

    return document.getElementById(id);

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initMap();

        setupGPS();

        setupSearch();

        setupMapControls();

        setupCloseButton();

        setupSatelliteToggle();

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


    /* -----------------------------------------
       STANDARD MAP
    ----------------------------------------- */

    SHOHIN.standardLayer = L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {
            maxZoom: 19,

            attribution:
                '&copy; OpenStreetMap contributors'
        }

    );


    SHOHIN.standardLayer.addTo(
        SHOHIN.map
    );


    /* -----------------------------------------
       SATELLITE MAP
    ----------------------------------------- */

    SHOHIN.satelliteLayer = L.tileLayer(

        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

        {
            maxZoom: 19,

            attribution:
                "Tiles &copy; Esri"
        }

    );


    /* -----------------------------------------
       MAP CLICK
    ----------------------------------------- */

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

}


/* =========================================================
   SELECT LOCATION
========================================================= */

function selectLocation(
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
        name
    );


    /* -----------------------------------------
       REMOVE OLD MARKER
    ----------------------------------------- */

    if (
        SHOHIN.marker
    ) {

        SHOHIN.map.removeLayer(
            SHOHIN.marker
        );

    }


    /* -----------------------------------------
       CREATE NEW MARKER
    ----------------------------------------- */

    SHOHIN.marker = L.marker(
        [
            lat,
            lon
        ]
    ).addTo(
        SHOHIN.map
    );


    /* -----------------------------------------
       POPUP
    ----------------------------------------- */

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
                ${lat.toFixed(5)}°,
                ${lon.toFixed(5)}°
            </span>

        </div>
        `

    );


    SHOHIN.marker.openPopup();


    /* -----------------------------------------
       MOVE MAP
    ----------------------------------------- */

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

}


/* =========================================================
   LOCATION UI
========================================================= */

function updateLocationUI(
    lat,
    lon,
    name
) {

    const locationName =
        $("locationName");

    const locationCoords =
        $("locationCoords");


    if (!locationName ||
        !locationCoords) {

        return;

    }


    locationName.textContent =
        name ||
        "Selected location";


    locationCoords.textContent =

        lat.toFixed(5) +
        "°, " +
        lon.toFixed(5) +
        "°";

}


/* =========================================================
   GPS
========================================================= */

function setupGPS() {

    const button =
        $("gpsButton");


    if (!button) {

        console.error(
            "GPS button not found"
        );

        return;

    }


    button.addEventListener(
        "click",
        locateUser
    );

}


/* =========================================================
   GET USER LOCATION
========================================================= */

function locateUser() {

    if (
        !navigator.geolocation
    ) {

        showMessage(
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


    showMessage(
        "📍 Определяем местоположение..."
    );


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;


            console.log(
                "SHOHIN GPS:",
                lat,
                lon
            );


            /* -----------------------------------------
               MOVE MAP
            ----------------------------------------- */

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


            /* -----------------------------------------
               SELECT LOCATION
            ----------------------------------------- */

            selectLocation(

                lat,

                lon,

                "Моё местоположение"

            );


            button.textContent =
                "◎";


            button.disabled =
                false;


            showMessage(
                "📍 Местоположение найдено"
            );


            /* -----------------------------------------
               TRY REVERSE GEOCODING
            ----------------------------------------- */

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
                "◎";


            button.disabled =
                false;


            handleLocationError(
                error
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


/* =========================================================
   GPS ERROR HANDLER
========================================================= */

function handleLocationError(
    error
) {

    if (
        error.code ===
        error.PERMISSION_DENIED
    ) {

        showMessage(
            "⚠️ Разрешите доступ к местоположению."
        );

        return;

    }


    if (
        error.code ===
        error.POSITION_UNAVAILABLE
    ) {

        showMessage(
            "⚠️ Местоположение недоступно. Включите GPS."
        );

        return;

    }


    if (
        error.code ===
        error.TIMEOUT
    ) {

        showMessage(
            "⚠️ GPS не ответил вовремя. Попробуйте ещё раз."
        );

        return;

    }


    showMessage(
        "⚠️ Не удалось определить местоположение."
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


        if (
            !response.ok
        ) {

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


        if (
            SHOHIN.marker
        ) {

            SHOHIN.marker.bindPopup(

                `
                <div style="
                    min-width:170px;
                    text-align:center;
                ">

                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    <br>

                    <span style="
                        color:#999;
                        font-size:10px;
                    ">
                        ${lat.toFixed(5)}°,
                        ${lon.toFixed(5)}°
                    </span>

                </div>
                `

            );

        }


    } catch (error) {

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
                    400
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


            if (
                event.key ===
                "Enter"
            ) {

                const query =
                    input.value.trim();


                if (
                    query.length >= 2
                ) {

                    searchCity(
                        query
                    );

                }

            }

        }
    );

}


/* =========================================================
   CITY SEARCH API
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


        if (
            !response.ok
        ) {

            throw new Error(
                "Search failed"
            );

        }


        const data =
            await response.json();


        renderSearchResults(
            data.results || []
        );


    } catch (error) {

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

        container.innerHTML =
            "";

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

                        data-lat="
                            ${place.latitude}
                        "

                        data-lon="
                            ${place.longitude}
                        "

                        data-name="
                            ${name}
                        "
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


    const items =
        container.querySelectorAll(
            ".search-result"
        );


    items.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

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


                    selectLocation(

                        lat,

                        lon,

                        name

                    );


                    $("searchInput")
                        .value =
                        "";


                    hideSearchResults();

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


    if (!container) {

        return;

    }


    container.style.display =
        "none";

}


/* =========================================================
   MAP CONTROLS
========================================================= */

function setupMapControls() {

    const zoomIn =
        $("zoomIn");


    const zoomOut =
        $("zoomOut");


    if (zoomIn) {

        zoomIn.addEventListener(
            "click",
            function () {

                SHOHIN.map.zoomIn();

            }
        );

    }


    if (zoomOut) {

        zoomOut.addEventListener(
            "click",
            function () {

                SHOHIN.map.zoomOut();

            }
        );

    }

}


/* =========================================================
   CLOSE CARD
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
   SATELLITE TOGGLE
========================================================= */

function setupSatelliteToggle() {

    /*
       V1 foundation.
       Satellite layer is ready.

       Later we will connect it
       to a proper weather-layer
       control.
    */

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message
) {

    console.log(
        "SHOHIN:",
        message
    );


    /*
       Temporary visible message.
       Uses alert so it works everywhere.
    */

    alert(
        message
    );

}


/* =========================================================
   LOADING
========================================================= */

function hideLoading() {

    setTimeout(
        function () {

            const loading =
                $("loading");


            if (
                loading
            ) {

                loading.classList.add(
                    "hide"
                );

            }

        },
        900
    );

}


/* =========================================================
   ESCAPE HTML
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
   DEBUG
========================================================= */

console.log(
    "🌍 SHOHIN WEATHER V1 loaded"
);