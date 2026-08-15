import { DataManager } from "./DataManager.js";
import { ECMWF } from "./ECMWF.js";

export class WeatherEngine {

    constructor() {

        this.data = new DataManager();

        this.ecmwf = new ECMWF();

        this.location = {
            latitude: 38.5598,
            longitude: 68.7870
        };

        this.weather = null;

    }


    async load() {

        const key =
            `${this.location.latitude},${this.location.longitude}`;

        this.weather =
            await this.data.get(
                key,
                () =>
                    this.ecmwf.getWeather(
                        this.location.latitude,
                        this.location.longitude
                    )
            );

        return this.weather;

    }


    async setLocation(
        latitude,
        longitude
    ) {

        this.location.latitude =
            latitude;

        this.location.longitude =
            longitude;

        return this.load();

    }


    getWeather() {

        return this.weather;

    }

}