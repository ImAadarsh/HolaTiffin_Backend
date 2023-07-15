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
const order = require('../models/order');
const Address = require('../models/addresses');

// Require System
function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString("base64");
  }
 
router.get('/',(req,res,next)=>{
    order.find()
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
            res.status(404).json({message: 'order not found'});
        }
    })
    .catch(err => {
        res.status(500).json(err);
    })
    // res.status(200).json({message: 'order not found'});
});

router.post('/',checkAuth, async (req,res,next)=>{
  try {
    const {
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      item,
      isSchedule,
      scheduleTime,
      isPlaced,
      paymentId,
      cardNumber,
      couponCode,
      discount,
      shipping,
      tip,
      totalPaid,
      deliveryChoice
    } = req.body;

    // Check if the address already exists in the database
    const addressExists = await Address.findOne({ address, city, state, zipCode });
    const isRefered = addressExists ? true : false;
    // If the address exists, use its ambassadorId for the order
    // Otherwise, set ambassadorId to null
    const orderAmbassadorId = addressExists ? addressExists.ambassadorId : null;

    // Create the new order
    const newOrder = new order({
      _id: new mongoose.Types.ObjectId(),
      email,
      phone,
      isRefered,
      ambassadorId: orderAmbassadorId,
      address,
      city,
      state,
      zipCode,
      item,
      timeStamp: Date.now(),
      isSchedule,
      scheduleTime,
      isPlaced,
      paymentId,
      cardNumber,
      couponCode,
      discount,
      shipping,
      tip,
      totalPaid,
      deliveryChoice
    });

    // Save the order to the database
    await newOrder.save();

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


router.post('/getOrdersByAmbassadorId/',checkAuth, async (req,res,next)=>{
  try {
    const { ambassadorId } = req.body;

    // Find orders with the specified ambassadorId
    const orders = await order.find({ ambassadorId }).exec();

    // Group orders based on common address, city, state, and zipCode
    const groupedOrders = await order.aggregate([
      {
        $match: { ambassadorId: ambassadorId }
      },
      {
        $group: {
          _id: { address: "$address", city: "$city", state: "$state", zipCode: "$zipCode" },
          totalOrders: { $sum: 1 },
          totalPaid: { $sum: "$totalPaid" }
        }
      }
    ]).exec();

    res.status(200).json({groupedOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/getOrdersByAmbassadorIdAndByMonth/',checkAuth, async (req,res,next)=>{
  try {
    const { ambassadorId, month } = req.body;

    // Convert the month string to an integer
    const parsedMonth = parseInt(month, 10);

    // Find orders with the specified ambassadorId
    const orders = await order.find({ ambassadorId }).exec();

    // Group orders based on common address, city, state, and zipCode
    const groupedOrders = await order.aggregate([
      {
        $match: { ambassadorId: ambassadorId }
      },
      {
        $match: { $expr: { $eq: [{ $month: { date: "$timeStamp" } }, parsedMonth] } }
      },
      {
        $group: {
          _id: { address: "$address", city: "$city", state: "$state", zipCode: "$zipCode" },
          totalOrders: { $sum: 1 },
          totalPaid: { $sum: "$totalPaid" }
        }
      }
    ]).exec();

    // Calculate the total sum of totalPaid across all orders
    const totalPaidSum = groupedOrders.reduce((acc, group) => acc + group.totalPaid, 0);
    const totalOrder = groupedOrders.reduce((acc, group) => acc + group.totalOrders, 0);

    // Calculate 8% of the total sum
    const eightPercent = 0.08;
    const eightPercentValue = totalPaidSum * eightPercent;

    res.status(200).json({groupedOrders,totalOrder, totalPaidSum, eightPercentValue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }

});

router.post('/delete',checkAuth,(req,res,next)=>{
    const id = req.body.id;
    order.deleteOne({ _id: req.body.id })
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
    order.find({_id: req.body.id})
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

