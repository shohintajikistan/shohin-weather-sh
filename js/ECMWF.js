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

                hourly:
                    "temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,pressure_msl",

                daily:
                    "temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset",

                forecast_days: "7",

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
                "Weather API: HTTP " +
                response.status
            );

        }


        return response.json();

    }

}