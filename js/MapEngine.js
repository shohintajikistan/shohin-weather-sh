/**
 * SHOHIN WEATHER V5
 * MapEngine
 */

export class MapEngine {

    constructor(options = {}) {

        this.container =
            options.container || "map";

        this.latitude =
            options.latitude ?? 38.5598;

        this.longitude =
            options.longitude ?? 68.7870;

        this.zoom =
            options.zoom ?? 5;

        this.map = null;

        this.marker = null;

        this.ready = false;

        this.layers = new Map();

    }


    async init() {

        const container =
            document.getElementById(
                this.container
            );

        if (!container) {

            throw new Error(
                "Map container not found: #" +
                this.container
            );

        }


        /*
         * Пока используем Leaflet.
         * Следующим этапом поверх него
         * добавим WebGL weather renderer.
         */

        if (
            typeof L === "undefined"
        ) {

            throw new Error(
                "Leaflet is not loaded"
            );

        }


        this.map =
            L.map(
                container,
                {

                    center: [
                        this.latitude,
                        this.longitude
                    ],

                    zoom: this.zoom,

                    zoomControl: true,

                    attributionControl: true

                }
            );


        L.tileLayer(

            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

            {

                maxZoom: 19,

                attribution:
                    "&copy; OpenStreetMap"

            }

        ).addTo(
            this.map
        );


        this.marker =
            L.marker([
                this.latitude,
                this.longitude
            ])
            .addTo(
                this.map
            );


        this.ready = true;


        return this;

    }


    setCenter(
        latitude,
        longitude,
        zoom = null
    ) {

        if (!this.map) {

            throw new Error(
                "MapEngine is not initialized"
            );

        }


        this.latitude =
            Number(latitude);

        this.longitude =
            Number(longitude);


        if (zoom !== null) {

            this.zoom =
                Number(zoom);

        }


        this.map.setView(

            [
                this.latitude,
                this.longitude
            ],

            this.zoom

        );


        if (this.marker) {

            this.marker.setLatLng([

                this.latitude,
                this.longitude

            ]);

        }

    }


    getCenter() {

        if (!this.map) {

            return null;

        }


        const center =
            this.map.getCenter();


        return {

            latitude:
                center.lat,

            longitude:
                center.lng,

            zoom:
                this.map.getZoom()

        };

    }


    setZoom(
        zoom
    ) {

        if (!this.map)
            return;


        this.zoom =
            Number(zoom);


        this.map.setZoom(
            this.zoom
        );

    }


    addLayer(
        name,
        layer
    ) {

        if (!this.map)
            return;


        if (
            this.layers.has(name)
        ) {

            this.removeLayer(
                name
            );

        }


        layer.addTo(
            this.map
        );


        this.layers.set(
            name,
            layer
        );

    }


    removeLayer(
        name
    ) {

        const layer =
            this.layers.get(
                name
            );


        if (!layer)
            return;


        this.map.removeLayer(
            layer
        );


        this.layers.delete(
            name
        );

    }


    showLayer(
        name
    ) {

        const layer =
            this.layers.get(
                name
            );


        if (
            layer &&
            !this.map.hasLayer(
                layer
            )
        ) {

            layer.addTo(
                this.map
            );

        }

    }


    hideLayer(
        name
    ) {

        const layer =
            this.layers.get(
                name
            );


        if (
            layer &&
            this.map.hasLayer(
                layer
            )
        ) {

            this.map.removeLayer(
                layer
            );

        }

    }


    destroy() {

        if (this.map) {

            this.map.remove();

            this.map =
                null;

        }


        this.layers.clear();

        this.marker =
            null;

        this.ready =
            false;

    }

}