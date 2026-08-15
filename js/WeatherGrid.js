/*
====================================================
 SHOHIN WEATHER V5
 WeatherGrid.js
 GRID DATA ENGINE
====================================================
*/

export class WeatherGrid {

    constructor(options = {}) {

        this.latitude =
            Number(
                options.latitude ?? 38.5598
            );

        this.longitude =
            Number(
                options.longitude ?? 68.7870
            );

        this.size =
            Number(
                options.size ?? 9
            );

        this.step =
            Number(
                options.step ?? 0.25
            );

        this.grid =
            [];

    }


    /*
    ================================================
    BUILD GRID
    ================================================
    */

    build() {

        this.grid = [];


        const half =
            Math.floor(
                this.size / 2
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
                    this.latitude +
                    y * this.step;


                const longitude =
                    this.longitude +
                    x * this.step;


                this.grid.push({

                    latitude:
                        latitude,

                    longitude:
                        longitude,

                    value:
                        null

                });

            }

        }


        return this.grid;

    }


    /*
    ================================================
    APPLY VALUES
    ================================================
    */

    applyValues(
        values
    ) {

        if (
            !Array.isArray(values)
        ) {

            return this.grid;

        }


        const length =
            Math.min(
                this.grid.length,
                values.length
            );


        for (
            let i = 0;
            i < length;
            i++
        ) {

            this.grid[i].value =
                Number(
                    values[i]
                );

        }


        return this.grid;

    }


    /*
    ================================================
    GET GRID
    ================================================
    */

    getGrid() {

        return this.grid;

    }


    /*
    ================================================
    GET SIZE
    ================================================
    */

    getSize() {

        return this.size;

    }


    /*
    ================================================
    GET STEP
    ================================================
    */

    getStep() {

        return this.step;

    }


    /*
    ================================================
    CLEAR
    ================================================
    */

    clear() {

        this.grid = [];

    }

}