const mongoose = require("mongoose")
const Schema = mongoose.Schema
const DestinationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    place: {
        type: String,
        default: true
    },
    time: {
        type: Date,
        default: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        //TypeDestination
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    tripId: {
        type: Schema.Types.ObjectId,
        ref: 'trips'
    }
})
module.exports = mongoose.model('destinations', DestinationSchema)