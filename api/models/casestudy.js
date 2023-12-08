const mongoose = require('mongoose');
const course = require('./feedback');
const users = require('./users');
const salesofferScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {
            type: String,
        },
        icon: {
            type: String,
        },
        text: {
            type: String,
        },
        link: {
            type: String,
        },
    }
);
module.exports = mongoose.model('CaseStudy_new', salesofferScheme); 