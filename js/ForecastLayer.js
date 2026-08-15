/*
====================================================
 SHOHIN WEATHER V5.11
 ForecastLayer.js
 FORECAST DATA ENGINE
====================================================
*/

export class ForecastLayer {

    constructor(weatherData) {

        this.weatherData = weatherData;

    }


    getDaily() {

        const daily =
            this.weatherData?.daily;

        if (!daily) {

            throw new Error(
                "ForecastLayer: daily data not found"
            );

        }

        const dates =
            daily.time || [];

        const max =
            daily.temperature_2m_max || [];

        const min =
            daily.temperature_2m_min || [];

        const weather =
            daily.weather_code || [];

        const result = [];

        const length =
            Math.min(
                dates.length,
                max.length,
                min.length
            );


        for (
            let i = 0;
            i < length;
            i++
        ) {

            result.push({

                date:
                    dates[i],

                max:
                    Number(max[i]),

                min:
                    Number(min[i]),

                weatherCode:
                    Number(
                        weather[i] ?? -1
                    )

            });

        }

        return result;
    }


    getDay(index = 0) {

        const forecast =
            this.getDaily();

        return forecast[index] || null;
    }


    getDays(count = 7) {

        return this
            .getDaily()
            .slice(0, count);
    }

}