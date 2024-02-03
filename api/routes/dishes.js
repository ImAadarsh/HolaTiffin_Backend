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
const product = require('../models/dishes');

// Require System
function base64Encode(file) {
  var body = fs.readFileSync(file);
  return body.toString("base64");
}

router.get('/', (req, res, next) => {
  product.find()
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
        res.status(404).json({ message: 'product not found' });
      }
    })
    .catch(err => {
      res.status(500).json(err);
    })
  // res.status(200).json({message: 'Product not found'});
});

router.get('/filter', (req, res, next) => {
  var query = {}; // Initialize an empty query object

  // Check if 'name' query parameter is present

  let {day, food_time}=req.query;
  // console.log("=======");
  // console.log(req.query);
  // console.log("=======");

  // Check if 'day' query parameter is present and valid
  // if (req.query.day && ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].includes(req.query.day)) {
  if(day && day!=="undefined" && day!=="")
  {
    query = { day: { $in: req.query.day.split(',') }, food_time: req.query.food_time }
  }
  // }

  // Check if 'food_type' query parameter is present and valid
  // if (req.query.food_type && ["veg", "non_veg"].includes(req.query.food_type)) {
  //   query.food_type = req.query.food_type;
  // }

  console.log("=====");
  console.log(query);
  console.log("=====");

  // Use the query object to filter the data
  product.find(query)
    .exec()
    .then(data => {
      if (data.length > 0) {
        const response = {
          message: 'Data Fetched successfully',
          count: data.length,
          data: data,
        };
        res.status(200).json(response);
      } else {
        res.status(404).json({ message: 'No matching dishes found' });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get('/days', (req, res, next) => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Define the sequence of days

  const currentDate = new Date(); // Get the current date
  currentDate.setHours(22, 15, 0, 0); // Set the time to 22:15

  const currentDay = currentDate.getDay(); // Get the current day as an index (0 for Sunday, 1 for Monday, etc.)

  // Calculate the index for each day in the sequence starting from the day after the current day
  const indexedDays = daysOfWeek.map((day, index) => {
    const dayIndex = (currentDay + index) % 7;
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + index + 1); // Adjusted to start from the next day
    const formattedDate = `${nextDate.getDate()} ${nextDate.toLocaleString('default', { month: 'short' })}`;
    return { day, formattedDate, index };
  });

  // Send the indexed days as a response
  res.status(200).json(indexedDays);
});





router.post('/', upload.fields([
  {
    name: "image1",
    maxCount: 1,
  },
  {
    name: "image2",
    maxCount: 1,
  }
]), async (req, res, next) => {
  try {
    path0 = req.files.image1[0];
    var base64String = base64Encode(path0.path);
    const uploadString = "data:image/jpeg;base64," + base64String;
    const uploadResponse = await cloudinary.uploader.upload(uploadString, {
      overwrite: true,
      invalidate: true,
      crop: "fill",
    });
    var url0 = uploadResponse.secure_url;
  } catch (e) {
    console.log(e);
  }
  try {
    path1 = req.files.image2[0];
    var base64String = base64Encode(path1.path);
    const uploadString = "data:image/jpeg;base64," + base64String;
    const uploadResponse = await cloudinary.uploader.upload(uploadString, {
      overwrite: true,
      invalidate: true,
      crop: "fill",
    });
    var url1 = uploadResponse.secure_url;
  } catch (e) {
    console.log(e);
  }
  const row = new product(
    {
      _id: new mongoose.Types.ObjectId(),
      image1: url1,
      image2: url0,
      name: req.body.name,
      spicy: req.body.spicy,
      nutrition: req.body.nutrition,
      food_time: req.body.food_time,
      day: req.body.day,
      price: req.body.price,
      description: req.body.description,
      food_type: req.body.food_type,

    }
  );
  row.save().then(result => {
    console.log(result);
    res.status(200).json({
      status: true,
      message: 'sucessfully uploaded.',
      createdOffer: result,
    });
  }).catch(error => {
    console.log(error);
    res.status(500).json(error);
  });
});


router.post('/byid/', (req, res, next) => {
  const id = req.body.id;
  console.log(id);
  product.findById(id)
    .exec()
    .then(data => {
      console.log("Data From Database" + data);
      if (data) {
        res.status(200).json({data});
      } else {
        res.status(404).json({ message: "Item Not Found" });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json(error);
    });
});

router.post('/delete', checkAuth, (req, res, next) => {
  const id = req.body.id;
  product.deleteOne({ _id: req.body.id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Dish deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/uid/', (req, res, next) => {
  const id = req.body.id;
  product.find({ _id: req.body.id })
    .select()
    .exec()
    .then(data => {
      // console.log("Data From Database"+data);
      if (data) {
        res.status(200).json({data});
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

