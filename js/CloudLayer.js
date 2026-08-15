/*
====================================================
 SHOHIN WEATHER V5.6
 CloudLayer.js
 CLOUD COVER LAYER
====================================================
*/

export class CloudLayer {

    constructor(mapEngine, weatherData) {

        this.mapEngine = mapEngine;

        this.weatherData = weatherData;

        this.layer = null;

        this.visible = false;

    }


    show() {

        if (!this.mapEngine?.map) {

            throw new Error(
                "CloudLayer: map is not ready"
            );

        }


        this.hide();


        const map =
            this.mapEngine.map;


        const hourly =
            this.weatherData?.hourly;


        if (!hourly) {

            throw new Error(
                "CloudLayer: hourly data not found"
            );

        }


        const clouds =
            hourly.cloud_cover;


        if (
            !clouds ||
            typeof clouds.length !== "number"
        ) {

            throw new Error(
                "CloudLayer: cloud_cover data not found"
            );

        }


        const cloudValue =
            Number(
                clouds[0]
            );


        const safeCloud =
            Number.isFinite(
                cloudValue
            )
            ? cloudValue
            : 0;


        const center =
            map.getCenter();


        this.layer =
            L.layerGroup();


        const size = 9;

        const step = 0.18;

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


                const variation =
                    Math.sin(
                        x * 1.7 +
                        y * 0.9
                    ) * 12;


                const amount =
                    Math.max(

                        0,

                        Math.min(

                            100,

                            safeCloud
                            +
                            variation
                            -
                            distance * 1.5

                        )

                    );


                const opacity =
                    0.08 +
                    (
                        amount /
                        100
                    ) * 0.38;


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
                            "#cbd5e1",

                        fillOpacity:
                            opacity,

                        interactive: false

                    }

                ).addTo(
                    this.layer
                );

            }

        }


        this.layer.addTo(
            map
        );


        this.visible =
            true;


        return true;

    }


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