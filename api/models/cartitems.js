const mongoose = require('mongoose');
const course = require('./feedback');
const salesofferScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        orderId: {
            type: String,
            required: true
        },
        itemId: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
    }
);
module.exports = mongoose.model('cartitems_new', salesofferScheme); 