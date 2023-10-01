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
const placedOrder = require('../models/placedOrder');
const users = require('../models/users');

// Require System
function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString("base64");
  }

  
 
router.get('/',(req,res,next)=>{
    placedOrder.find()
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

// Inside your order route
router.post('/', async (req, res) => {

  try {
    // Get user details from the request body
    const { name, email, mobile, orderedItems, tip, totalPaid, shipping, isPlaced, paymentId, cardNumber, address, city, state, zipCode, spicy } = req.body;
console.log(req.body);
    // Find the user by email
    let user = await users.findOne({ email });

    // If the user does not exist, create a new user entry
    if (!user) {
      const user = new users({
        _id: new mongoose.Types.ObjectId(),
        name,
        email,
        mobile,
        userType : "user"
      });
      await user.save();
    }

    // Calculate delivery dates based on the selected days
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    console.log(currentDate);

    for (const item of orderedItems) {
       deliveryDates = null;

      for (const selectedDay of item.selectedDays) {
        
        daysUntilDelivery = (selectedDay - currentDay + 7) % 7;
        const deliveryDate = new Date(currentDate);
        if(currentDay==selectedDay){
          daysUntilDelivery = 7;
        }
        deliveryDate.setDate(currentDate.getDate() + daysUntilDelivery);
        deliveryDates = deliveryDate;
      }

      item.deliveryDates = deliveryDates;
    }

    // Create a new order
    const order = new placedOrder({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
      orderedItems,
      tip,
      totalPaid,
      shipping,
      isPlaced,
      paymentId,
      cardNumber,
      address,
      city,
      state,
      zipCode,
      spicy,
    });

    // Save the order to the database
    await order.save();

    res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

