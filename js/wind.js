"use strict";

/* =========================================================
   SHOHIN WEATHER V3.3
   WIND ANIMATION ENGINE
   Open-Meteo + Canvas
========================================================= */

window.SHOHIN_WIND = {

    canvas: null,
    ctx: null,

    particles: [],

    windData: [],

    width: 0,
    height: 0,

    animationId: null,

    active: false,

    density: 900,

    speedMultiplier: 1,

    opacity: 0.75,

    lastTime: 0,

    grid: {
        latMin: -60,
        latMax: 85,
        lonMin: -180,
        lonMax: 180,
        cols: 36,
        rows: 18
    }

};


/* =========================================================
   START
========================================================= */

function initWindAnimation() {

    if (
        !window.SHOHIN ||
        !SHOHIN.map
    ) {

        console.warn(
            "SHOHIN map is not ready."
        );

        return;

    }


    createWindCanvas();

    resizeWindCanvas();

    window.addEventListener(
        "resize",
        resizeWindCanvas
    );


    SHOHIN.map.on(
        "move",
        resizeWindCanvas
    );


    SHOHIN.map.on(
        "zoom",
        resizeWindCanvas
    );


    loadWindData();

}


/* =========================================================
   CANVAS
========================================================= */

function createWindCanvas() {

    if (
        document.getElementById(
            "shohinWindCanvas"
        )
    ) {

        SHOHIN_WIND.canvas =
            document.getElementById(
                "shohinWindCanvas"
            );

        SHOHIN_WIND.ctx =
            SHOHIN_WIND.canvas.getContext(
                "2d"
            );

        return;

    }


    const mapElement =
        SHOHIN.map.getContainer();


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.id =
        "shohinWindCanvas";


    canvas.style.position =
        "absolute";

    canvas.style.left =
        "0";

    canvas.style.top =
        "0";

    canvas.style.width =
        "100%";

    canvas.style.height =
        "100%";

    canvas.style.pointerEvents =
        "none";

    canvas.style.zIndex =
        "450";


    mapElement.appendChild(
        canvas
    );


    SHOHIN_WIND.canvas =
        canvas;


    SHOHIN_WIND.ctx =
        canvas.getContext(
            "2d"
        );

}


/* =========================================================
   RESIZE
========================================================= */

function resizeWindCanvas() {

    if (
        !SHOHIN_WIND.canvas ||
        !SHOHIN.map
    ) {

        return;

    }


    const map =
        SHOHIN.map;


    const size =
        map.getSize();


    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    SHOHIN_WIND.width =
        size.x;


    SHOHIN_WIND.height =
        size.y;


    SHOHIN_WIND.canvas.width =
        size.x * dpr;


    SHOHIN_WIND.canvas.height =
        size.y * dpr;


    SHOHIN_WIND.canvas.style.width =
        size.x + "px";


    SHOHIN_WIND.canvas.style.height =
        size.y + "px";


    SHOHIN_WIND.ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    if (
        SHOHIN_WIND.particles.length === 0
    ) {

        createParticles();

    }

}


/* =========================================================
   LOAD REAL WIND
========================================================= */

async function loadWindData() {

    try {

        const grid =
            SHOHIN_WIND.grid;


        const lats = [];
        const lons = [];


        for (
            let row = 0;
            row < grid.rows;
            row++
        ) {

            const lat =
                grid.latMin +
                (
                    row /
                    (grid.rows - 1)
                ) *
                (
                    grid.latMax -
                    grid.latMin
                );


            for (
                let col = 0;
                col < grid.cols;
                col++
            ) {

                const lon =
                    grid.lonMin +
                    (
                        col /
                        (grid.cols - 1)
                    ) *
                    (
                        grid.lonMax -
                        grid.lonMin
                    );


                lats.push(
                    lat
                );

                lons.push(
                    lon
                );

            }

        }


        const url =

            "https://api.open-meteo.com/v1/forecast" +

            "?latitude=" +
            lats.join(",") +

            "&longitude=" +
            lons.join(",") +

            "&current=" +
            "wind_speed_10m," +
            "wind_direction_10m" +

            "&wind_speed_unit=kmh" +

            "&timezone=auto";


        const response =
            await fetch(
                url
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Wind API error"
            );

        }


        const data =
            await response.json();


        const results =
            Array.isArray(data)
                ? data
                : [data];


        SHOHIN_WIND.windData =
            results.map(
                function (
                    item,
                    index
                ) {

                    return {

                        lat:
                            lats[index],

                        lon:
                            lons[index],

                        speed:
                            Number(
                                item.current
                                    ?.wind_speed_10m ||
                                0
                            ),

                        direction:
                            Number(
                                item.current
                                    ?.wind_direction_10m ||
                                0
                            )

                    };

                }
            );


        createParticles();

        startWindAnimation();


        console.log(
            "💨 SHOHIN WIND DATA READY"
        );

    }

    catch (error) {

        console.error(
            "WIND ERROR:",
            error
        );

    }

}


/* =========================================================
   PARTICLES
========================================================= */

function createParticles() {

    SHOHIN_WIND.particles =
        [];


    for (
        let i = 0;
        i < SHOHIN_WIND.density;
        i++
    ) {

        SHOHIN_WIND.particles.push(
            createParticle()
        );

    }

}


/* =========================================================
   CREATE PARTICLE
========================================================= */

function createParticle() {

    return {

        x:
            Math.random() *
            SHOHIN_WIND.width,

        y:
            Math.random() *
            SHOHIN_WIND.height,

        age:
            Math.random() *
            100,

        maxAge:
            50 +
            Math.random() *
            100,

        speed:
            0.5 +
            Math.random() *
            1.5,

        length:
            8 +
            Math.random() *
            18

    };

}


/* =========================================================
   START
========================================================= */

function startWindAnimation() {

    SHOHIN_WIND.active =
        true;


    if (
        SHOHIN_WIND.animationId
    ) {

        return;

    }


    SHOHIN_WIND.lastTime =
        performance.now();


    SHOHIN_WIND.animationId =
        requestAnimationFrame(
            animateWind
        );

}


/* =========================================================
   STOP
========================================================= */

function stopWindAnimation() {

    SHOHIN_WIND.active =
        false;


    if (
        SHOHIN_WIND.animationId
    ) {

        cancelAnimationFrame(
            SHOHIN_WIND.animationId
        );

    }


    SHOHIN_WIND.animationId =
        null;


    if (
        SHOHIN_WIND.ctx
    ) {

        SHOHIN_WIND.ctx.clearRect(
            0,
            0,
            SHOHIN_WIND.width,
            SHOHIN_WIND.height
        );

    }

}


/* =========================================================
   ANIMATION
========================================================= */

function animateWind(
    timestamp
) {

    SHOHIN_WIND.animationId =
        requestAnimationFrame(
            animateWind
        );


    if (
        !SHOHIN_WIND.active
    ) {

        return;

    }


    const delta =
        Math.min(
            timestamp -
            SHOHIN_WIND.lastTime,

            50
        );


    SHOHIN_WIND.lastTime =
        timestamp;


    drawWind(
        delta
    );

}


/* =========================================================
   DRAW
========================================================= */

function drawWind(
    delta
) {

    const ctx =
        SHOHIN_WIND.ctx;


    if (!ctx) {
        return;
    }


    const width =
        SHOHIN_WIND.width;


    const height =
        SHOHIN_WIND.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    ctx.lineWidth =
        1.2;


    ctx.lineCap =
        "round";


    ctx.globalAlpha =
        SHOHIN_WIND.opacity;


    for (
        let i = 0;
        i < SHOHIN_WIND.particles.length;
        i++
    ) {

        const particle =
            SHOHIN_WIND.particles[i];


        const wind =
            getWindAtScreenPoint(
                particle.x,
                particle.y
            );


        if (!wind) {

            resetParticle(
                particle
            );

            continue;

        }


        const speed =
            Math.max(
                wind.speed,
                1
            );


        const direction =
            wind.direction *
            Math.PI /
            180;


        const dx =
            Math.sin(
                direction
            );


        const dy =
            -Math.cos(
                direction
            );


        const velocity =
            (
                0.03 *
                speed *
                particle.speed *
                SHOHIN_WIND
                    .speedMultiplier
            ) *
            delta;


        const oldX =
            particle.x;


        const oldY =
            particle.y;


        particle.x +=
            dx *
            velocity;


        particle.y +=
            dy *
            velocity;


        particle.age +=
            delta *
            0.06;


        if (
            particle.age >
            particle.maxAge ||
            particle.x < -50 ||
            particle.x >
                width + 50 ||
            particle.y < -50 ||
            particle.y >
                height + 50
        ) {

            resetParticle(
                particle
            );

            continue;

        }


        const alpha =
            Math.max(
                0,
                1 -
                particle.age /
                particle.maxAge
            );


        ctx.globalAlpha =
            alpha *
            SHOHIN_WIND.opacity;


        ctx.beginPath();


        ctx.moveTo(
            oldX,
            oldY
        );


        ctx.lineTo(
            particle.x,
            particle.y
        );


        ctx.strokeStyle =
            windParticleColor(
                speed
            );


        ctx.stroke();

    }


    ctx.globalAlpha =
        1;

}


/* =========================================================
   WIND FIELD
========================================================= */

function getWindAtScreenPoint(
    x,
    y
) {

    if (
        !SHOHIN.map ||
        !SHOHIN_WIND.windData.length
    ) {

        return null;

    }


    const latlng =
        SHOHIN.map.containerPointToLatLng(
            [
                x,
                y
            ]
        );


    const lat =
        latlng.lat;


    const lon =
        normalizeLongitude(
            latlng.lng
        );


    let nearest =
        null;


    let bestDistance =
        Infinity;


    for (
        let i = 0;
        i < SHOHIN_WIND.windData.length;
        i++
    ) {

        const point =
            SHOHIN_WIND.windData[i];


        const distance =
            Math.pow(
                point.lat -
                lat,
                2
            ) +

            Math.pow(
                normalizeLongitude(
                    point.lon
                ) -
                lon,
                2
            );


        if (
            distance <
            bestDistance
        ) {

            bestDistance =
                distance;

            nearest =
                point;

        }

    }


    return nearest;

}


/* =========================================================
   LONGITUDE
========================================================= */

function normalizeLongitude(
    lon
) {

    while (
        lon > 180
    ) {

        lon -= 360;

    }


    while (
        lon < -180
    ) {

        lon += 360;

    }


    return lon;

}


/* =========================================================
   RESET
========================================================= */

function resetParticle(
    particle
) {

    particle.x =
        Math.random() *
        SHOHIN_WIND.width;


    particle.y =
        Math.random() *
        SHOHIN_WIND.height;


    particle.age =
        0;


    particle.maxAge =
        60 +
        Math.random() *
        100;


    particle.speed =
        0.5 +
        Math.random() *
        1.5;

}


/* =========================================================
   WIND COLOR
========================================================= */

function windParticleColor(
    speed
) {

    if (
        speed < 5
    ) {

        return "#b8f3ff";

    }


    if (
        speed < 15
    ) {

        return "#6dd5ff";

    }


    if (
        speed < 25
    ) {

        return "#22a7ff";

    }


    if (
        speed < 40
    ) {

        return "#b05cff";

    }


    if (
        speed < 60
    ) {

        return "#ff5fa2";

    }


    return "#ff3b30";

}


/* =========================================================
   ENABLE
========================================================= */

function enableWind() {

    if (
        !SHOHIN_WIND.canvas
    ) {

        initWindAnimation();

        return;

    }


    SHOHIN_WIND.canvas.style.display =
        "block";


    SHOHIN_WIND.active =
        true;


    if (
        !SHOHIN_WIND.animationId
    ) {

        startWindAnimation();

    }

}


/* =========================================================
   DISABLE
========================================================= */

function disableWind() {

    stopWindAnimation();


    if (
        SHOHIN_WIND.canvas
    ) {

        SHOHIN_WIND.canvas.style.display =
            "none";

    }

}


/* =========================================================
   SPEED
========================================================= */

function setWindSpeed(
    value
) {

    SHOHIN_WIND.speedMultiplier =
        Number(value) || 1;

}


/* =========================================================
   OPACITY
========================================================= */

function setWindOpacity(
    value
) {

    SHOHIN_WIND.opacity =
        Math.max(
            0,
            Math.min(
                1,
                Number(value)
            )
        );

}


/* =========================================================
   REFRESH
========================================================= */

function refreshWindData() {

    loadWindData();

}


/* =========================================================
   GLOBAL API
========================================================= */

window.enableWind =
    enableWind;

window.disableWind =
    disableWind;

window.setWindSpeed =
    setWindSpeed;

window.setWindOpacity =
    setWindOpacity;

window.refreshWindData =
    refreshWindData;


/* =========================================================
   AUTO START
========================================================= */

window.addEventListener(
    "load",
    function () {

        setTimeout(
            function () {

                if (
                    window.SHOHIN &&
                    SHOHIN.map
                ) {

                    initWindAnimation();

                }

            },
            1200
        );

    }
);


/* =========================================================
   READY
========================================================= */

console.log(
    "💨 SHOHIN WEATHER V3.3 WIND ENGINE LOADED"
);