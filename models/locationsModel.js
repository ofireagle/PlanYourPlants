const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    location: {type:String, unique:[true, 'location already exist !']},
    rank: Number
});

locationSchema.pre('save', async function (next) {
    const highestRankLocation = await this.constructor.findOne({}, 'rank', { sort: { rank: -1 } });
    if (highestRankLocation) {
        this.rank = highestRankLocation.rank + 1;
    } else {
        this.rank = 1;
    }
    next();
});

const Locations = mongoose.model('Locations', locationSchema);
module.exports = Locations;
