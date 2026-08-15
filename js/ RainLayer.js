/*
====================================================
 SHOHIN WEATHER V5.4
 RainLayer.js
 REAL PRECIPITATION LAYER
====================================================
*/

export class RainLayer {

    constructor(mapEngine, weatherData) {

        this.mapEngine = mapEngine;

        this.weatherData = weatherData;

        this.layer = null;

        this.visible = false;

    }


    /*
    ================================================
    SHOW
    ================================================
    */

    show() {

        if (
            !this.mapEngine ||
            !this.mapEngine.map
        ) {

            throw new Error(
                "RainLayer: карта не готова"
            );

        }


        this.hide();


        this.layer =
            L.layerGroup();


        const hourly =
            this.weatherData?.hourly;


        if (
            !hourly
        ) {

            throw new Error(
                "RainLayer: hourly data отсутствует"
            );

        }


        const rain =
            hourly.precipitation;


        if (
            !Array.isArray(rain)
        ) {

            throw new Error(
                "RainLayer: precipitation отсутствует"
            );

        }


        const center =
            this.mapEngine.map
                .getCenter();


        const baseRain =
            Number(
                rain[0]
            );


        const safeRain =
            Number.isFinite(
                baseRain
            )
            ? baseRain
            : 0;


        /*
        ============================================
        CREATE SIMPLE RAIN FIELD
        ============================================
        */


        const size = 11;

        const step = 0.12;

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


                /*
                ------------------------------------
                SMALL NATURAL VARIATION
                ------------------------------------
                */


                const distance =
                    Math.sqrt(
                        x * x +
                        y * y
                    );


                const amount =
                    Math.max(

                        0,

                        safeRain *
                        (
                            1 -
                            distance /
                            (half * 1.5)
                        )

                    );


                /*
                ------------------------------------
                COLOR
                ------------------------------------
                */


                let color;


                if (
                    amount < 0.1
                ) {

                    color =
                        "#38bdf8";

                }
                else if (
                    amount < 1
                ) {

                    color =
                        "#22c55e";

                }
                else if (
                    amount < 3
                ) {

                    color =
                        "#facc15";

                }
                else if (
                    amount < 8
                ) {

                    color =
                        "#f97316";

                }
                else {

                    color =
                        "#ef4444";

                }


                /*
                ------------------------------------
                CELL
                ------------------------------------
                */


                const bounds = [

                    [

                        lat -
                        step / 2,

                        lon -
                        step / 2

                    ],

                    [

                        lat +
                        step / 2,

                        lon +
                        step / 2

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
                                color,

                            fillOpacity:
                                amount > 0
                                ? 0.40
                                : 0.12,

                            interactive:
                                false

                        }

                    );


                rectangle.addTo(
                    this.layer
                );

            }

        }


        /*
        ============================================
        ADD TO MAP
        ============================================
        */


        this.layer.addTo(
            this.mapEngine.map
        );


        this.visible =
            true;


        return this.layer;

    }


    /*
    ================================================
    HIDE
    ================================================
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
    ================================================
    TOGGLE
    ================================================
    */

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


    /*
    ================================================
    IS VISIBLE
    ================================================
    */

    isVisible() {

        return this.visible;

    }

}