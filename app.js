const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors");
require("dotenv").config();
const fs = require('fs'); 

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
const casestudyRoute = require('./api/routes/casestudy');
const usersRoute = require('./api/routes/users');
const Addresses = require('./api/routes/addresses');
const feedbackRoute = require('./api/routes/feedback');

// End API Routes ....................................................
app.use('/casestudy', casestudyRoute);
app.use('/user', usersRoute);
app.use('/addresses', Addresses);
app.use('/feedback', feedbackRoute);

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

// const http = require('http');
// const app = require('./app');
// const port = 5001;
// const server = http.createServer(app);
// server.listen(port);
const https = require('https');
const key = fs.readFileSync('private.key');
const cert = fs.readFileSync('certificate.crt');
const cred = {
  key,
  cert
}
const httpsServer = https.createServer(cred, app);
httpsServer.listen(8443);
module.exports = app;
