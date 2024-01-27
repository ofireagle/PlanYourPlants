
/*const WeatherApi = require('./Weather_API');
//const PlantAPI = require('./Plant_API');
const { func } = require('joi');

require('dotenv').config();

function getDaysDifference(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

  // Convert the input dates to UTC to ensure consistent calculations
  const utcDate1 = new Date(date1.toUTCString());
  const utcDate2 = new Date(date2.toUTCString());

  // Calculate the difference in days
  const diffInDays = Math.round(Math.abs((utcDate1 - utcDate2) / oneDay));

  return diffInDays;
}

function getChanges(plant_details, current_weather) {
  plant_details["humidity"] = plant_details["humidity"] / Math.pow(((current_weather - plant_details["optimal_weather"]) / plant_details["optimal_weather"]), 2) + plant_details["humidity"];
  plant_details["location"] = location + Math.floor(current_weather - plant_details["optimal_weather"] / 5);
  return plant_details;
}

async function calculate1(user_id, plantsArr, current_weather) {
  const start_date = getUserStartDate(user_id);
  var res = {}
  plantsArr.forEach(plant_id => {
    const diff_days = getDaysDifference(start_date, new Date());
    const plant_details = getPlantDetails(plant_id);
    if(diff_days % plant_details["frequency_of_irrigation"] == 0) {
      plant_details = getChanges(plant_details, current_weather)
      res[plant_details["name"] = { "frequency_of_irrigation": plant_details["frequency_of_irrigation"], "humidity": plant_details["humidity"], "method_of_irrigation": plant_details["method_of_irrigation"], "location": plant_details["location"], "optimal_weather":plant_details["optimal_weather"]}];
    }
  });
  return res;
}

async function calculate(start_date, plants, families, current_weather) {
  var res = {}
  plants.forEach(plant => {
    const diff_days = getDaysDifference(start_date, new Date());
    const plant_details = families.findOne(family => family._id === plant.family_id);
    if(diff_days % plant_details["frequency_of_irrigation"] == 0) {
      plant_details = getChanges(plant_details, current_weather)
      res[plant_details["name"] = { "frequency_of_irrigation": plant_details["frequency_of_irrigation"], "humidity": plant_details["humidity"], "method_of_irrigation": plant_details["method_of_irrigation"], "location": plant_details["location"], "optimal_weather":plant_details["optimal_weather"]}];
    }
  });
  return res;
}

async function main(location) {
  const weather_api = new WeatherApi(process.env.WEATHER_API_KEY);
  //const plant_api = new PlantAPI(process.env.PLANT_API_KEY);

  try {
    // Get current weather in London
    const weatherData = await weather_api.getCurrentWeather(location);
    console.log('Weather API Response:', weatherData);

    // Identify a plant using an image
    const imageUrl = "C:\Users\Kahir\OneDrive\מסמכים\לימודים\Smart Gargen Project\server\public\images\IDuser-6471ecf5a94abc30f1420267-1686313893490-1.jpeg";
    const plantData = await plant_api.identifyPlant(imageUrl);
    console.log('Plant ID API Response:', plantData);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
module.exports = { calculate };*/

const WeatherApi = require('./Weather_API');
const PlantAPI = require('./Plant_API');
const Family = require('../models/familiesModel')

require('dotenv').config();

function getDaysDifference(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

  // Convert the input dates to UTC to ensure consistent calculations
  const utcDate1 = new Date(date1.toUTCString());
  const utcDate2 = new Date(date2.toUTCString());

  // Calculate the difference in days
  const diffInDays = Math.round(Math.abs((utcDate1 - utcDate2) / oneDay));

  return diffInDays;
}

function getChanges(plant_details, current_weather) {
  // console.log(plant_details);
  // console.log(current_weather);
  let optimal_weather = Number(plant_details["optimal_weather"]);
  let humidity =Number (plant_details["humidity"]);
 // console.log("numbers ? ->", optimal_weather);
  //console.log(humidity);
  //console.log(typeof(humidity));
  let location = Math.floor(Math.random() * 1000);
  plant_details["humidity"] = humidity / Math.pow(((current_weather - optimal_weather) / optimal_weather), 2) + humidity;
  plant_details["location"] = location + Math.floor(current_weather - optimal_weather / 5);
  //console.log(plant_details);
  return plant_details;
}

async function calculate1(user_id, plantsArr, current_weather) {
  const start_date = getUserStartDate(user_id);
  var res = {}
  plantsArr.forEach(plant_id => {
    const diff_days = getDaysDifference(start_date, new Date());
    const plant_details = getPlantDetails(plant_id);
    
    if(diff_days % plant_details["frequency_of_irrigation"] == 0) {
      plant_details = getChanges(plant_details, current_weather)
      res[plant_details["name"] = { "frequency_of_irrigation": plant_details["frequency_of_irrigation"], "humidity": plant_details["humidity"], "method_of_irrigation": plant_details["method_of_irrigation"], "location": plant_details["location"], "optimal_weather":plant_details["optimal_weather"]}];
    }
  });
  return res;
}

function convertStringToNumber(input) {
  // Check if the input contains a hyphen indicating a range
  if (input.includes('-')) {
    // Split the input into two parts based on the hyphen
    const [start, end] = input.split('-');

    // Convert the start and end to numbers and calculate the average
    const startNumber = parseInt(start, 10);
    const endNumber = parseInt(end, 10);
    const average = (startNumber + endNumber) / 2;

    // Round the average to get a single number
    const result = Math.round(average);

    return result;
  } else {
    // If there's no hyphen, simply convert the input to a number
    return parseInt(input, 10);
  }
}

async function calculate(start_date, plants, families, current_weather) {
  var res = []
  plants.forEach(async plant => {
    const diff_days = getDaysDifference(start_date, new Date());
    let plant_details = await Family.findById(plant.family);
   // console.log(plant_details["frequency_of_irrigation"]);
   // console.log(diff_days);
    let plantDiff = convertStringToNumber(plant_details["frequency_of_irrigation"])
   // console.log(plantDiff);
    //console.log("Days diff ", diff_days);
    if(diff_days % plantDiff == 0) {
      plant_details = getChanges(plant_details, current_weather)
      //res[plant_details["family_name"] = { "frequency_of_irrigation": plant_details["frequency_of_irrigation"], "humidity": plant_details["humidity"], "method_of_irrigation": plant_details["method_of_irrigation"], "location": plant_details["location"], "optimal_weather":plant_details["optimal_weather"]}];
      res.push(plant_details)
    }
  });
  return res;
}

async function main(location) {
  const weather_api = new WeatherApi(process.env.WEATHER_API_KEY);
  const plants_api2 = new PlantAPI(process.env.PLANT_API_KEY);

  try {
    // Get current weather in London
    console.log("location is -> ", location);
    const weatherData = await weather_api.getCurrentWeather(location);
    console.log('Weather API Response:', weatherData);

    // Identify a plant using an image
    const imageUrl = "C:\Users\Kahir\OneDrive\מסמכים\לימודים\Smart Gargen Project\server\public\images\IDuser-6471ecf5a94abc30f1420267-1686313893490-1.jpeg";
    const plantData = await plants_api2.identifyPlant(imageUrl);
    console.log('Plant ID API Response:', plantData);
  } catch (error) {
    console.error('Error:', error);
  }
}

//main();
module.exports = { calculate };