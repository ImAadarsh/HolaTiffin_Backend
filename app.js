const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors");
require("dotenv").config();
const fs = require('fs');
const axios = require('axios');
const AWS = require('aws-sdk');
const AWSFileUpload = require("express-fileupload");
AWS.config.update({ region: process.env.AWS_REGION });

mongoose.connect('mongodb+srv://tbc:gEewZPvvJ8lWFow1@tbc.foqhnug.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('strictQuery', false); // Set to true if you want to suppress the warning

// mongodb+srv://tbc:gEewZPvvJ8lWFow1@tbc.foqhnug.mongodb.net/?retryWrites=true&w=majority
// mongodb://my_user:1%40Aadarsh@127.0.0.1:27017/test
// Set up the app availability flag
let appAvailable = true;

// Middleware to check app availability
const checkAppAvailability = (req, res, next) => {
  if (!appAvailable) {
    // If the app is not available, return an error response
    res.status(503).json({ message: 'GoGo Tiffin is currently Offline, Please try again after sometime.' });
  } else {
    // If the app is available, continue processing the request
    next();
  }
};

const corsOptions = {
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Endpoint to toggle app availability (you can secure this endpoint as needed)
app.get('/toggle-app-availability/ewytg7326rytedghb8ce7y3x4h8e973uy2hw9dn8s7ue32dnw', (req, res) => {
  appAvailable = !appAvailable;
  res.json({ message: `App availability toggled to ${appAvailable ? 'available' : 'unavailable'}`, status: appAvailable ? 200 : 301 });
});

// To Make Off


// API Routes ........................................................
const orderRoute = require('./api/routes/orders');
const usersRoute = require('./api/routes/users');
const Addresses = require('./api/routes/addresses');
const feedbackRoute = require('./api/routes/feedback');
const amountRoute = require('./api/routes/amountSent');
const dishesRoute = require('./api/routes/dishes');
const orderPlacedRoute = require('./api/routes/placedOrders');
const pincodeRoute = require('./api/routes/pincodes');
const stripe = require("stripe")("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");

// End API Routes .......................................................
app.use('/order', orderRoute);
app.use('/placedOrder', orderPlacedRoute);
app.use('/dishes', dishesRoute);
app.use('/user', usersRoute);
app.use('/addresses', Addresses);
app.use('/feedback', feedbackRoute);
app.use('/amountSent', amountRoute);



// Endpoint to toggle app availability (you can secure this endpoint as needed)


app.post('/places', async (req, res, next) => {
  try {
    const input = req.body.input; // Assuming the input is sent in the request body
    // Construct the URL with the input and Google Maps API key
    const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/place/queryautocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${process.env.GOOGLE_MAP_API}`;

    // Make the HTTP request to the Google Maps API
    const response = await axios.get(googleMapsApiUrl);

    // Extract the 'description' and 'place_id' from all the predictions
    const predictions = response.data.predictions.map((prediction) => ({
      description: prediction.description,
      place_id: prediction.place_id,
    }));

    // Return the results with 'description' and 'place_id'
    res.json(predictions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/get-place-details', async (req, res) => {
  try {
    const placeId = req.body.placeId; // Assuming the place ID is sent in the request body

    // Construct the URL with the place ID and Google Maps API key
    const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${encodeURIComponent(
      placeId
    )}&key=${process.env.GOOGLE_MAP_API}`;

    // Make the HTTP request to the Google Places Details API
    const response = await axios.get(googleMapsApiUrl);

    // Parse the response to extract the address components
    const result = response.data.result;
    const addressComponents = result.address_components || [];
    let streetAddress = '',
      city = '',
      state = '',
      country = '',
      zip = '';

    for (const component of addressComponents) {
      if (component.types.includes('street_number') || component.types.includes('route')) {
        streetAddress += component.long_name + ' ';
      } else if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (component.types.includes('country')) {
        country = component.long_name;
      } else if (component.types.includes('postal_code')) {
        zip = component.long_name;
      }
    }

    // Return the address details as the response
    res.json({
      streetAddress: streetAddress.trim(),
      city,
      state,
      country,
      zip,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.use(checkAppAvailability);
app.use('/pincode', pincodeRoute);
app.post('/create-payment', async (req, res) => {
  let {amount}=req.body;
  console.log(amount);
  amount = amount*100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount, // Specify amount here
    currency: "USD" // Specify currency here
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});
// No Route Error Handler
app.use((req, res, next) => {
  const error = new Error('Uri Not Found The GoGo Tiffin');
  error.status = 404;
  next(error);
});

// Global Route Error Handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    }
  });
});

const http = require('http');
const port = 5001;
const server = http.createServer(app);
console.log(port);
server.listen(port);
module.exports = app;
