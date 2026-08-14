/* =========================================
   SHOHIN WEATHER V1
   GLOBAL MAP FOUNDATION
========================================= */


const SHOHIN = {

  map: null,

  marker: null,

  defaultLocation: [
    38.5598,
    68.7870
  ],

  selectedLocation: null,

  searchTimer: null

};


/* =========================================
   INITIALIZE MAP
========================================= */

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


  /*
    Standard map
  */

  SHOHIN.standardLayer =
    L.tileLayer(

      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

      {

        maxZoom: 19,

        attribution:
          '&copy; OpenStreetMap contributors'

      }

    ).addTo(

      SHOHIN.map

    );


  /*
    Satellite
  */

  SHOHIN.satelliteLayer =
    L.tileLayer(

      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

      {

        maxZoom: 19,

        attribution:
          "Tiles © Esri"

      }

    );


  /*
    Click anywhere on map
  */

  SHOHIN.map.on(

    "click",

    event => {

      selectLocation(

        event.latlng.lat,

        event.latlng.lng

      );

    }

  );


  /*
    Initial location
  */

  selectLocation(

    SHOHIN.defaultLocation[0],

    SHOHIN.defaultLocation[1]

  );

}


/* =========================================
   SELECT LOCATION
========================================= */

function selectLocation(

  lat,

  lon,

  name = null

) {

  SHOHIN.selectedLocation = {

    lat,

    lon,

    name

  };


  updateLocationUI(

    lat,

    lon,

    name

  );


  /*
    Remove old marker
  */

  if (SHOHIN.marker) {

    SHOHIN.map.removeLayer(

      SHOHIN.marker

    );

  }


  /*
    New marker
  */

  SHOHIN.marker = L.marker(

    [lat, lon]

  ).addTo(

    SHOHIN.map

  );


  SHOHIN.marker.bindPopup(

    `
      <strong>
        SHOHIN WEATHER
      </strong>

      <br>

      <small>
        ${lat.toFixed(5)}°,
        ${lon.toFixed(5)}°
      </small>
    `

  );


  SHOHIN.marker.openPopup();


  /*
    Move map
  */

  SHOHIN.map.flyTo(

    [lat, lon],

    Math.max(

      SHOHIN.map.getZoom(),

      6

    ),

    {

      duration: 0.8

    }

  );

}


/* =========================================
   LOCATION UI
========================================= */

function updateLocationUI(

  lat,

  lon,

  name

) {

  const locationName =
    document.getElementById(
      "locationName"
    );


  const locationCoords =
    document.getElementById(
      "locationCoords"
    );


  locationName.textContent =

    name ||

    "Selected location";


  locationCoords.textContent =

    `${lat.toFixed(5)}°, ${lon.toFixed(5)}°`;

}


/* =========================================
   GPS
========================================= */

function locateUser() {

  if (!navigator.geolocation) {

    alert(
      "GPS не поддерживается."
    );

    return;

  }


  const button =
    document.getElementById(
      "gpsButton"
    );


  button.textContent = "…";


  navigator.geolocation.getCurrentPosition(

    position => {

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


      selectLocation(

        lat,

        lon,

        "My location"

      );


      button.textContent = "◎";

    },


    error => {

      console.error(error);

      alert(
        "Не удалось получить местоположение."
      );

      button.textContent = "◎";

    },


    {

      enableHighAccuracy: true,

      timeout: 10000,

      maximumAge: 60000

    }

  );

}


/* =========================================
   CITY SEARCH
========================================= */

function searchCity(query) {

  if (!query || query.length < 2) {

    hideSearchResults();

    return;

  }


  fetch(

    "https://geocoding-api.open-meteo.com/v1/search" +

    "?name=" +

    encodeURIComponent(query) +

    "&count=8" +

    "&language=ru" +

    "&format=json"

  )

  .then(

    response => {

      if (!response.ok) {

        throw new Error(
          "Geocoding error"
        );

      }

      return response.json();

    }

  )

  .then(

    data => {

      renderSearchResults(

        data.results || []

      );

    }

  )

  .catch(

    error => {

      console.error(error);

      hideSearchResults();

    }

  );

}


/* =========================================
   SEARCH RESULTS
========================================= */

function renderSearchResults(

  results

) {

  const container =
    document.getElementById(
      "searchResults"
    );


  if (!results.length) {

    container.innerHTML = "";

    container.style.display =
      "none";

    return;

  }


  container.innerHTML =

    results.map(

      place => {

        const name =
          escapeHTML(
            place.name || ""
          );

        const country =
          escapeHTML(
            place.country || ""
          );

        const admin =
          escapeHTML(
            place.admin1 || ""
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
              ${admin && country ? " • " : ""}
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

      element => {

        element.addEventListener(

          "click",

          () => {

            const lat =
              Number(
                element.dataset.lat
              );

            const lon =
              Number(
                element.dataset.lon
              );

            const name =
              element.dataset.name;


            selectLocation(

              lat,

              lon,

              name

            );


            document.getElementById(
              "searchInput"
            ).value = "";


            hideSearchResults();

          }

        );

      }

    );

}


/* =========================================
   HIDE SEARCH
========================================= */

function hideSearchResults() {

  const container =
    document.getElementById(
      "searchResults"
    );


  container.style.display =
    "none";

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

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


/* =========================================
   MAP BUTTONS
========================================= */

function setupMapControls() {

  document
    .getElementById("zoomIn")
    .addEventListener(

      "click",

      () => {

        SHOHIN.map.zoomIn();

      }

    );


  document
    .getElementById("zoomOut")
    .addEventListener(

      "click",

      () => {

        SHOHIN.map.zoomOut();

      }

    );

}


/* =========================================
   GPS BUTTON
========================================= */

function setupGPS() {

  document
    .getElementById("gpsButton")
    .addEventListener(

      "click",

      locateUser

    );

}


/* =========================================
   SEARCH INPUT
========================================= */

function setupSearch() {

  const input =
    document.getElementById(
      "searchInput"
    );


  input.addEventListener(

    "input",

    event => {

      const query =
        event.target.value.trim();


      clearTimeout(
        SHOHIN.searchTimer
      );


      SHOHIN.searchTimer =

        setTimeout(

          () => {

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

    event => {

      if (
        event.key === "Escape"
      ) {

        input.value = "";

        hideSearchResults();

      }

    }

  );

}


/* =========================================
   CLOSE CARD
========================================= */

function setupCloseButton() {

  document
    .getElementById("closeCard")
    .addEventListener(

      "click",

      () => {

        if (SHOHIN.marker) {

          SHOHIN.map.removeLayer(

            SHOHIN.marker

          );

          SHOHIN.marker = null;

        }


        document
          .getElementById(
            "locationName"
          )
          .textContent =
          "Select a location";


        document
          .getElementById(
            "locationCoords"
          )
          .textContent =
          "Tap anywhere on the map";

      }

    );

}


/* =========================================
   START
========================================= */

document.addEventListener(

  "DOMContentLoaded",

  () => {

    initMap();

    setupGPS();

    setupSearch();

    setupMapControls();

    setupCloseButton();


    setTimeout(

      () => {

        document
          .getElementById(
            "loading"
          )
          .classList.add(
            "hide"
          );

      },

      900

    );

  }

);