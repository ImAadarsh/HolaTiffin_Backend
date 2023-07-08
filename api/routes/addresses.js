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
const addresses = require('../models/addresses');
const users = require('../models/users');

// Require System
function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString("base64");
  }

router.get('/',checkAuth,(req,res,next)=>{
    addresses.find()
    .select()
    .exec()
    .then(data => {
        if(data){
            const respose ={
                message: 'Data Fetched successfully', 
                count: data.length,
                data: data
            };
            res.status(200).json(respose);
        }else{
            res.status(404).json({message: 'Address not found'});
        }
    })
    .catch(err => {
        res.status(500).json(err);
    })
});

router.post('/',checkAuth, async (req, res, next) => {
    try {
      const ambassadorId = req.body.ambassadorId;
      const userExists = await users.findOne({ _id: ambassadorId });
      if (!userExists) {
        return res.status(404).json({ message: 'AmbassadorId not found' });
      }
      const { address, city, state, zipCode, stick, dishServed } = req.body;
      const AddressExists = await addresses.findOne({
        $and: [
          { address },
          { city },
          { state },
          { zipCode }
        ]
      });
      if (AddressExists) {
        return res.status(404).json({ message: 'Already Address Exists' });
      }
  
      const row = new addresses({
        _id: new mongoose.Types.ObjectId(),
        ambassadorId: req.body.ambassadorId,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        stick: req.body.stick,
        dishServed: req.body.dishServed
      });
  
      const savedAddress = await row.save();
      res.status(200).json({
        status: true,
        message: 'Address added to the database',
      });
    } catch (error) {
    //   console.log(error);
      res.status(500).json({status: false,
        message: 'Address Not Added',
        error: error});
    }
  });

router.get('/ambassador/:id',checkAuth,(req,res,next)=>{
    const id = req.params.id;
    addresses.find({ambassadorId: id})
    .exec()
    .then(doc => {
        // console.log("Addresses Added By this Ambassador"+doc);
        if(doc){
            res.status(200).json({
                count : doc.length,
                message: "Addresses Added By this Ambassador",
                data: doc
            });
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

