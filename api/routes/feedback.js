// Require Modules
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { json } = require('body-parser');
const fs = require('fs');

// Require Files
const checkAuth = require('../middleware/check-auth');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const feedback = require('../models/feedback');

// Require System
function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString("base64");
}

router.get('/', checkAuth, (req, res, next) => {
    feedback.find()
        .select()
        .exec()
        .then(data => {
            if (data) {
                const respose = {
                    message: 'Data Fetched successfully',
                    count: data.length,
                    data: data,
                };
                res.status(200).json(respose);
            } else {
                res.status(404).json({ message: 'Subcription not found' });
            }
        })
        .catch(err => {
            res.status(500).json(err);
        })
    // res.status(200).json({message: 'Product not found'});
});

router.post('/', checkAuth, (req, res, next) => {
    const row = new feedback(
        {
            _id: new mongoose.Types.ObjectId(),
            customerName: req.body.customerName,
            mobile: req.body.mobile,
            email: req.body.email,
            message: req.body.message,
            assistantId: req.body.assistantId,
            ans1: req.body.ans1,
            ans2: req.body.ans2,
            ans3: req.body.ans3,
            ans4: req.body.ans4,
            ans5: req.body.ans5,
        }
    );
    row.save().then(result => {
        console.log(result);
        res.status(200).json({
            status: true,
            message: 'Sucessfully Submitted',
            createdCourse: result,
        });
    }).catch(error => {
        console.log(error);
        res.status(500).json(error);
    });
});

router.post('/byid/', checkAuth, (req, res, next) => {
    const id = req.body.id;
    feedback.findById(id)
        .exec()
        .then(doc => {
            console.log("Data From Database" + doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ message: "Item Not Found" });
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json(error);
        });
});





module.exports = router;

