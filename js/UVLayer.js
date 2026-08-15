/*
====================================================
 SHOHIN WEATHER V5.8
 UVLayer.js
 UV INDEX ENGINE
====================================================
*/

export class UVLayer {

    constructor(mapEngine, weatherData) {
        this.mapEngine = mapEngine;
        this.weatherData = weatherData;
        this.layer = null;
        this.visible = false;
    }

    show() {

        if (!this.mapEngine?.map) {
            throw new Error("UVLayer: map is not ready");
        }

        this.hide();

        const hourly = this.weatherData?.hourly;

        if (!hourly) {
            throw new Error("UVLayer: hourly data not found");
        }

        const uvArray =
            hourly.uv_index_clear_sky ||
            hourly.uv_index;

        if (!uvArray) {
            throw new Error("UVLayer: UV data not found");
        }

        const uv = Number(uvArray[0]);

        const safeUV =
            Number.isFinite(uv) ? uv : 0;

        const map = this.mapEngine.map;
        const center = map.getCenter();

        this.layer = L.layerGroup();

        const size = 9;
        const step = 0.18;
        const half = Math.floor(size / 2);

        for (let y = -half; y <= half; y++) {

            for (let x = -half; x <= half; x++) {

                const lat = center.lat + y * step;
                const lon = center.lng + x * step;

                const amount =
                    Math.max(
                        0,
                        Math.min(
                            12,
                            safeUV +
                            Math.sin(x + y) * 0.7
                        )
                    );

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
                        fillColor: this.color(amount),
                        fillOpacity: 0.22,
                        interactive: false
                    }
                ).addTo(this.layer);

            }
        }

        this.layer.addTo(map);

        this.visible = true;

        return true;
    }

    color(uv) {

        if (uv < 3) return "#22c55e";
        if (uv < 6) return "#facc15";
        if (uv < 8) return "#fb923c";
        if (uv < 11) return "#ef4444";

        return "#7c3aed";
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