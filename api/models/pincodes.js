const mongoose = require('mongoose');
const course = require('./feedback');
const users = require('./users');
const salesofferScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        pincode: {
            type: Number,
            required: true
        }
    }
);
module.exports = mongoose.model('pincodes', salesofferScheme); 