const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Pincode = require('../models/pincodes'); // Import the Pincode model
const pincodes = require('../models/pincodes');

// POST API to upload pincode values to the database
router.post('/upload-pincodes', async (req, res) => {
  try {
    // Get an array of pincode values from the request body
    const pincodeValues = req.body.pincodeValues;

    // Check if any pincode values are provided in the request
    if (!pincodeValues || pincodeValues.length === 0) {
      return res.status(400).json({ message: 'No pincode values provided in the request' });
    }

    // Create an array to store the pincode documents to be inserted
    const pincodeDocuments = [];

    // Iterate through the provided pincode values
    for (const pincodeValue of pincodeValues) {

      // Check if the pincode value is a valid number
      if (!isNaN(pincodeValue)) {
        // Create a new pincode document
        const pincodeDocument = new Pincode({
        //   _id: mongoose.Schema.Types.ObjectId,
          pincode: parseInt(pincodeValue), // Convert the value to an integer
        });

        // Add the pincode document to the array
        pincodeDocuments.push(pincodeDocument);
      }
    }
    console.log(pincodeDocuments);

    // Insert the pincode documents into the database
    const insertedPincodes = await Pincode.insertMany(pincodeDocuments);

    res.status(201).json({ message: 'Pincodes uploaded successfully', insertedPincodes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
    Pincode.find()
      .then((data) => {
        res.json({data});
      })
      .catch((error) => {
        console.error('Error fetching pincodes:', error);
        res.status(500).json({ error: 'An error occurred while fetching pincodes.' });
      });
  });

  router.post('/delete', (req, res) => {
    const pincodeId = req.body.id;
    Pincode.findByIdAndRemove(pincodeId)
      .then((removedPincode) => {
        if (!removedPincode) {
          return res.status(404).json({ error: 'Pincode not found.' });
        }
        res.json({ message: 'Pincode deleted successfully.' });
      })
      .catch((error) => {
        console.error('Error deleting pincode:', error);
        res.status(500).json({ error: 'An error occurred while deleting the pincode.' });
      });
  });

  router.get('/:pincode', (req, res) => {
    const requestedPincode = req.params.pincode;
  
    Pincode.findOne({ pincode: requestedPincode })
      .then((pincode) => {
        if (!pincode) {
          return res.status(404).json({ exists: false });
        }
        res.status(200).json({ exists: true });
      })
      .catch((error) => {
        console.error('Error checking pincode existence:', error);
        res.status(500).json({ message: 'An error occurred while checking pincode existence.' });
      });
  });
  router.post('/save', (req, res, next) => {
    const row = new pincodes(
        {
            _id: new mongoose.Types.ObjectId(),
            pincode: req.body.pincode,
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

module.exports = router;
