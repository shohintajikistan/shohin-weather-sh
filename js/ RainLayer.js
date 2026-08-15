/*
====================================================
 SHOHIN WEATHER V5.4
 RainLayer.js
 SAFE RAIN MODULE
====================================================
*/

export class RainLayer {

    constructor(mapEngine, weatherData) {

        this.mapEngine = mapEngine;

        this.weatherData = weatherData;

        this.layer = null;

        this.visible = false;

    }


    show() {

        if (
            !this.mapEngine ||
            !this.mapEngine.map
        ) {

            throw new Error(
                "RainLayer: map is not ready"
            );

        }


        this.hide();


        const map =
            this.mapEngine.map;


        const hourly =
            this.weatherData &&
            this.weatherData.hourly;


        if (!hourly) {

            throw new Error(
                "RainLayer: hourly data not found"
            );

        }


        const precipitation =
            hourly.precipitation;


        if (
            !precipitation ||
            typeof precipitation.length !==
            "number"
        ) {

            throw new Error(
                "RainLayer: precipitation data not found"
            );

        }


        const rain =
            Number(
                precipitation[0]
            );


        const safeRain =
            Number.isFinite(rain)
                ? rain
                : 0;


        const center =
            map.getCenter();


        this.layer =
            L.layerGroup();


        const size = 9;

        const step = 0.15;

        const half =
            Math.floor(
                size / 2
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


                const lat =
                    center.lat +
                    y * step;


                const lon =
                    center.lng +
                    x * step;


                const distance =
                    Math.sqrt(
                        x * x +
                        y * y
                    );


                const factor =
                    Math.max(
                        0,
                        1 -
                        distance /
                        (half * 1.5)
                    );


                const amount =
                    safeRain * factor;


                let color =
                    "#38bdf8";


                if (
                    amount >= 8
                ) {

                    color =
                        "#ef4444";

                }
                else if (
                    amount >= 3
                ) {

                    color =
                        "#f97316";

                }
                else if (
                    amount >= 1
                ) {

                    color =
                        "#facc15";

                }
                else if (
                    amount >= 0.1
                ) {

                    color =
                        "#22c55e";

                }


                const bounds = [

                    [
                        lat - step / 2,
                        lon - step / 2
                    ],

                    [
                        lat + step / 2,
                        lon + step / 2
                    ]

                ];


                L.rectangle(

                    bounds,

                    {

                        stroke: false,

                        fill: true,

                        fillColor:
                            color,

                        fillOpacity:
                            amount > 0
                                ? 0.42
                                : 0.08,

                        interactive: false

                    }

                ).addTo(
                    this.layer
                );

            }

        }


        this.layer.addTo(map);


        this.visible =
            true;


        return true;

    }


    hide() {

        if (
            this.layer &&
            this.mapEngine &&
            this.mapEngine.map
        ) {

            this.mapEngine.map
                .removeLayer(
                    this.layer
                );

        }


        this.layer = null;

        this.visible = false;

    }


    toggle() {

        if (
            this.visible
        ) {

            this.hide();

        }
        else {

            this.show();

        }

    }


    isVisible() {

        return this.visible;

    }

}