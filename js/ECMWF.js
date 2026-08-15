export class ECMWF {

    constructor() {

        this.url =
            "https://api.open-meteo.com/v1/forecast";

    }

    async getWeather(
        latitude,
        longitude
    ) {

        const params =
            new URLSearchParams({

                latitude: latitude,

                longitude: longitude,

                current:
                    "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl,cloud_cover",

                hourly:
                    "temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,pressure_msl",

                forecast_days: "7",

                timezone: "auto"

            });


        const url =
            this.url +
            "?" +
            params.toString();


        console.log(
            "SHOHIN API:",
            url
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "API HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!data) {

            throw new Error(
                "API вернул пустой ответ"
            );

        }


        return data;

    }

}