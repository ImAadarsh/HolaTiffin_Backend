// Require Modules
const express = require('express') ;
const router  = express.Router();
const mongoose = require('mongoose');
const { json } = require('body-parser');
const fs = require('fs');

// Require Files
const checkAuth = require('../middleware/check-auth');
const cloudinary = require('../utils/cloudinary');  
const upload = require('../utils/multer');
const amountSent = require('../models/amountSent');
const Address = require('../models/addresses');
const users = require('../models/users');

 
router.get('/',(req,res,next)=>{
    amountSent.find()
    .select()
    .exec()
    .then(data => {
        if(data){
            const respose ={
                message: 'Data Fetched successfully', 
                count: data.length,
                data: data,
                
            };
            res.status(200).json(respose);
        }else{
            res.status(404).json({message: 'amountSent not found'});
        }
    })
    .catch(err => {
        res.status(500).json(err);
    })
    // res.status(200).json({message: 'amountSent not found'});
});

router.post('/',checkAuth, async (req,res,next)=>{
  try {
    const {
      ambassadorId,
      amount,
      monthOfPayment
    } = req.body;
    
    const entryexist = await amountSent.findOne({ambassadorId, monthOfPayment});
    if(true){
      if(entryexist){
       return res.status(200).json({ message: 'Payment Already Added' });
      }
      const newamountSent = new amountSent({
        _id: new mongoose.Types.ObjectId(),
      ambassadorId,
      amount,
      monthOfPayment
      });
      // Save the amountSent to the database
      await newamountSent.save();
      return res.status(201).json({ message: 'amountSent created successfully', amountSent: newamountSent });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


router.post('/getamountSentsByAmbassadorIdAndByMonth/',checkAuth, async (req,res,next)=>{
  try {
    const { ambassadorId, monthOfPayment } = req.body;


    // Check if the amount is disbursed for the given month
    const entryExist = await amountSent.findOne({ ambassadorId, monthOfPayment });
    if (entryExist) {
      return res.status(200).json({
        message: `Amount is already disbursed for month ${monthOfPayment}`,
        timestamp: entryExist.timestamp,
        monthOfPayment: monthOfPayment,
      });
    } else {
      return res.status(200).json({
        message: `Amount is still not disbursed for month ${monthOfPayment}`,
        timestamp: entryExist.timestamp,
        monthOfPayment: monthOfPayment,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


router.post('/delete',checkAuth,(req,res,next)=>{
    const id = req.body.id;
    amountSent.deleteOne({ _id: req.body.id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Case Study deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/uid/',(req,res,next)=>{
    const id = req.body.id;
    amountSent.find({_id: req.body.id})
    .select()
    .exec()
    .then(data => {
        // console.log("Data From Database"+data);
        if(data){
            res.status(200).json({data});
        }else{
            res.status(404).json({message: "Item Not Found"});
        }
    })
    .catch(error => {
            console.log(error);
            res.status(500).json(error);
        });
  });

module.exports = router;

