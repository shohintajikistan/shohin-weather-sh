export class WeatherEngine {

    constructor() {

        this.location = {
            latitude: 38.5598,
            longitude: 68.7870
        };

        this.model = "ecmwf_hres";

        this.layer = "temperature";

        this.forecast = null;

        this.currentTime = 0;

        this.isLoading = false;

    }


    setLocation(latitude, longitude) {

        this.location.latitude = latitude;
        this.location.longitude = longitude;

    }


    setLayer(layer) {

        this.layer = layer;

    }


    setForecast(data) {

        this.forecast = data;

    }


    setTime(time) {

        this.currentTime = time;

    }


    getState() {

        return {

            location: this.location,

            model: this.model,

            layer: this.layer,

            forecast: this.forecast,

            currentTime: this.currentTime,

            isLoading: this.isLoading

        };

    }

}