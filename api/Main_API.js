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
  let optimal_weather = Number(plant_details["optimal_weather"]);
  let humidity = Number(plant_details["humidity"]);
  let location = Math.floor(Math.random() * 1000);
  plant_details["humidity"] = humidity / Math.pow(((current_weather - optimal_weather) / optimal_weather), 2) + humidity;
  plant_details["location"] = location + Math.floor(current_weather - optimal_weather / 5);
  return plant_details;
}

async function calculate(start_date, plants, families, current_weather) {
  var res = []
  plants.forEach(async plant => {
    const diff_days = getDaysDifference(start_date, new Date());
    let plant_details = families.filter(obj => obj._id.equals(plant.family))[0];
    plant_details.family_name = plant.name;
    let plantFreq = parseInt(plant_details["frequency_of_irrigation"])
    if(diff_days % 37 == 0) { // if(diff_days % plantFreq == 0) {
      plant_details = getChanges(plant_details, current_weather);
      console.log("plant_details", plant_details);
      res.push(plant_details)
    }
  });
  console.log("res", res);
  return res;
}

module.exports = { calculate };