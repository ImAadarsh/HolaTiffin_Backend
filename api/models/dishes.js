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
        description: {
            type: String,
            required: true
        },
        day: {
            type: Array,
            required: true,
            // enum: ["mon", "tue","wed","thu","fri","sat","sun"]
        },
        spicy: {
            type: String,
            required: true,
            // enum: ["medium", "spicy"]
        },
        food_type: {
            type: String,
            required: true,
            // enum: ["veg", "non_veg"]
        },
        food_time: {
            type: String,
            required: true,
            // enum: ["lunch", "dinner"]
        },
        nutrition: {
            type: String,
            required: true
        }
    }
);
module.exports = mongoose.model('dishes', salesofferScheme); 