/*
====================================================
 SHOHIN WEATHER V5.7
 PressureLayer.js
 PRESSURE / ISOBAR ENGINE
====================================================
*/

export class PressureLayer {

    constructor(mapEngine, weatherData) {
        this.mapEngine = mapEngine;
        this.weatherData = weatherData;
        this.layer = null;
        this.visible = false;
    }

    show() {

        if (!this.mapEngine?.map) {
            throw new Error("PressureLayer: map is not ready");
        }

        this.hide();

        const hourly = this.weatherData?.hourly;

        if (!hourly) {
            throw new Error("PressureLayer: hourly data not found");
        }

        const pressure = Number(hourly.pressure_msl?.[0]);

        if (!Number.isFinite(pressure)) {
            throw new Error("PressureLayer: pressure data not found");
        }

        const map = this.mapEngine.map;
        const center = map.getCenter();

        this.layer = L.layerGroup();

        const size = 9;
        const step = 0.25;
        const half = Math.floor(size / 2);

        for (let y = -half; y <= half; y++) {

            for (let x = -half; x <= half; x++) {

                const lat = center.lat + y * step;
                const lon = center.lng + x * step;

                const variation =
                    Math.sin(x * 0.8 + y * 0.6) * 7;

                const value =
                    pressure + variation;

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
                        fillColor: this.color(value),
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

    color(value) {

        if (value < 990) return "#2563eb";
        if (value < 1000) return "#38bdf8";
        if (value < 1010) return "#4ade80";
        if (value < 1020) return "#facc15";
        return "#ef4444";
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