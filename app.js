const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors");
require("dotenv").config();
const fs = require('fs'); 
const axios = require('axios');

mongoose.connect('mongodb+srv://tbc:gEewZPvvJ8lWFow1@tbc.foqhnug.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// mongodb+srv://tbc:gEewZPvvJ8lWFow1@tbc.foqhnug.mongodb.net/?retryWrites=true&w=majority
// mongodb://my_user:1%40Aadarsh@127.0.0.1:27017/test

const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// API Routes ........................................................
const orderRoute = require('./api/routes/orders');
const usersRoute = require('./api/routes/users');
const Addresses = require('./api/routes/addresses');
const feedbackRoute = require('./api/routes/feedback');
const amountRoute = require('./api/routes/amountSent');

// End API Routes ....................................................
app.use('/order', orderRoute);
app.use('/user', usersRoute);
app.use('/addresses', Addresses);
app.use('/feedback', feedbackRoute);
app.use('/amountSent', amountRoute);
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

// No Route Error Handler
app.use((req, res, next) => {
    const error = new Error('Uri Not Found');
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
server.listen(port);
module.exports = app;
