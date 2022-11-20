const mongoose = require("mongoose")
const Schema = mongoose.Schema
const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isFirst: {
        type: Boolean,
        default: true
    },
    status: {
        type: Boolean,
        default: true
    },
    type: {
        type: String,
        default: "STAFF"
    }
})
module.exports = mongoose.model('userMobiles', UserSchema)