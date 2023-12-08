const mongoose = require('mongoose');
const course = require('./feedback');
const users = require('./users');
const salesofferScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        type: {
            type: String,
            required: true,
            enum: ["percent", "flat"]
        },
        minOrderValue: {
            type: Number,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        couponCode: {
            type: String,
            required: true
        }
    }
);
module.exports = mongoose.model('discounts_new', salesofferScheme); 