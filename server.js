const app = require('./app');
const connectDB = require('./db/connect');
require('dotenv').config();

const port = process.env.PORT || 8000;
const start = async() =>{
    try {
        await connectDB(process.env.MONGO_URI_yarin)
        console.log('DB is connect succsesfully');
    } catch (error) {
        console.log(error);
    }
};

start();

//'127.0.0.1',
app.listen(port, () =>{
    console.log(`Server is running on port ${port}`)
});
