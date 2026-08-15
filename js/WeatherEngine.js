/*
====================================================
 SHOHIN WEATHER V5.9
 WeatherEngine.js
 REAL WEATHER API ENGINE
====================================================
*/

export class WeatherEngine {

    constructor(options = {}) {

        this.latitude =
            Number(
                options.latitude ?? 38.5598
            );

        this.longitude =
            Number(
                options.longitude ?? 68.7870
            );

        this.forecastDays =
            Number(
                options.forecastDays ?? 7
            );

        this.baseURL =
            "https://api.open-meteo.com/v1/forecast";

        this.data = null;

    }


    /*
    ================================================
    LOAD WEATHER
    ================================================
    */

    async load(
        latitude = this.latitude,
        longitude = this.longitude
    ) {

        const params = new URLSearchParams({

            latitude:
                latitude,

            longitude:
                longitude,

            forecast_days:
                this.forecastDays,

            timezone:
                "auto",

            hourly:
                [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "precipitation",
                    "rain",
                    "showers",
                    "snowfall",
                    "cloud_cover",
                    "wind_speed_10m",
                    "wind_direction_10m",
                    "wind_gusts_10m",
                    "pressure_msl",
                    "surface_pressure",
                    "visibility",
                    "uv_index",
                    "uv_index_clear_sky",
                    "cape",
                    "weather_code"
                ].join(","),

            daily:
                [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "apparent_temperature_max",
                    "apparent_temperature_min",
                    "sunrise",
                    "sunset",
                    "uv_index_max",
                    "precipitation_sum",
                    "rain_sum",
                    "showers_sum",
                    "snowfall_sum",
                    "wind_speed_10m_max",
                    "wind_gusts_10m_max",
                    "wind_direction_10m_dominant"
                ].join(",")

        });


        const url =
            this.baseURL +
            "?" +
            params.toString();


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(

                "Weather API HTTP " +
                response.status

            );

        }


        const data =
            await response.json();


        if (
            !data ||
            !data.hourly
        ) {

            throw new Error(
                "WeatherEngine: invalid API response"
            );

        }


        this.data =
            data;


        return data;

    }


    /*
    ================================================
    GET DATA
    ================================================
    */

    getData() {

        return this.data;

    }


    /*
    ================================================
    GET CURRENT
    ================================================
    */

    getCurrent() {

        if (!this.data?.hourly) {

            return null;

        }


        const hourly =
            this.data.hourly;


        return {

            temperature:
                hourly.temperature_2m?.[0],

            humidity:
                hourly.relative_humidity_2m?.[0],

            precipitation:
                hourly.precipitation?.[0],

            rain:
                hourly.rain?.[0],

            clouds:
                hourly.cloud_cover?.[0],

            windSpeed:
                hourly.wind_speed_10m?.[0],

            windDirection:
                hourly.wind_direction_10m?.[0],

            windGust:
                hourly.wind_gusts_10m?.[0],

            pressure:
                hourly.pressure_msl?.[0],

            visibility:
                hourly.visibility?.[0],

            uv:
                hourly.uv_index?.[0],

            uvClearSky:
                hourly.uv_index_clear_sky?.[0],

            cape:
                hourly.cape?.[0],

            weatherCode:
                hourly.weather_code?.[0]

        };

    }


    /*
    ================================================
    GET DAILY
    ================================================
    */

    getDaily() {

        return this.data?.daily || null;

    }


    /*
    ================================================
    GET LOCATION
    ================================================
    */

    getLocation() {

        return {

            latitude:
                this.latitude,

            longitude:
                this.longitude

        };

    }


    /*
    ================================================
    SET LOCATION
    ================================================
    */

    setLocation(
        latitude,
        longitude
    ) {

        this.latitude =
            Number(latitude);

        this.longitude =
            Number(longitude);

    }


    /*
    ================================================
    RELOAD
    ================================================
    */

    async reload() {

        return await this.load();

    }

}