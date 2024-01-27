require('dotenv').config()
const date = new Date(Date.now() + process.env.JWT_EXPIRES * 24 * 60 * 60 * 1000);
console.log(date.toString());
console.log(process.env.JWT_EXPIRES);