/*
====================================================
 SHOHIN WEATHER V6.2
 GlobalWeatherLayer.js

 GLOBAL WEATHER DATA
 SOURCE: Open-Meteo

 Temperature
 Precipitation
 Wind
 Cloud Cover
 Pressure
 UV

 No fake/random weather values.
====================================================
*/

export class GlobalWeatherLayer {

    constructor(mapEngine, options = {}) {

        this.mapEngine = mapEngine;

        this.variable =
            options.variable || "temperature";

        this.opacity =
            Number(
                options.opacity ?? 0.45
            );

        this.layer = null;

        this.visible = false;

        this.loading = false;

        this.cache = new Map();

        this.gridSize =
            Number(
                options.gridSize ?? 9
            );

        this.step =
            Number(
                options.step ?? 5
            );

    }


    /*
    =================================================
     COLOR
    =================================================
    */

    color(value) {

        if (
            this.variable ===
            "temperature"
        ) {

            if (value <= -20)
                return "#172554";

            if (value <= -10)
                return "#1d4ed8";

            if (value <= 0)
                return "#38bdf8";

            if (value <= 10)
                return "#22d3ee";

            if (value <= 20)
                return "#4ade80";

            if (value <= 25)
                return "#facc15";

            if (value <= 30)
                return "#fb923c";

            if (value <= 35)
                return "#f97316";

            if (value <= 40)
                return "#ef4444";

            return "#991b1b";
        }


        if (
            this.variable ===
            "precipitation"
        ) {

            if (value <= 0)
                return "#0f172a";

            if (value < 1)
                return "#38bdf8";

            if (value < 5)
                return "#22c55e";

            if (value < 10)
                return "#eab308";

            if (value < 20)
                return "#f97316";

            return "#ef4444";
        }


        if (
            this.variable ===
            "cloud"
        ) {

            if (value < 20)
                return "#0ea5e9";

            if (value < 40)
                return "#64748b";

            if (value < 60)
                return "#475569";

            if (value < 80)
                return "#334155";

            return "#111827";
        }


        if (
            this.variable ===
            "wind"
        ) {

            if (value < 10)
                return "#22c55e";

            if (value < 20)
                return "#eab308";

            if (value < 30)
                return "#f97316";

            return "#ef4444";
        }


        if (
            this.variable ===
            "pressure"
        ) {

            if (value < 990)
                return "#2563eb";

            if (value < 1005)
                return "#38bdf8";

            if (value < 1020)
                return "#22c55e";

            if (value < 1035)
                return "#facc15";

            return "#ef4444";
        }


        if (
            this.variable ===
            "uv"
        ) {

            if (value < 3)
                return "#22c55e";

            if (value < 6)
                return "#eab308";

            if (value < 8)
                return "#f97316";

            if (value < 11)
                return "#ef4444";

            return "#7c3aed";
        }


        return "#38bdf8";

    }


    /*
    =================================================
     API VARIABLE
    =================================================
    */

    getApiVariable() {

        switch (
            this.variable
        ) {

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


    /*
    =================================================
     LOAD POINT
    =================================================
    */

    async loadPoint(
        latitude,
        longitude
    ) {

        const key =
            latitude.toFixed(2) +
            "," +
            longitude.toFixed(2) +
            ":" +
            this.variable;


        if (
            this.cache.has(key)
        ) {

            return this.cache.get(
                key
            );

        }


        const apiVariable =
            this.getApiVariable();


        const url =

            "https://api.open-meteo.com/v1/forecast" +

            "?latitude=" +
            encodeURIComponent(
                latitude
            ) +

            "&longitude=" +
            encodeURIComponent(
                longitude
            ) +

            "&current=" +
            encodeURIComponent(
                apiVariable
            ) +

            "&timezone=UTC";


        const response =
            await fetch(
                url,
                {
                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Open-Meteo HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        const value =
            Number(
                data?.current?.[
                    apiVariable
                ]
            );


        if (
            !Number.isFinite(
                value
            )
        ) {

            return null;

        }


        this.cache.set(
            key,
            value
        );


        return value;

    }


    /*
    =================================================
     BUILD GLOBAL GRID
    =================================================
    */

    buildCoordinates() {

        const points = [];

        const half =
            Math.floor(
                this.gridSize / 2
            );


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
                    y *
                    this.step;

                const longitude =
                    x *
                    this.step;


                /*
                =====================================
                 AVOID EXTREME POLES
                =====================================
                */

                if (
                    latitude < -85 ||
                    latitude > 85
                ) {

                    continue;

                }


                points.push({

                    latitude,
                    longitude,

                    value:
                        null

                });

            }

        }


        return points;

    }


    /*
    =================================================
     LOAD GLOBAL DATA
    =================================================
    */

    async loadGlobal() {

        if (
            this.loading
        ) {

            return;

        }


        this.loading =
            true;


        try {

            const points =
                this.buildCoordinates();


            /*
            =========================================
             REQUEST DATA IN PARALLEL
            =========================================
            */

            const results =
                await Promise.all(

                    points.map(
                        async point => {

                            try {

                                point.value =
                                    await this.loadPoint(
                                        point.latitude,
                                        point.longitude
                                    );

                            }
                            catch(error) {

                                console.warn(
                                    "Global point failed:",
                                    point,
                                    error
                                );

                                point.value =
                                    null;

                            }


                            return point;

                        }
                    )

                );


            return results;

        }
        finally {

            this.loading =
                false;

        }

    }


    /*
    =================================================
     DRAW GLOBAL GRID
    =================================================
    */

    draw(
        points
    ) {

        if (
            !this.mapEngine?.map
        ) {

            throw new Error(
                "GlobalWeatherLayer: map not ready"
            );

        }


        if (
            this.layer
        ) {

            this.mapEngine.map
                .removeLayer(
                    this.layer
                );

        }


        this.layer =
            L.layerGroup();


        const half =
            this.step / 2;


        points.forEach(
            point => {

                if (
                    point.value === null
                ) {

                    return;

                }


                const bounds = [

                    [
                        point.latitude -
                        half,

                        point.longitude -
                        half
                    ],

                    [
                        point.latitude +
                        half,

                        point.longitude +
                        half
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
                                    point.value
                                ),

                            fillOpacity:
                                this.opacity,

                            interactive:
                                true

                        }
                    );


                rectangle.bindTooltip(

                    this.formatValue(
                        point.value
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
            this.mapEngine.map
        );


        this.visible =
            true;


        return this.layer;

    }


    /*
    =================================================
     FORMAT VALUE
    =================================================
    */

    formatValue(
        value
    ) {

        if (
            this.variable ===
            "temperature"
        ) {

            return (
                "🌡 " +
                value.toFixed(1) +
                " °C"
            );

        }


        if (
            this.variable ===
            "precipitation"
        ) {

            return (
                "🌧 " +
                value.toFixed(1) +
                " mm"
            );

        }


        if (
            this.variable ===
            "wind"
        ) {

            return (
                "💨 " +
                value.toFixed(1) +
                " km/h"
            );

        }


        if (
            this.variable ===
            "cloud"
        ) {

            return (
                "☁ " +
                value.toFixed(0) +
                " %"
            );

        }


        if (
            this.variable ===
            "pressure"
        ) {

            return (
                "🌀 " +
                value.toFixed(0) +
                " hPa"
            );

        }


        if (
            this.variable ===
            "uv"
        ) {

            return (
                "☀️ UV " +
                value.toFixed(1)
            );

        }


        return value.toString();

    }


    /*
    =================================================
     SHOW
    =================================================
    */

    async show() {

        if (
            this.visible
        ) {

            return true;

        }


        const points =
            await this.loadGlobal();


        this.draw(
            points
        );


        return true;

    }


    /*
    =================================================
     HIDE
    =================================================
    */

    hide() {

        if (
            this.layer &&
            this.mapEngine?.map
        ) {

            this.mapEngine.map
                .removeLayer(
                    this.layer
                );

        }


        this.layer =
            null;

        this.visible =
            false;

    }


    /*
    =================================================
     TOGGLE
    =================================================
    */

    async toggle() {

        if (
            this.visible
        ) {

            this.hide();

            return false;

        }


        return await this.show();

    }


    /*
    =================================================
     SET VARIABLE
    =================================================
    */

    setVariable(
        variable
    ) {

        this.hide();

        this.variable =
            variable;

        this.cache.clear();

    }


    /*
    =================================================
     SET OPACITY
    =================================================
    */

    setOpacity(
        opacity
    ) {

        this.opacity =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(opacity)
                )
            );


        if (
            this.layer
        ) {

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

    }


    /*
    =================================================
     REFRESH
    =================================================
    */

    async refresh() {

        this.hide();

        this.cache.clear();

        return await this.show();

    }


    /*
    =================================================
     DESTROY
    =================================================
    */

    destroy() {

        this.hide();

        this.cache.clear();

        this.mapEngine =
            null;

    }

}