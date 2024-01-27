const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
    family_name:{
        type:String,
        unique:[true, "Family already exist in db"],
        required:[true, "Must enter name of family !"]
    },
    frequency_of_irrigation:{
        type:String,
        required:[true, "Must enter frequency of irrigation"]
    },
    humidity:{
        type:String,
        required:[true, "Must enter the humidity of family"]
    },
    method_of_irrigation:{
        type:mongoose.Schema.ObjectId,
        ref:'MethodOfIrrigation',
        required:[true, "Must enter method of irrigation"]
    },
    location:{
        type:mongoose.Schema.ObjectId,
        ref:'Location',
        required:[true, "Must enter the location"]
    },
    optimal_weather:{
        type:String,
        required:[true, "Must enter optimal weather"]
    },
    date_created:{
        type:Date,
        default:Date.now()
    }
});

const Family = mongoose.model( 'Family', familySchema );
module.exports = Family;