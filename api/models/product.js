const mongoose = require('mongoose');
const course = require('./feedback');
const users = require('./users');
const salesofferScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        image1: {
            type: String,
            required: true
        },
        image2: {
            type: String,
            required: true
        },
        Video: {
            type: String,
            required: true
        },
        shift: {
            type: String,
            required: true,
            enum: ["morning", "night","late_night"]
        },
        isAllDay: {
            type: Boolean,
            default: false
        }
    }
);
module.exports = mongoose.model('product_new', salesofferScheme); 