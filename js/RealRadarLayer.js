/*
====================================================
 SHOHIN WEATHER V6.0
 RealRadarLayer.js
 REAL WEATHER RADAR
 SOURCE: RainViewer
====================================================
*/

export class RealRadarLayer {

    constructor(mapEngine, options = {}) {

        this.mapEngine = mapEngine;

        this.opacity =
            Number(
                options.opacity ?? 0.70
            );

        this.maxZoom =
            Number(
                options.maxZoom ?? 7
            );

        this.layer = null;

        this.frames = [];

        this.currentFrame = -1;

        this.host = null;

        this.timer = null;

        this.visible = false;

        this.loading = false;

    }


    /*
    ================================================
    LOAD RADAR METADATA
    ================================================
    */

    async load() {

        const response =
            await fetch(
                "https://api.rainviewer.com/public/weather-maps.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "RainViewer HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            !data.host ||
            !data.radar
        ) {

            throw new Error(
                "RainViewer: invalid radar response"
            );

        }


        this.host =
            data.host;


        const past =
            Array.isArray(
                data.radar.past
            )
            ?
            data.radar.past
            :
            [];


        const nowcast =
            Array.isArray(
                data.radar.nowcast
            )
            ?
            data.radar.nowcast
            :
            [];


        this.frames =
            [
                ...past,
                ...nowcast
            ];


        if (
            this.frames.length === 0
        ) {

            throw new Error(
                "RainViewer: no radar frames"
            );

        }


        return data;

    }


    /*
    ================================================
    CREATE TILE LAYER
    ================================================
    */

    createFrame(
        frame
    ) {

        if (
            !this.mapEngine?.map
        ) {

            throw new Error(
                "RealRadarLayer: map is not ready"
            );

        }


        if (
            !this.host ||
            !frame?.path
        ) {

            throw new Error(
                "RealRadarLayer: invalid radar frame"
            );

        }


        const map =
            this.mapEngine.map;


        const zoom =
            Math.min(
                map.getZoom(),
                this.maxZoom
            );


        const tileURL =

            this.host +

            frame.path +

            "/256/{z}/{x}/{y}/2/1_1.png";


        const layer =
            L.tileLayer(
                tileURL,
                {

                    opacity:
                        this.opacity,

                    minZoom:
                        0,

                    maxZoom:
                        this.maxZoom,

                    tileSize:
                        256,

                    attribution:
                        'Weather radar by <a href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer</a>'

                }
            );


        return layer;

    }


    /*
    ================================================
    SHOW LATEST RADAR
    ================================================
    */

    async show() {

        if (
            this.loading
        ) {

            return false;

        }


        if (
            !this.mapEngine?.map
        ) {

            throw new Error(
                "RealRadarLayer: map is not ready"
            );

        }


        this.loading = true;


        try {

            this.hide();


            await this.load();


            this.currentFrame =
                this.frames.length - 1;


            const frame =
                this.frames[
                    this.currentFrame
                ];


            this.layer =
                this.createFrame(
                    frame
                );


            this.layer.addTo(
                this.mapEngine.map
            );


            this.visible = true;


            return true;

        }

        finally {

            this.loading = false;

        }

    }


    /*
    ================================================
    SHOW FRAME
    ================================================
    */

    showFrame(
        index
    ) {

        if (
            !this.mapEngine?.map
        ) {

            return false;

        }


        if (
            !this.frames.length
        ) {

            return false;

        }


        let safeIndex =
            Number(index);


        if (
            !Number.isFinite(
                safeIndex
            )
        ) {

            safeIndex =
                this.frames.length - 1;

        }


        safeIndex =
            Math.max(
                0,
                Math.min(
                    this.frames.length - 1,
                    Math.floor(
                        safeIndex
                    )
                )
            );


        if (
            this.layer
        ) {

            this.mapEngine.map
                .removeLayer(
                    this.layer
                );

        }


        this.layer =
            this.createFrame(
                this.frames[
                    safeIndex
                ]
            );


        this.layer.addTo(
            this.mapEngine.map
        );


        this.currentFrame =
            safeIndex;


        this.visible =
            true;


        return true;

    }


    /*
    ================================================
    LATEST FRAME
    ================================================
    */

    latest() {

        if (
            !this.frames.length
        ) {

            return false;

        }


        return this.showFrame(
            this.frames.length - 1
        );

    }


    /*
    ================================================
    PREVIOUS FRAME
    ================================================
    */

    previous() {

        if (
            this.currentFrame <= 0
        ) {

            return false;

        }


        return this.showFrame(
            this.currentFrame - 1
        );

    }


    /*
    ================================================
    NEXT FRAME
    ================================================
    */

    next() {

        if (
            this.currentFrame >=
            this.frames.length - 1
        ) {

            return false;

        }


        return this.showFrame(
            this.currentFrame + 1
        );

    }


    /*
    ================================================
    ANIMATE RADAR
    ================================================
    */

    startAnimation(
        interval = 700
    ) {

        this.stopAnimation();


        if (
            !this.frames.length
        ) {

            return false;

        }


        this.currentFrame = 0;


        this.timer =
            setInterval(
                () => {

                    this.currentFrame++;


                    if (
                        this.currentFrame >=
                        this.frames.length
                    ) {

                        this.currentFrame = 0;

                    }


                    this.showFrame(
                        this.currentFrame
                    );

                },

                Math.max(
                    250,
                    Number(interval) || 700
                )

            );


        return true;

    }


    /*
    ================================================
    STOP ANIMATION
    ================================================
    */

    stopAnimation() {

        if (
            this.timer
        ) {

            clearInterval(
                this.timer
            );

        }


        this.timer = null;

    }


    /*
    ================================================
    HIDE
    ================================================
    */

    hide() {

        this.stopAnimation();


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

        this.currentFrame = -1;

    }


    /*
    ================================================
    TOGGLE
    ================================================
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
    ================================================
    GET FRAMES
    ================================================
    */

    getFrames() {

        return this.frames;

    }


    /*
    ================================================
    GET CURRENT FRAME
    ================================================
    */

    getCurrentFrame() {

        if (
            this.currentFrame < 0
        ) {

            return null;

        }


        return this.frames[
            this.currentFrame
        ] || null;

    }


    /*
    ================================================
    GET FRAME TIME
    ================================================
    */

    getCurrentTime() {

        const frame =
            this.getCurrentFrame();


        if (
            !frame?.time
        ) {

            return null;

        }


        return new Date(
            frame.time * 1000
        );

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


        if (
            this.layer
        ) {

            this.layer.setOpacity(
                this.opacity
            );

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