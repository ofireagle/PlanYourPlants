const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true, 'must enter the name of plant'],
        minLength:[2," must enter al least 2 charthers"],
        unique:[true, "plant already exist in db"],
    },
    family:{
        type:mongoose.Schema.ObjectId,
        ref:'Family',
        required:[true, 'Plant must have a family']
    },
    creator:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    imgUrl:String,
    date_created:{
        type:Date,
        default:Date.now()
    },
    description:String
});

const Plant = mongoose.model('Plant', plantSchema );
module.exports = Plant;
