/*
====================================================
 SHOHIN WEATHER V5.5
 WindLayer.js
 WIND VECTOR LAYER
====================================================
*/

export class WindLayer {

    constructor(mapEngine, weatherData) {

        this.mapEngine = mapEngine;

        this.weatherData = weatherData;

        this.layer = null;

        this.visible = false;

    }


    show() {

        if (
            !this.mapEngine?.map
        ) {

            throw new Error(
                "WindLayer: map is not ready"
            );

        }


        this.hide();


        const map =
            this.mapEngine.map;


        const hourly =
            this.weatherData?.hourly;


        if (!hourly) {

            throw new Error(
                "WindLayer: hourly data not found"
            );

        }


        const speeds =
            hourly.wind_speed_10m;


        const directions =
            hourly.wind_direction_10m;


        if (
            !speeds ||
            !directions
        ) {

            throw new Error(
                "WindLayer: wind data not found"
            );

        }


        const speed =
            Number(
                speeds[0]
            );


        const direction =
            Number(
                directions[0]
            );


        const safeSpeed =
            Number.isFinite(speed)
                ? speed
                : 0;


        const safeDirection =
            Number.isFinite(direction)
                ? direction
                : 0;


        const center =
            map.getCenter();


        this.layer =
            L.layerGroup();


        const size = 7;

        const step = 0.20;

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


                const arrow =
                    this.createArrow(

                        lat,

                        lon,

                        safeSpeed,

                        safeDirection

                    );


                arrow.addTo(
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


    createArrow(
        lat,
        lon,
        speed,
        direction
    ) {


        const size =
            Math.max(
                18,
                Math.min(
                    45,
                    18 + speed
                )
            );


        const color =
            this.windColor(
                speed
            );


        const icon =
            L.divIcon({

                className:
                    "shohin-wind-arrow",

                html:

                    `<div style="
                        width:${size}px;
                        height:${size}px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:${color};
                        font-size:${size}px;
                        font-weight:bold;
                        transform:rotate(${direction}deg);
                        text-shadow:
                            0 1px 3px
                            rgba(0,0,0,.8);
                    ">➤</div>`,

                iconSize:
                    [
                        size,
                        size
                    ],

                iconAnchor:
                    [
                        size / 2,
                        size / 2
                    ]

            });


        return L.marker(

            [
                lat,
                lon
            ],

            {

                icon:
                    icon,

                interactive:
                    false

            }

        );

    }


    windColor(
        speed
    ) {


        if (
            speed < 5
        ) {

            return "#38bdf8";

        }


        if (
            speed < 15
        ) {

            return "#4ade80";

        }


        if (
            speed < 25
        ) {

            return "#facc15";

        }


        if (
            speed < 40
        ) {

            return "#fb923c";

        }


        return "#ef4444";

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