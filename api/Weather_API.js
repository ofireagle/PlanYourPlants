const http = require('http');

class Weather_API {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  getCurrentWeather(city) {
    return new Promise((resolve, reject) => {
      const url = `http://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${city}`;

      http.get(url, (apiResponse) => {
        let data = '';

        apiResponse.on('data', (chunk) => {
          data += chunk;
        });

        apiResponse.on('end', () => {
          const weatherData = JSON.parse(data);
          resolve(weatherData);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }
}

module.exports = Weather_API;