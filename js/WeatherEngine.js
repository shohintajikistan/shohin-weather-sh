export class WeatherEngine {

    constructor() {

        this.location = {
            latitude: 38.5598,
            longitude: 68.7870,
            name: "Dushanbe"
        };

        this.weather = null;

    }

    async load() {

        console.log(
            "SHOHIN WeatherEngine работает!"
        );

        return {
            latitude: this.location.latitude,
            longitude: this.location.longitude
        };

    }

}