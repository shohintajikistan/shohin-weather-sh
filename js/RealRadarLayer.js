/*
====================================================
 SHOHIN WEATHER
 RealRadarLayer.js
 V6.1
 REAL RADAR TILE ENGINE
 SOURCE: RainViewer
====================================================
*/

export class RealRadarLayer {

    constructor(mapEngine, options = {}) {

        this.mapEngine = mapEngine;

        this.opacity =
            Number(options.opacity ?? 0.70);

        this.minZoom =
            Number(options.minZoom ?? 0);

        this.maxZoom =
            Number(options.maxZoom ?? 18);

        this.tileSize = 256;

        this.layer = null;

        this.host = "";

        this.frames = [];

        this.currentFrame = -1;

        this.visible = false;

        this.loading = false;

        this.animationTimer = null;

        this.animationRunning = false;

        this.animationInterval = 700;

    }


    /*
    =================================================
     RAINVIEWER API
    =================================================
    */

    async load() {

        const response =
            await fetch(
                "https://api.rainviewer.com/public/weather-maps.json",
                {
                    method: "GET",
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

        if (!data) {

            throw new Error(
                "RainViewer: empty response"
            );

        }

        if (!data.host) {

            throw new Error(
                "RainViewer: host missing"
            );

        }

        if (!data.radar) {

            throw new Error(
                "RainViewer: radar data missing"
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

        this.frames = [
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
    =================================================
     TILE URL
    =================================================
    */

    getTileURL(frame) {

        if (
            !this.host ||
            !frame ||
            !frame.path
        ) {

            throw new Error(
                "RainViewer: invalid frame"
            );

        }

        return (

            this.host +

            frame.path +

            "/256/{z}/{x}/{y}/2/1_1.png"

        );

    }


    /*
    =================================================
     CREATE REAL TILE LAYER
    =================================================
    */

    createFrame(frame) {

        if (
            !this.mapEngine ||
            !this.mapEngine.map
        ) {

            throw new Error(
                "RealRadarLayer: map is not ready"
            );

        }

        const tileURL =
            this.getTileURL(frame);


        const layer =
            L.tileLayer(
                tileURL,
                {

                    tileSize:
                        this.tileSize,

                    minZoom:
                        this.minZoom,

                    maxZoom:
                        this.maxZoom,

                    opacity:
                        this.opacity,

                    updateWhenIdle:
                        false,

                    updateWhenZooming:
                        true,

                    keepBuffer:
                        4,

                    updateInterval:
                        100,

                    detectRetina:
                        false,

                    crossOrigin:
                        true,

                    attribution:
                        'Weather radar by <a href="https://www.rainviewer.com/" target="_blank" rel="noopener noreferrer">RainViewer</a>'

                }
            );


        /*
        =============================================
         FORCE FULL MAP REFRESH
        =============================================
        */

        layer.on(
            "load",
            () => {

                if (
                    this.mapEngine?.map
                ) {

                    this.mapEngine.map
                        .invalidateSize();

                }

            }
        );


        return layer;

    }


    /*
    =================================================
     REMOVE CURRENT LAYER
    =================================================
    */

    removeCurrentLayer() {

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

    }


    /*
    =================================================
     SHOW
    =================================================
    */

    async show() {

        if (this.loading) {

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

            /*
            =========================================
             LOAD RADAR METADATA
            =========================================
            */

            await this.load();


            /*
            =========================================
             LATEST FRAME
            =========================================
            */

            this.currentFrame =
                this.frames.length - 1;


            const frame =
                this.frames[
                    this.currentFrame
                ];


            /*
            =========================================
             REMOVE OLD
            =========================================
            */

            this.removeCurrentLayer();


            /*
            =========================================
             CREATE REAL TILE LAYER
            =========================================
            */

            this.layer =
                this.createFrame(
                    frame
                );


            /*
            =========================================
             ADD TO ENTIRE MAP
            =========================================
            */

            this.layer.addTo(
                this.mapEngine.map
            );


            /*
            =========================================
             FORCE TILE CALCULATION
            =========================================
            */

            setTimeout(
                () => {

                    if (
                        this.mapEngine?.map
                    ) {

                        this.mapEngine.map
                            .invalidateSize();

                    }

                },
                100
            );


            this.visible =
                true;


            return true;

        }
        finally {

            this.loading =
                false;

        }

    }


    /*
    =================================================
     SHOW SPECIFIC FRAME
    =================================================
    */

    showFrame(index) {

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


        let frameIndex =
            Number(index);


        if (
            !Number.isFinite(
                frameIndex
            )
        ) {

            frameIndex =
                this.frames.length - 1;

        }


        frameIndex =
            Math.max(
                0,
                Math.min(
                    this.frames.length - 1,
                    Math.floor(
                        frameIndex
                    )
                )
            );


        const frame =
            this.frames[
                frameIndex
            ];


        this.removeCurrentLayer();


        this.layer =
            this.createFrame(
                frame
            );


        this.layer.addTo(
            this.mapEngine.map
        );


        this.currentFrame =
            frameIndex;


        this.visible =
            true;


        return true;

    }


    /*
    =================================================
     LATEST
    =================================================
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
    =================================================
     PREVIOUS
    =================================================
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
    =================================================
     NEXT
    =================================================
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
    =================================================
     START ANIMATION
    =================================================
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


        this.animationInterval =
            Math.max(
                300,
                Number(interval) || 700
            );


        this.animationRunning =
            true;


        let index =
            this.currentFrame >= 0
            ?
            this.currentFrame
            :
            0;


        this.currentFrame =
            index;


        this.animationTimer =
            setInterval(
                () => {

                    if (
                        !this.frames.length
                    ) {

                        return;

                    }


                    index++;


                    if (
                        index >=
                        this.frames.length
                    ) {

                        index = 0;

                    }


                    this.showFrame(
                        index
                    );

                },
                this.animationInterval
            );


        return true;

    }


    /*
    =================================================
     STOP ANIMATION
    =================================================
    */

    stopAnimation() {

        if (
            this.animationTimer
        ) {

            clearInterval(
                this.animationTimer
            );

        }


        this.animationTimer =
            null;


        this.animationRunning =
            false;

    }


    /*
    =================================================
     IS ANIMATING
    =================================================
    */

    isAnimating() {

        return this.animationRunning;

    }


    /*
    =================================================
     HIDE
    =================================================
    */

    hide() {

        this.stopAnimation();


        this.removeCurrentLayer();


        this.visible =
            false;


        this.currentFrame =
            -1;

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
     VISIBILITY
    =================================================
    */

    isVisible() {

        return this.visible;

    }


    /*
    =================================================
     FRAMES
    =================================================
    */

    getFrames() {

        return this.frames;

    }


    /*
    =================================================
     CURRENT FRAME
    =================================================
    */

    getCurrentFrame() {

        if (
            this.currentFrame < 0
        ) {

            return null;

        }


        return (
            this.frames[
                this.currentFrame
            ]
            ||
            null
        );

    }


    /*
    =================================================
     CURRENT TIME
    =================================================
    */

    getCurrentTime() {

        const frame =
            this.getCurrentFrame();


        if (
            !frame ||
            !frame.time
        ) {

            return null;

        }


        return new Date(
            frame.time * 1000
        );

    }


    /*
    =================================================
     OPACITY
    =================================================
    */

    setOpacity(value) {

        const opacity =
            Number(value);


        if (
            !Number.isFinite(
                opacity
            )
        ) {

            return;

        }


        this.opacity =
            Math.max(
                0,
                Math.min(
                    1,
                    opacity
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
    =================================================
     MAP REFRESH
    =================================================
    */

    refresh() {

        if (
            this.mapEngine?.map
        ) {

            this.mapEngine.map
                .invalidateSize();

        }


        if (
            this.layer
        ) {

            this.layer.redraw();

        }

    }


    /*
    =================================================
     DESTROY
    =================================================
    */

    destroy() {

        this.hide();

        this.frames = [];

        this.host = "";

        this.mapEngine = null;

    }

}