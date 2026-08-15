/*
====================================================
 SHOHIN WEATHER V5.10
 RadarLayer.js
 PRECIPITATION RADAR ENGINE
====================================================
*/

export class RadarLayer {

    constructor(mapEngine, weatherData) {
        this.mapEngine = mapEngine;
        this.weatherData = weatherData;
        this.layer = null;
        this.visible = false;
    }

    show() {

        if (!this.mapEngine?.map) {
            throw new Error("RadarLayer: map is not ready");
        }

        this.hide();

        const hourly =
            this.weatherData?.hourly;

        if (!hourly) {
            throw new Error(
                "RadarLayer: hourly data not found"
            );
        }

        const rain =
            hourly.precipitation;

        if (!rain) {
            throw new Error(
                "RadarLayer: precipitation data not found"
            );
        }

        const value =
            Number(rain[0]);

        const safeRain =
            Number.isFinite(value)
                ? value
                : 0;

        const map = this.mapEngine.map;
        const center = map.getCenter();

        this.layer = L.layerGroup();

        const size = 11;
        const step = 0.12;
        const half = Math.floor(size / 2);

        for (let y = -half; y <= half; y++) {

            for (let x = -half; x <= half; x++) {

                const lat =
                    center.lat + y * step;

                const lon =
                    center.lng + x * step;

                const distance =
                    Math.sqrt(x * x + y * y);

                const amount =
                    Math.max(
                        0,
                        safeRain *
                        (
                            1 -
                            distance / (half * 1.5)
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
                        fillColor:
                            this.color(amount),
                        fillOpacity:
                            amount > 0
                                ? 0.48
                                : 0.03,
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

        if (value < 0.1) return "#38bdf8";
        if (value < 1) return "#22c55e";
        if (value < 3) return "#facc15";
        if (value < 8) return "#f97316";

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