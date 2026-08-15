export class DataManager {

    constructor() {

        this.cache = new Map();

    }


    async get(key, loader) {

        // Если данные уже есть
        if (this.cache.has(key)) {

            return this.cache.get(key);

        }


        // Загружаем данные
        const data = await loader();


        // Сохраняем
        this.cache.set(
            key,
            data
        );


        return data;

    }


    set(key, data) {

        this.cache.set(
            key,
            data
        );

    }


    getCached(key) {

        return this.cache.get(
            key
        );

    }


    has(key) {

        return this.cache.has(
            key
        );

    }


    remove(key) {

        this.cache.delete(
            key
        );

    }


    clear() {

        this.cache.clear();

    }

}