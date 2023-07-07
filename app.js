const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors");

mongoose.connect('mongodb+srv://tbc:gEewZPvvJ8lWFow1@tbc.foqhnug.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

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

const http = require('http');
// const app = require('./app');
const port = 5001;
const server = http.createServer(app);
server.listen(port);
module.exports = app;