const mongoose = require('mongoose');

const productScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {type: String},
        email: {
            type: String,
        },
        mobile: {type: String},
        active: {type: Boolean, default: true},
        password: {type: String},
        userType: {
            type: String,
            required: true,
            default: "user",
            enum: ["admin", "ambassador","user"]
        },
    }
);

module.exports = mongoose.model('User_new1', productScheme);
