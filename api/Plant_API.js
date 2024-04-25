const https = require('https');
const fs = require('fs');

class PlantApi {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async identifyPlant(imageFile) {
    const base64Image = await this.fileToBase64(imageFile);

    const data = JSON.stringify({
      api_key: this.apiKey,
      images: [base64Image],
      plant_language: 'en',
      plant_details: [
        'common_names',
        'url',
        'name_authority',
        'wiki_description',
        'taxonomy',
        'synonyms',
        'image'
      ],
    });

    const options = {
      hostname: 'api.plant.id',
      port: 443,
      path: '/v2/identify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        let responseData = '';

        res.on('data', chunk => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedResponse = JSON.parse(responseData);
            resolve(parsedResponse.suggestions[0]);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', error => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async fileToBase64(file) {
    try {
      const base64data = file.buffer.toString('base64');
      return base64data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PlantApi;