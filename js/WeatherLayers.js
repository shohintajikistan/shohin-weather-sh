/*
====================================================
 SHOHIN WEATHER V5
 WeatherLayers.js
====================================================
*/

export class WeatherLayers {

    constructor(
        mapEngine,
        weatherData
    ) {

        this.mapEngine =
            mapEngine;

        this.map =
            mapEngine.map;

        this.data =
            weatherData;

        this.layers =
            new Map();

        this.activeLayer =
            null;

    }


    /*
    ================================================
    TEMPERATURE
    ================================================
    */

    temperature() {

        this.removeActive();


        if (
            !this.map
        ) {

            throw new Error(
                "Map is not initialized"
            );

        }


        const hourly =
            this.data?.hourly;


        if (
            !hourly
        ) {

            throw new Error(
                "Hourly weather data not found"
            );

        }


        const temperature =
            hourly.temperature_2m;


        if (
            !temperature ||
            temperature.length === 0
        ) {

            throw new Error(
                "Temperature data not found"
            );

        }


        /*
         * Берём первый прогнозный час.
         */

        const value =
            Number(
                temperature[0]
            );


        /*
         * Создаём цветовую область
         * вокруг текущей позиции.
         */

        const center =
            this.map.getCenter();


        const radius =
            150000;


        const color =
            this.temperatureColor(
                value
            );


        const circle =
            L.circle(
                [
                    center.lat,
                    center.lng
                ],
                {

                    radius:

                        radius,

                    color:

                        color,

                    fillColor:

                        color,

                    fillOpacity:

                        0.35,

                    weight:

                        1

                }

            );


        circle.addTo(
            this.map
        );


        /*
         * Несколько концентрических
         * зон дают более мягкий
         * метеоэффект.
         */

        const circles = [];


        const radii = [

            150000,
            100000,
            50000

        ];


        const opacity = [

            0.10,
            0.14,
            0.18

        ];


        for (
            let i = 0;
            i < radii.length;
            i++
        ) {

            const layer =
                L.circle(

                    [
                        center.lat,
                        center.lng
                    ],

                    {

                        radius:
                            radii[i],

                        stroke:
                            false,

                        fillColor:
                            color,

                        fillOpacity:
                            opacity[i]

                    }

                );


            layer.addTo(
                this.map
            );


            circles.push(
                layer
            );

        }


        this.layers.set(
            "temperature",
            {

                main:
                    circle,

                circles:
                    circles

            }
        );


        this.activeLayer =
            "temperature";


        return {

            value:
                value,

            color:
                color

        };

    }


    /*
    ================================================
    TEMPERATURE COLOR
    ================================================
    */

    temperatureColor(
        value
    ) {


        if (
            value <= -20
        )
            return "#4c6fff";


        if (
            value <= -10
        )
            return "#36a9ff";


        if (
            value <= 0
        )
            return "#6ed6ff";


        if (
            value <= 10
        )
            return "#65e6a5";


        if (
            value <= 20
        )
            return "#ffe66d";


        if (
            value <= 30
        )
            return "#ff9f43";


        if (
            value <= 40
        )
            return "#ff5e57";


        return "#d63031";

    }


    /*
    ================================================
    REMOVE ACTIVE
    ================================================
    */

    removeActive() {

        if (
            !this.activeLayer
        )
            return;


        const layer =
            this.layers.get(
                this.activeLayer
            );


        if (!layer)
            return;


        /*
         * Главный слой
         */

        if (
            layer.main
        ) {

            this.map.removeLayer(
                layer.main
            );

        }


        /*
         * Дополнительные круги
         */

        if (
            layer.circles
        ) {

            for (
                const item
                of layer.circles
            ) {

                this.map.removeLayer(
                    item
                );

            }

        }


        this.activeLayer =
            null;

    }


    /*
    ================================================
    CLEAR
    ================================================
    */

    clear() {

        for (
            const layer
            of this.layers.values()
        ) {


            if (
                layer.main
            ) {

                this.map.removeLayer(
                    layer.main
                );

            }


            if (
                layer.circles
            ) {

                for (
                    const item
                    of layer.circles
                ) {

                    this.map.removeLayer(
                        item
                    );

                }

            }

        }


        this.layers.clear();

        this.activeLayer =
            null;

    }


    /*
    ================================================
    GET ACTIVE LAYER
    ================================================
    */

    getActive() {

        return this.activeLayer;

    }

}