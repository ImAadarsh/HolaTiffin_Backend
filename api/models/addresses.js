const mongoose = require('mongoose');
const users = require('./users');
const express = require('express') ;
const router  = express.Router();

const tbcAddresses = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        ambassadorId: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        zipCode: {
            type: String,
            required: true,
        },
        dishServed: {
            type: String,
            required: true,
        },
        stick: {
            type: Boolean,
            required: true,
        },
        timeStamp: {
            type: Date,
            default: Date.now,
          },
    }
);
module.exports = mongoose.model('addresses_new', tbcAddresses); 