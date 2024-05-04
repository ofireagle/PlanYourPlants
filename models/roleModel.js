const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    admin:{
        type:Number,
        default:0
    },
    member:{
        type:Number,
        default:1
    }
});

module.exports = mongoose.model('role',roleSchema);