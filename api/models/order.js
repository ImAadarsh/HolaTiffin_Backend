const mongoose = require('mongoose');
const users = require('./users');
const express = require('express') ;
const router  = express.Router();

const tbcAddresses = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        email: {
            type: String,
            required: false,
        },
        phone: {
            type: String,
            required: false,
        },
        isRefered: {
            type: Boolean,
            default: false,
        },
        ambassadorId: {
            type: String,
            default: null,
        },
        address: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        state: {
            type: String,
            required: false,
        },
        zipCode: {
            type: String,
            required: true,
        },
        timeStamp: {
            type: Date,
            default: Date.now,
          },
        isSchedule: {
            type: Boolean,
            default: null,
        },
        scheduleTime: {
            type: Date,
            default: null,
        },
        isPlaced: {
            type: Boolean,
            default: false,
        },
        paymentId: {
            type: String,
            default: null,
        },
        cardNumber: {
            type: String,
            default: null,
        },
        couponCode: {
            type: String,
            default: null,
        },
        discount: {
            type: Number,
            default: null,
        },
        shipping: {
            type: Number,
            default: null,
        },
        tip: {
            type: Number,
            default: null,
        },
        totalPaid: {
            type: Number,
            default: null,
        },
    }
);
module.exports = mongoose.model('order', tbcAddresses); 