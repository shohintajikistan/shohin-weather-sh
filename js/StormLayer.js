/*
====================================================
 SHOHIN WEATHER V5.9
 StormLayer.js
 THUNDERSTORM / CAPE ENGINE
====================================================
*/

export class StormLayer {

    constructor(mapEngine, weatherData) {
        this.mapEngine = mapEngine;
        this.weatherData = weatherData;
        this.layer = null;
        this.visible = false;
    }

    show() {

        if (!this.mapEngine?.map) {
            throw new Error("StormLayer: map is not ready");
        }

        this.hide();

        const hourly = this.weatherData?.hourly;

        if (!hourly) {
            throw new Error("StormLayer: hourly data not found");
        }

        const capeArray =
            hourly.cape;

        if (!capeArray) {
            throw new Error(
                "StormLayer: CAPE data not found"
            );
        }

        const cape = Number(capeArray[0]);

        const safeCape =
            Number.isFinite(cape) ? cape : 0;

        const map = this.mapEngine.map;
        const center = map.getCenter();

        this.layer = L.layerGroup();

        const size = 9;
        const step = 0.20;
        const half = Math.floor(size / 2);

        for (let y = -half; y <= half; y++) {

            for (let x = -half; x <= half; x++) {

                const lat = center.lat + y * step;
                const lon = center.lng + x * step;

                const distance =
                    Math.sqrt(x * x + y * y);

                const amount =
                    Math.max(
                        0,
                        safeCape *
                        (
                            1 -
                            distance / (half * 1.5)
                        )
                    );

                if (amount < 50) continue;

                const radius =
                    Math.max(
                        1500,
                        Math.min(
                            9000,
                            1800 + amount * 2
                        )
                    );

                L.circle(
                    [lat, lon],
                    {
                        radius: radius,
                        stroke: false,
                        fill: true,
                        fillColor: "#a855f7",
                        fillOpacity: 0.16,
                        interactive: false
                    }
                ).addTo(this.layer);

            }
        }

        this.layer.addTo(map);

        this.visible = true;

        return true;
    }

    hide() {

        if (this.layer && this.mapEngine?.map) {
            this.mapEngine.map.removeLayer(this.layer);
        }

        this.layer = null;
        this.visible = false;
    }

    toggle() {

        this.visible
            ? this.hide()
            : this.show();
    }

    isVisible() {
        return this.visible;
    }
}