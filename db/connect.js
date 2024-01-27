const mongoose = require('mongoose');

const connectDB = (url) =>{
  return mongoose.connect(url);
}

module.exports = connectDB;
// main().catch(err => console.log(err));

// async function main() {
//   //mongoose.set('strictQuery', false);  
//   await mongoose.connect('mongodb://127.0.0.1:27017/sport');
//   console.log("mongo connect succesfully");
// }
