export class ECMWF {

    constructor() {

        this.url =
            "https://api.open-meteo.com/v1/ecmwf";

    }


    async getWeather(
        latitude,
        longitude
    ) {

        const params =
            new URLSearchParams({

                latitude,
                longitude,

                hourly: [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "precipitation",
                    "rain",
                    "snowfall",
                    "cloud_cover",
                    "wind_speed_10m",
                    "wind_direction_10m",
                    "wind_gusts_10m",
                    "pressure_msl",
                    "visibility",
                    "cape",
                    "shortwave_radiation"
                ].join(","),

                daily: [
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "precipitation_sum",
                    "snowfall_sum",
                    "sunrise",
                    "sunset",
                    "uv_index_max"
                ].join(","),

                forecast_days: "15",

                timezone: "auto"

            });


        const response =
            await fetch(
                this.url +
                "?" +
                params.toString()
            );


        if (!response.ok) {

            throw new Error(
                "ECMWF API error: " +
                response.status
            );

        }


        return await response.json();

    }

}