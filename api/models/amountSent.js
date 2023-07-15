const mongoose = require('mongoose');
const course = require('./feedback');
const users = require('./users');
const salesofferScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        ambassadorId: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now(),
        },
        monthOfPayment: {
            type: Number,
            required: true
        }

    }
);
module.exports = mongoose.model('amountSent', salesofferScheme); 