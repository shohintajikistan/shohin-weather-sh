/*
====================================================
 SHOHIN WEATHER V5
 WeatherRenderer.js
 WEATHER FIELD RENDERER
====================================================
*/

export class WeatherRenderer {

    constructor(
        mapEngine,
        options = {}
    ) {

        if (!mapEngine) {

            throw new Error(
                "WeatherRenderer: MapEngine не найден"
            );

        }


        this.mapEngine =
            mapEngine;


        this.map =
            mapEngine.map;


        this.canvas =
            null;


        this.ctx =
            null;


        this.grid =
            [];


        this.visible =
            false;


        this.animation =
            null;


        this.opacity =
            options.opacity ?? 0.55;


        this.radius =
            options.radius ?? 22;


        this.container =
            this.map.getContainer();


        this.createCanvas();


        this.bindMapEvents();

    }


    /*
    ================================================
    CREATE CANVAS
    ================================================
    */

    createCanvas() {

        this.canvas =
            document.createElement(
                "canvas"
            );


        this.canvas.style.position =
            "absolute";


        this.canvas.style.left =
            "0";


        this.canvas.style.top =
            "0";


        this.canvas.style.width =
            "100%";


        this.canvas.style.height =
            "100%";


        this.canvas.style.pointerEvents =
            "none";


        this.canvas.style.zIndex =
            "350";


        this.container
            .appendChild(
                this.canvas
            );


        this.ctx =
            this.canvas.getContext(
                "2d"
            );


        this.resize();

    }


    /*
    ================================================
    RESIZE
    ================================================
    */

    resize() {

        if (
            !this.canvas
        ) {

            return;

        }


        const rect =
            this.container
                .getBoundingClientRect();


        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        this.canvas.width =
            Math.round(
                rect.width * dpr
            );


        this.canvas.height =
            Math.round(
                rect.height * dpr
            );


        this.canvas.style.width =
            rect.width + "px";


        this.canvas.style.height =
            rect.height + "px";


        this.ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        this.width =
            rect.width;


        this.height =
            rect.height;


        if (
            this.visible
        ) {

            this.render();

        }

    }


    /*
    ================================================
    MAP EVENTS
    ================================================
    */

    bindMapEvents() {

        this._resizeHandler =
            () => this.resize();


        window.addEventListener(
            "resize",
            this._resizeHandler
        );


        this._moveHandler =
            () => {

                if (
                    this.visible
                ) {

                    this.render();

                }

            };


        this.map.on(
            "move",
            this._moveHandler
        );


        this.map.on(
            "zoom",
            this._moveHandler
        );


    }


    /*
    ================================================
    SET GRID
    ================================================
    */

    setGrid(
        grid
    ) {

        if (
            !Array.isArray(grid)
        ) {

            throw new Error(
                "WeatherRenderer: invalid grid"
            );

        }


        this.grid =
            grid;


        this.visible =
            true;


        this.render();

    }


    /*
    ================================================
    RENDER
    ================================================
    */

    render() {

        if (
            !this.ctx ||
            !this.map ||
            !this.grid.length
        ) {

            return;

        }


        this.ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );


        for (
            const point
            of this.grid
        ) {

            if (
                point.value === null ||
                point.value === undefined ||
                !Number.isFinite(
                    Number(
                        point.value
                    )
                )
            ) {

                continue;

            }


            const screen =
                this.map.latLngToContainerPoint([

                    Number(
                        point.latitude
                    ),

                    Number(
                        point.longitude
                    )

                ]);


            const value =
                Number(
                    point.value
                );


            this.drawPoint(

                screen.x,

                screen.y,

                value

            );

        }

    }


    /*
    ================================================
    DRAW WEATHER POINT
    ================================================
    */

    drawPoint(
        x,
        y,
        value
    ) {

        const color =
            this.getColor(
                value
            );


        const radius =
            this.radius;


        const gradient =
            this.ctx.createRadialGradient(

                x,
                y,
                0,

                x,
                y,
                radius

            );


        gradient.addColorStop(
            0,
            this.rgba(
                color,
                this.opacity
            )
        );


        gradient.addColorStop(
            0.55,
            this.rgba(
                color,
                this.opacity * 0.55
            )
        );


        gradient.addColorStop(
            1,
            this.rgba(
                color,
                0
            )
        );


        this.ctx.beginPath();


        this.ctx.fillStyle =
            gradient;


        this.ctx.arc(

            x,
            y,

            radius,

            0,
            Math.PI * 2

        );


        this.ctx.fill();

    }


    /*
    ================================================
    TEMPERATURE COLOR
    ================================================
    */

    getColor(
        value
    ) {

        if (
            value <= -20
        ) {

            return "#355cff";

        }


        if (
            value <= -10
        ) {

            return "#2fa7ff";

        }


        if (
            value <= 0
        ) {

            return "#62d9ff";

        }


        if (
            value <= 10
        ) {

            return "#52e6a3";

        }


        if (
            value <= 20
        ) {

            return "#f4e45b";

        }


        if (
            value <= 30
        ) {

            return "#ff9b42";

        }


        if (
            value <= 40
        ) {

            return "#ff514d";

        }


        return "#d62939";

    }


    /*
    ================================================
    RGBA
    ================================================
    */

    rgba(
        hex,
        alpha
    ) {

        const value =
            hex.replace(
                "#",
                ""
            );


        const r =
            parseInt(
                value.substring(
                    0,
                    2
                ),
                16
            );


        const g =
            parseInt(
                value.substring(
                    2,
                    4
                ),
                16
            );


        const b =
            parseInt(
                value.substring(
                    4,
                    6
                ),
                16
            );


        return (
            "rgba(" +
            r +
            "," +
            g +
            "," +
            b +
            "," +
            alpha +
            ")"
        );

    }


    /*
    ================================================
    SHOW
    ================================================
    */

    show() {

        this.visible =
            true;


        if (
            this.canvas
        ) {

            this.canvas.style.display =
                "block";

        }


        this.render();

    }


    /*
    ================================================
    HIDE
    ================================================
    */

    hide() {

        this.visible =
            false;


        if (
            this.canvas
        ) {

            this.canvas.style.display =
                "none";

        }

    }


    /*
    ================================================
    CLEAR
    ================================================
    */

    clear() {

        this.grid =
            [];


        if (
            this.ctx
        ) {

            this.ctx.clearRect(

                0,
                0,
                this.width,
                this.height

            );

        }

    }


    /*
    ================================================
    SET OPACITY
    ================================================
    */

    setOpacity(
        value
    ) {

        this.opacity =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(value)
                )
            );


        this.render();

    }


    /*
    ================================================
    DESTROY
    ================================================
    */

    destroy() {

        this.stopAnimation();


        if (
            this._resizeHandler
        ) {

            window.removeEventListener(
                "resize",
                this._resizeHandler
            );

        }


        if (
            this.map &&
            this._moveHandler
        ) {

            this.map.off(
                "move",
                this._moveHandler
            );


            this.map.off(
                "zoom",
                this._moveHandler
            );

        }


        if (
            this.canvas
        ) {

            this.canvas.remove();

        }


        this.canvas =
            null;


        this.ctx =
            null;


        this.grid =
            [];

    }


    /*
    ================================================
    ANIMATION
    ================================================
    */

    startAnimation(
        callback
    ) {

        this.stopAnimation();


        const loop =
            (time) => {

                if (
                    typeof callback ===
                    "function"
                ) {

                    callback(
                        time
                    );

                }


                if (
                    this.visible
                ) {

                    this.render();

                }


                this.animation =
                    requestAnimationFrame(
                        loop
                    );

            };


        this.animation =
            requestAnimationFrame(
                loop
            );

    }


    /*
    ================================================
    STOP ANIMATION
    ================================================
    */

    stopAnimation() {

        if (
            this.animation
        ) {

            cancelAnimationFrame(
                this.animation
            );

        }


        this.animation =
            null;

    }

}