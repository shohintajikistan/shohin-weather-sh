/*
====================================================
 SHOHIN WEATHER V6.3.1
 GlobalWeatherLayer.js

 FIX:
 - draw(undefined) protection
 - show() always receives array
 - Open-Meteo batch request
 - Global weather grid
====================================================
*/

export class GlobalWeatherLayer {

    constructor(mapEngine, options = {}) {

        this.mapEngine = mapEngine;

        this.variable =
            options.variable || "temperature";

        this.opacity =
            Number(options.opacity ?? 0.45);

        this.gridSize =
            Number(options.gridSize ?? 9);

        this.step =
            Number(options.step ?? 5);

        this.layer = null;

        this.visible = false;

        this.loading = false;

        this.points = [];

        this.cache = new Map();

    }


    /* ==============================================
       COLOR
    ============================================== */

    color(value) {

        if (!Number.isFinite(value)) {
            return "#64748b";
        }


        switch (this.variable) {

            case "temperature":

                if (value <= -20) return "#172554";
                if (value <= -10) return "#1d4ed8";
                if (value <= 0) return "#38bdf8";
                if (value <= 10) return "#22d3ee";
                if (value <= 20) return "#4ade80";
                if (value <= 25) return "#facc15";
                if (value <= 30) return "#fb923c";
                if (value <= 35) return "#f97316";
                if (value <= 40) return "#ef4444";

                return "#991b1b";


            case "precipitation":

                if (value <= 0) return "#0f172a";
                if (value < 1) return "#38bdf8";
                if (value < 5) return "#22c55e";
                if (value < 10) return "#eab308";
                if (value < 20) return "#f97316";

                return "#ef4444";


            case "cloud":

                if (value < 20) return "#0ea5e9";
                if (value < 40) return "#64748b";
                if (value < 60) return "#475569";
                if (value < 80) return "#334155";

                return "#111827";


            case "wind":

                if (value < 10) return "#22c55e";
                if (value < 20) return "#eab308";
                if (value < 30) return "#f97316";

                return "#ef4444";


            case "pressure":

                if (value < 990) return "#2563eb";
                if (value < 1005) return "#38bdf8";
                if (value < 1020) return "#22c55e";
                if (value < 1035) return "#facc15";

                return "#ef4444";


            case "uv":

                if (value < 3) return "#22c55e";
                if (value < 6) return "#eab308";
                if (value < 8) return "#f97316";
                if (value < 11) return "#ef4444";

                return "#7c3aed";


            default:

                return "#38bdf8";

        }

    }


    /* ==============================================
       API VARIABLE
    ============================================== */

    getApiVariable() {

        switch (this.variable) {

            case "temperature":
                return "temperature_2m";

            case "precipitation":
                return "precipitation";

            case "wind":
                return "wind_speed_10m";

            case "cloud":
                return "cloud_cover";

            case "pressure":
                return "pressure_msl";

            case "uv":
                return "uv_index";

            default:
                return "temperature_2m";

        }

    }


    /* ==============================================
       BUILD GLOBAL GRID
    ============================================== */

    buildCoordinates() {

        const points = [];

        const half =
            Math.floor(this.gridSize / 2);


        for (
            let y = -half;
            y <= half;
            y++
        ) {

            for (
                let x = -half;
                x <= half;
                x++
            ) {

                const latitude =
                    y * this.step;

                const longitude =
                    x * this.step;


                if (
                    latitude < -85 ||
                    latitude > 85
                ) {
                    continue;
                }


                points.push({

                    latitude:
                        Number(latitude.toFixed(2)),

                    longitude:
                        Number(longitude.toFixed(2)),

                    value:
                        null

                });

            }

        }


        return points;

    }


    /* ==============================================
       BATCH LOAD
    ============================================== */

    async loadGlobal() {

        const points =
            this.buildCoordinates();


        if (!Array.isArray(points)) {

            this.points = [];

            return this.points;

        }


        if (points.length === 0) {

            this.points = [];

            return this.points;

        }


        const latitudes =
            points
                .map(
                    p => p.latitude
                )
                .join(",");


        const longitudes =
            points
                .map(
                    p => p.longitude
                )
                .join(",");


        const variable =
            this.getApiVariable();


        const url =
            "https://api.open-meteo.com/v1/forecast" +

            "?latitude=" +
            encodeURIComponent(
                latitudes
            ) +

            "&longitude=" +
            encodeURIComponent(
                longitudes
            ) +

            "&current=" +
            encodeURIComponent(
                variable
            ) +

            "&timezone=UTC";


        try {

            const response =
                await fetch(
                    url,
                    {
                        cache:
                            "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Open-Meteo HTTP " +
                    response.status
                );

            }


            const data =
                await response.json();


            /*
            =========================================
             Open-Meteo may return:
             - array
             - single object
            =========================================
            */

            const results =
                Array.isArray(data)
                    ? data
                    : [data];


            for (
                let i = 0;
                i < points.length;
                i++
            ) {

                const item =
                    results[i];


                if (!item) {
                    continue;
                }


                const value =
                    Number(
                        item?.current?.[
                            variable
                        ]
                    );


                if (
                    Number.isFinite(value)
                ) {

                    points[i].value =
                        value;

                }

            }


            this.points =
                points.filter(
                    point =>
                        Number.isFinite(
                            point.value
                        )
                );


            return this.points;

        }
        catch(error) {

            console.error(
                "GlobalWeatherLayer load error:",
                error
            );


            this.points =
                [];


            return this.points;

        }

    }


    /* ==============================================
       FORMAT
    ============================================== */

    formatValue(value) {

        if (!Number.isFinite(value)) {
            return "--";
        }


        switch (this.variable) {

            case "temperature":

                return (
                    "🌡 " +
                    value.toFixed(1) +
                    " °C"
                );


            case "precipitation":

                return (
                    "🌧 " +
                    value.toFixed(1) +
                    " mm"
                );


            case "wind":

                return (
                    "💨 " +
                    value.toFixed(1) +
                    " km/h"
                );


            case "cloud":

                return (
                    "☁ " +
                    value.toFixed(0) +
                    " %"
                );


            case "pressure":

                return (
                    "🌀 " +
                    value.toFixed(0) +
                    " hPa"
                );


            case "uv":

                return (
                    "☀️ UV " +
                    value.toFixed(1)
                );


            default:

                return String(value);

        }

    }


    /* ==============================================
       DRAW
    ============================================== */

    draw(points = []) {

        /*
        =============================================
         IMPORTANT FIX
        =============================================
        */

        if (!Array.isArray(points)) {

            points = [];

        }


        if (!this.mapEngine) {

            console.error(
                "GlobalWeatherLayer: mapEngine missing"
            );

            return null;

        }


        const map =
            this.mapEngine.map;


        if (!map) {

            console.error(
                "GlobalWeatherLayer: Leaflet map missing"
            );

            return null;

        }


        /*
        =============================================
         REMOVE OLD
        =============================================
        */

        if (this.layer) {

            try {

                map.removeLayer(
                    this.layer
                );

            }
            catch(error) {

                console.warn(
                    "Layer remove:",
                    error
                );

            }

        }


        this.layer =
            L.layerGroup();


        /*
        =============================================
         DRAW POINTS
        =============================================
        */

        points.forEach(
            point => {

                if (!point) {
                    return;
                }


                const latitude =
                    Number(
                        point.latitude
                    );


                const longitude =
                    Number(
                        point.longitude
                    );


                const value =
                    Number(
                        point.value
                    );


                if (
                    !Number.isFinite(
                        latitude
                    ) ||
                    !Number.isFinite(
                        longitude
                    ) ||
                    !Number.isFinite(
                        value
                    )
                ) {

                    return;

                }


                const half =
                    this.step / 2;


                const bounds = [

                    [
                        latitude - half,
                        longitude - half
                    ],

                    [
                        latitude + half,
                        longitude + half
                    ]

                ];


                const rectangle =
                    L.rectangle(
                        bounds,
                        {

                            stroke:
                                false,

                            fill:
                                true,

                            fillColor:
                                this.color(
                                    value
                                ),

                            fillOpacity:
                                this.opacity,

                            interactive:
                                true

                        }
                    );


                rectangle.bindTooltip(

                    this.formatValue(
                        value
                    ),

                    {
                        sticky:
                            true
                    }

                );


                rectangle.addTo(
                    this.layer
                );

            }
        );


        this.layer.addTo(
            map
        );


        return this.layer;

    }


    /* ==============================================
       SHOW
    ============================================== */

    async show() {

        if (this.visible) {

            return true;

        }


        if (this.loading) {

            return false;

        }


        this.loading =
            true;


        try {

            const points =
                await this.loadGlobal();


            /*
            =========================================
             FINAL SAFETY CHECK
            =========================================
            */

            const safePoints =
                Array.isArray(points)
                    ? points
                    : [];


            this.draw(
                safePoints
            );


            this.visible =
                true;


            return true;

        }
        finally {

            this.loading =
                false;

        }

    }


    /* ==============================================
       HIDE
    ============================================== */

    hide() {

        const map =
            this.mapEngine?.map;


        if (
            map &&
            this.layer
        ) {

            try {

                map.removeLayer(
                    this.layer
                );

            }
            catch(error) {

                console.warn(
                    "Global hide:",
                    error
                );

            }

        }


        this.layer =
            null;

        this.visible =
            false;

    }


    /* ==============================================
       TOGGLE
    ============================================== */

    async toggle() {

        if (this.visible) {

            this.hide();

            return false;

        }


        return await this.show();

    }


    /* ==============================================
       VARIABLE
    ============================================== */

    setVariable(variable) {

        const allowed = [

            "temperature",
            "precipitation",
            "cloud",
            "wind",
            "pressure",
            "uv"

        ];


        if (
            !allowed.includes(
                variable
            )
        ) {

            console.warn(
                "Unknown global variable:",
                variable
            );

            return;

        }


        this.hide();

        this.variable =
            variable;

        this.points =
            [];

    }


    /* ==============================================
       OPACITY
    ============================================== */

    setOpacity(opacity) {

        const value =
            Number(opacity);


        if (
            !Number.isFinite(value)
        ) {

            return;

        }


        this.opacity =
            Math.max(
                0,
                Math.min(
                    1,
                    value
                )
            );


        if (!this.layer) {
            return;
        }


        this.layer.eachLayer(
            layer => {

                if (
                    layer.setStyle
                ) {

                    layer.setStyle({

                        fillOpacity:
                            this.opacity

                    });

                }

            }
        );

    }


    /* ==============================================
       REFRESH
    ============================================== */

    async refresh() {

        this.hide();

        this.points =
            [];

        return await this.show();

    }


    /* ==============================================
       STATUS
    ============================================== */

    isVisible() {

        return this.visible;

    }


    /* ==============================================
       DESTROY
    ============================================== */

    destroy() {

        this.hide();

        this.points =
            [];

        this.mapEngine =
            null;

    }

}