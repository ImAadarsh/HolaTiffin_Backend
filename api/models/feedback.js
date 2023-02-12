const mongoose = require('mongoose');
const salesofferScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        customerName: {
            type: String,
            required: true,
        },
        mobile: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        assistantId: {
            type: String,
            required: true,
        },
        message: {
            type: String,
        },
        ans1: {
            type: Number,
        },
        ans2: {
            type: Number,
        },
        ans3: {
            type: Number,
        },
        ans4: {
            type: Number,
        },
        ans5: {
            type: Number,
        },
    }
);
module.exports = mongoose.model('Feedback', salesofferScheme); 