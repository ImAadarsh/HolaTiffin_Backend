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
const casestudy = require('../models/casestudy');

// Require System
function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString("base64");
  }

router.get('/',(req,res,next)=>{
    casestudy.find()
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
            res.status(404).json({message: 'casestudy not found'});
        }
    })
    .catch(err => {
        res.status(500).json(err);
    })
    // res.status(200).json({message: 'Product not found'});
});

router.post('/',checkAuth,  upload.fields([
    {
      name: "icon",
      maxCount: 1,
    },
    {
      name: "link",
      maxCount: 1,
    }
  ]), async (req,res,next)=>{
    try {
        path0 = req.files.icon[0];
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
        path1 = req.files.link[0];
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
    const row = new casestudy(
        {
            _id: new mongoose.Types.ObjectId(),
            link: url1,
            icon: url0,
            name: req.body.name,
            text: req.body.text,
        }
    );
    row.save().then(result=>{
        console.log(result);
        res.status(200).json({
            status: true,
            message: 'sucessfully uploaded.',
            createdOffer: result,
                });
    }).catch(error=>{
        console.log(error);
        res.status(500).json(error);
    });
});


router.post('/byid/',(req,res,next)=>{
    const id = req.body.id;
    casestudy.findById(id)
    .exec()
    .then(doc => {
        console.log("Data From Database"+doc);
        if(doc){
            res.status(200).json(doc);
        }else{
            res.status(404).json({message: "Item Not Found"});
        }
    })
    .catch(error => {
            console.log(error);
            res.status(500).json(error);
        });
});

router.get('/delete',checkAuth,(req,res,next)=>{
    const id = req.body.id;
    casestudy.deleteOne({ _id: req.body.id })
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
    casestudy.find({_id: req.body.id})
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

