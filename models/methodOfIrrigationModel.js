const mongoose = require('mongoose');

const methodSchema = new mongoose.Schema({
    method: {type:String, unique:[true, 'method already exist !']},
    rank: Number
});

methodSchema.pre('save', async function (next) {
    const highestRankLocation = await this.constructor.findOne({}, 'rank', { sort: { rank: -1 } });
    if (highestRankLocation) {
        this.rank = highestRankLocation.rank + 1;
    } else {
        this.rank = 1;
    }
    next();
});

const MethodOfIrrigation = mongoose.model('MethodOfIrrigation', methodSchema);
module.exports = MethodOfIrrigation;