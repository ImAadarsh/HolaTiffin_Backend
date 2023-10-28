const mongoose = require('mongoose');
const course = require('./feedback');
const users = require('./users');
const salesofferScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        email: {
            type: String,
            required: true
        },
        subject: {
            type: String,
        },
        message: {
            type: String,
        }
    }
);
module.exports = mongoose.model('emails', salesofferScheme); 