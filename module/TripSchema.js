const mongoose = require("mongoose")
const Schema = mongoose.Schema
const TripSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    createBy: {
        type: Schema.Types.ObjectId,
        ref: 'userMobiles'
    }
})
module.exports = mongoose.model('trips', TripSchema)