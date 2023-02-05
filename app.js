const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb+srv://pinnacle:'+process.env.MONGO_ATLAS_PW+'@pinnacle.wmuz450.mongodb.net/?retryWrites=true&w=majority',{
    useNewUrlParser: true, 
useUnifiedTopology: true
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// API Routes ........................................................
const casestudyRoute = require('./api/routes/casestudy');
const usersRoute = require('./api/routes/users');
const contactRoute = require('./api/routes/contact');
const feedbackRoute = require('./api/routes/feedback');

// End API Routes ....................................................
app.use('/casestudy', casestudyRoute);
app.use('/user', usersRoute);
app.use('/contact', contactRoute);
app.use('/feedback', feedbackRoute);

// No Route Error Handler
app.use((req,res,next) => {
    const error = new Error('Uri Not Found');
    error.status = 404;
    next(error);
});

// Global Route Error Handler
app.use((error,req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,   
        }
    });
    });
module.exports = app;