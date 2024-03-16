// Require Modules
const nodemailer = require('nodemailer');
const express = require('express') ;
const router  = express.Router();
const mongoose = require('mongoose');
const { json } = require('body-parser');
const fs = require('fs');
const request = require('request');

// Require Files
const checkAuth = require('../middleware/check-auth');
const cloudinary = require('../utils/cloudinary');  
const upload = require('../utils/multer');
const order = require('../models/order');
const Address = require('../models/addresses');
const placedOrder = require('../models/placedOrder');
const users = require('../models/users');


const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true, // use TLS
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASS,
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
    },
});


// Require System
function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString("base64");
  }

  
 
router.get('/',(req,res,next)=>{
    placedOrder.find()
    .select().populate('user')
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
      const { name, email, mobile, orderedItems, tip, totalPaid, shipping,tax, isPlaced, paymentId, cardNumber, address, city, state, zipCode, spicy } = req.body;
  // console.log(req.body); ---------------
      // Find the user by email
      let user = await users.findOne({ email, mobile });

      // If the user does not exist, create a new user entry
      if (!user) {
        const newuser = new users({
          _id: new mongoose.Types.ObjectId(),
          name,
          email,
          mobile,
          userType: "user",
        });
      
        try {
          user = await newuser.save();
          console.log('User saved successfully:', user);
        } catch (error) {
          if (error.name === 'ValidationError') {
            console.error('Validation Error:', error.message);
          } else {
            console.error('Error saving user:', error);
          }
        }
      }

    // // Calculate current date and time in New York time zone
    // const currentDate = new Date();

    //   // Subtract 4 hours from the current date
    //   currentDate.setHours(currentDate.getHours() - 4);
    //   console.log(currentDate);

    //   currentDate.setDate(currentDate.getDate() + 1);
    //   console.log(currentDate);

    //   const currentDay = currentDate.getDay();
    //   console.log(currentDay);

    //   for (const item of orderedItems) {
    //     deliveryDates = null;

    //     for (const selectedDay of item.selectedDays) {
          
    //       daysUntilDelivery = (selectedDay - currentDay + 7) % 7;
    //       const deliveryDate = new Date(currentDate);
    //       console.log(deliveryDate);
    //       if(currentDay==selectedDay){
    //         daysUntilDelivery = 7;
    //       }
    //       deliveryDate.setDate(currentDate.getDate() + daysUntilDelivery);
    //       deliveryDates = deliveryDate;
    //     }

    //     item.deliveryDates = deliveryDates;
    //   }
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 4);
    const currentHour = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
      // If current time is between 22:15 and 23:59
    currentDate.setDate(currentDate.getDate() + 2);
   
    const currentDay = currentDate.getDay();
    console.log(currentDay);

    for (const item of orderedItems) {
      deliveryDates = null;

      for (const selectedDay of item.selectedDays) {
        
        daysUntilDelivery = (selectedDay - currentDay + 7) % 7;
        const deliveryDate = new Date(currentDate);
        if(((currentDay-2)% 7)==selectedDay){
          daysUntilDelivery = 7;
        }
        deliveryDate.setDate(currentDate.getDate() + daysUntilDelivery);
        console.log(deliveryDate);
        deliveryDates = deliveryDate;
      }

      item.deliveryDates = deliveryDates;
    }
      // const now = new Date();
      const easternTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
      console.log("EST"+easternTime);

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
        tax,
        isPlaced,
        paymentId,
        cardNumber,
        address,
        city,
        state,
        zipCode,
        spicy,
        orderDate: easternTime,
      });

      // Save the order to the database
      await order.save();
      const retrievedOrder = await placedOrder
      .findById(order._id)
      .populate('orderedItems.foodItemId')
      .populate('user');

      // console.log();
      const r_id = retrievedOrder._id;
      const u_id = retrievedOrder.user._id;
      const m_id = retrievedOrder.user.mobile;
      const e_id = retrievedOrder.user.email;
      const name_email = e_id.split('@')[0];
      const a = retrievedOrder.address;
      const c = retrievedOrder.city;
      const s = retrievedOrder.state;
      const z = retrievedOrder.zipCode;
      const n = retrievedOrder.user.name;
// Assuming you have your order object as `order`

// Create an empty object to store items grouped by delivery date
const groupedItems = {};

// Iterate through the ordered items
for (const item of retrievedOrder.orderedItems) {
  const deliveryDate = item.deliveryDates.toISOString().split('T')[0]; // Extract the date in YYYY-MM-DD format
  if (!groupedItems[deliveryDate]) {
    groupedItems[deliveryDate] = [];
  }
  

  // Add the item to the group
  groupedItems[deliveryDate].push({
    id: item.foodItemId._id, // You can use a unique identifier for the item
    sku: item.foodItemId.name, // Replace with actual SKU
    description: item.foodItemId.description, // Replace with actual description
    quantity: 1, // You can calculate the quantity as needed
    photo_url: item.foodItemId.image1
  });
}
// console.log(groupedItems);

// Convert the grouped items into the desired format

const formattedData = [];
for (const date in groupedItems) {
  formattedData.push({
    id: r_id, // Replace with an actual ID
    type: 'Delivery',
    do_number: 'DO '+r_id, // Replace with the appropriate DO number
    date: date,
    tracking_number: u_id, // Replace with the tracking number
    order_number: r_id, // Replace with the order number
    address: a, // Replace with the address
    city: c,
    state: s,
    postal_code: z,
    instructions: n,
    deliver_to_collect_from: name_email, // Replace with the name
    phone_number: m_id, // Replace with the phone number // Replace with the fax number
    notify_email: e_id, // Replace with the email address
    items: groupedItems[date],
  });
}
// console.log(formattedData); 
// Define the options for the POST request
var options = {
  method: 'POST',
  url: 'https://app.detrack.com/api/v2/dn/jobs/bulk',
  headers: {
    'X-API-KEY': '060108bd77a64e5901025b9180f568d592719e0b851e510a',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ data: formattedData }),
};

// Send the POST request
request(options, function (error, response) {
  if (error) throw new Error(error);
  // console.log(response.body);
});
// console.log();
const customerName = name_email;
const customerEmail = e_id;

const emailHTML = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GOGOtiffin Email</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: orange;">

    <!-- Header -->
    <div style="text-align: center; padding: 20px;">
      <img src="https://gogotiffin.com/hola-long.svg" alt="GoGo Tiffin Logo" width="150px" height="80px" style="max-width: 100%;">
    </div>

    <!-- Main Content -->
    <div style="text-align: center; padding: 20px;">
      <p>Hello <strong>${customerName}</strong>,</p><br>
      <p>We hope you are enjoying our services!</p>
      <p>Your order details:</p>
      <!-- Add your main content here -->

      <!-- Button -->
      <a href="https://dashboard.holatiffin.com/details.php?id=${r_id}" style="display: inline-block; padding: 15px 30px; background-color: #2ecc71; color: white; text-decoration: none; font-size: 18px; border-radius: 5px;">View Order Details</a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; background-color: #e74c3c; color: white;">
      <p>&copy; 2024 GoGOtiffin. All rights reserved.</p>
    </div>

  </body>
  </html>
`;

const mailOptions = {
  from: 'hello@gogotiffin.com',
  to: customerEmail,
  subject: 'GOGOtiffin: Order Confirmation!!',
  html: emailHTML,
};

transporter.sendMail(mailOptions, (error, info) => {

  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});

// The 'formattedData' variable now contains the desired data structure.

      res.status(201).json({ message: 'Order placed successfully'});
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
    placedOrder.find({_id: req.body.id})
    .select()
    .exec()
    .then(data => {
        console.log("Data From Database"+data);
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

  router.post('/delivery', async (req, res) => {
    const deliveryDate  = req.body.date;
    if (!deliveryDate) {
      return res.status(400).json({ error: 'Delivery date is required' });
    }
  
    const startDate = new Date(`${deliveryDate}T00:00:00.000Z`);
    const endDate = new Date(`${deliveryDate}T23:59:59.999Z`);
    console.log(startDate);
    console.log(endDate);

  
    try {
      const orders = await placedOrder.find({
        'orderedItems.deliveryDates': {
          $gte: startDate,
          $lte: endDate,
        }
      }).populate('orderedItems.foodItemId').populate('user');
  
      if (orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for the given delivery date' });
      }
  
      res.json({orders});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;

