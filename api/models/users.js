const mongoose = require('mongoose');

const productScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {type: String, required: true},
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        },
        mobile: {type: String, required: true},
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

module.exports = mongoose.model('User', productScheme);