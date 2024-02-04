const express = require('express') ;
const router  = express.Router();
const User = require('../models/users');
const mongoose = require('mongoose');
const { json } = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const users = require('../models/users');
const emails = require('../models/emails');
const nodemail = require('../utils/nodemailer').default;
const checkAuth = require('../middleware/check-auth');
const upload = require('../utils/multer');
const fs = require('fs');
const { find } = require('../models/users');
const { array } = require('../utils/multer');

function base64Encode(file) {
  var body = fs.readFileSync(file);
  return body.toString("base64");
}

router.get('/',checkAuth,(req,res,next)=>{
  users.find()
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
          res.status(404).json({message: 'Users not found'});
      }
  })
  .catch(err => {
      res.status(500).json(err);
  })
});
router.get('/:id',checkAuth,(req,res,next)=>{
  users.find({  $or: [
    { userType: req.params.id }
  ]})
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
          res.status(404).json({message: 'Users not found'});
      }
  })
  .catch(err => {
      res.status(500).json(err);
  })
});

router.post("/signup",(req, res, next) => {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length >= 1) {
          return res.status(409).json({
            message: "Mail exists"
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err
              });
            } else {
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                name: req.body.name,
                mobile: req.body.mobile,
                userType: req.body.userType,
                password: hash
              });
              user
                .save()
                .then(result => {
                  console.log(result);
                  
                  res.status(201).json({
                    message: "User created",
                    user: result
                  });
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                    error: err
                  });
                });
            }
          });
        }
      });
  });

  

  router.delete("/:userId", (req, res, next) => {
    User.deleteOne({ _id: req.params.userId })
      .exec()
      .then(result => {
        res.status(200).json({
          message: "User deleted"
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

  router.post("/login", (req, res, next) => {
    User.find({
      email: req.body.email,
      active: true,
      userType: req.body.userType,
     })
      .exec()
      .then(user => {
        if (user.length < 1) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Auth failed"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id
              },
              process.env.JWT_KEY
            );
            return res.status(200).json({
              message: "Auth successful",
              user: user,
              token: token
            });
          }
          res.status(401).json({
            message: "Auth failed"
          });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });


router.post('/active',checkAuth, (req,res,next)=>{
  const id = req.body.id;
  User.update({_id:id},{active:true})
  .exec()
  .then(data => res.status(200).json({message: "User Activated"}))
  .catch(err => res.status(500).json(err));
});

router.post('/inactive',checkAuth, (req,res,next)=>{
  const id = req.body.id;
  User.update({_id:id},{active:false})
  .exec()
  .then(data => res.status(200).json({message: "User Inactivated"}))
  .catch(err => res.status(500).json(err));
});

router.post('/uid/',checkAuth,(req,res,next)=>{
  const id = req.body.id;
  users.find({_id: req.body.id})
  .select()
  .exec()
  .then(data => {
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

router.post('/emailAdd', (req, res, next) => {
  const row = new emails(
      {
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          message: req.body.message,
          subject: req.body.subject
      }
  );
  row.save().then(result => {
      console.log(result);
      res.status(200).json({
          status: true,
          message: 'Email Added Sucessfully'
      });
  }).catch(error => {
      console.log(error);
      res.status(500).json(error);
  });
});

router.get('/getEmail',(req, res, next) => {
  emails.find()
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
              res.status(404).json({ message: 'Subcription not found' });
          }
      })
      .catch(err => {
          res.status(500).json(err);
      })
});
module.exports = router;

