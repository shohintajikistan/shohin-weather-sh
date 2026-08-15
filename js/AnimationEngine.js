/*
====================================================
 SHOHIN WEATHER V5.12
 AnimationEngine.js
 WEATHER ANIMATION ENGINE
====================================================
*/

export class AnimationEngine {

    constructor() {

        this.running = false;

        this.frame = 0;

        this.timer = null;

        this.duration = 1000;

        this.callback = null;

    }


    start(
        callback,
        duration = 1000
    ) {

        this.stop();

        this.callback =
            typeof callback === "function"
                ? callback
                : null;

        this.duration =
            Math.max(
                100,
                Number(duration) || 1000
            );

        this.running = true;

        this.frame = 0;

        this.tick();

    }


    tick() {

        if (!this.running) {
            return;
        }


        const start =
            performance.now();


        const animate =
            now => {

                if (!this.running) {
                    return;
                }


                const elapsed =
                    now - start;


                const progress =
                    Math.min(
                        1,
                        elapsed /
                        this.duration
                    );


                if (this.callback) {

                    this.callback(
                        progress,
                        this.frame
                    );

                }


                this.frame++;


                if (
                    progress < 1
                ) {

                    requestAnimationFrame(
                        animate
                    );

                }
                else {

                    this.tick();

                }

            };


        requestAnimationFrame(
            animate
        );

    }


    stop() {

        this.running = false;

        this.frame = 0;

    }


    isRunning() {

        return this.running;

    }

}