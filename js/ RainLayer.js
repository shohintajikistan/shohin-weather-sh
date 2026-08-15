/*
====================================================
 SHOHIN WEATHER V5
 RainLayer.js
 REAL PRECIPITATION LAYER
====================================================
*/

export class RainLayer {

    constructor(
        mapEngine,
        weatherData
    ) {

        if (!mapEngine) {

            throw new Error(
                "RainLayer: MapEngine не найден"
            );

        }


        this.mapEngine =
            mapEngine;


        this.map =
            mapEngine.map;


        this.data =
            weatherData;


        this.layer =
            null;


        this.visible =
            false;

    }


    /*
    ================================================
    SHOW
    ================================================
    */

    show() {

        if (!this.map) {

            throw new Error(
                "RainLayer: карта не инициализирована"
            );

        }


        this.hide();


        const hourly =
            this.data?.hourly;


        if (!hourly) {

            throw new Error(
                "RainLayer: hourly данные отсутствуют"
            );

        }


        const precipitation =
            hourly.precipitation;


        if (
            !precipitation ||
            precipitation.length === 0
        ) {

            throw new Error(
                "RainLayer: данные осадков отсутствуют"
            );

        }


        /*
        ============================================
        CURRENT PRECIPITATION
        ============================================
        */


        const value =
            Number(
                precipitation[0]
            ) || 0;


        /*
        ============================================
        CENTER
        ============================================
        */


        const center =
            this.map.getCenter();


        /*
        ============================================
        RAIN COLOR
        ============================================
        */


        const color =
            this.getRainColor(
                value
            );


        /*
        ============================================
        MAIN RAIN FIELD
        ============================================
        */


        const radius =
            180000;


        const main =
            L.circle(

                [
                    center.lat,
                    center.lng
                ],

                {

                    radius:
                        radius,

                    stroke:
                        false,

                    fillColor:
                        color,

                    fillOpacity:
                        this.getOpacity(
                            value
                        )

                }

            );


        main.addTo(
            this.map
        );


        /*
        ============================================
        INNER FIELD
        ============================================
        */


        const inner =
            L.circle(

                [
                    center.lat,
                    center.lng
                ],

                {

                    radius:
                        90000,

                    stroke:
                        false,

                    fillColor:
                        color,

                    fillOpacity:
                        this.getOpacity(
                            value
                        ) + 0.05

                }

            );


        inner.addTo(
            this.map
        );


        /*
        ============================================
        STORE
        ============================================
        */


        this.layer = {

            main:
                main,

            inner:
                inner,

            value:
                value,

            color:
                color

        };


        this.visible =
            true;


        return {

            precipitation:
                value,

            color:
                color

        };

    }


    /*
    ================================================
    HIDE
    ================================================
    */

    hide() {

        if (!this.layer)
            return;


        if (
            this.layer.main
        ) {

            this.map.removeLayer(
                this.layer.main
            );

        }


        if (
            this.layer.inner
        ) {

            this.map.removeLayer(
                this.layer.inner
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

            return false;

        }


        this.show();

        return true;

    }


    /*
    ================================================
    RAIN COLOR
    ================================================
    */

    getRainColor(
        value
    ) {

        if (
            value <= 0
        ) {

            return "#64748b";

        }


        if (
            value < 0.1
        ) {

            return "#38bdf8";

        }


        if (
            value < 1
        ) {

            return "#22c55e";

        }


        if (
            value < 2.5
        ) {

            return "#eab308";

        }


        if (
            value < 5
        ) {

            return "#f97316";

        }


        if (
            value < 10
        ) {

            return "#ef4444";

        }


        return "#a855f7";

    }


    /*
    ================================================
    OPACITY
    ================================================
    */

    getOpacity(
        value
    ) {

        if (
            value <= 0
        ) {

            return 0.04;

        }


        if (
            value < 0.1
        ) {

            return 0.12;

        }


        if (
            value < 1
        ) {

            return 0.20;

        }


        if (
            value < 5
        ) {

            return 0.30;

        }


        return 0.40;

    }


    /*
    ================================================
    GET VALUE
    ================================================
    */

    getCurrentValue() {

        if (
            !this.data?.hourly
        ) {

            return null;

        }


        const values =
            this.data
                .hourly
                .precipitation;


        if (
            !values
        ) {

            return null;

        }


        return (
            Number(
                values[0]
            ) || 0
        );

    }


    /*
    ================================================
    CLEAR
    ================================================
    */

    clear() {

        this.hide();

    }

}