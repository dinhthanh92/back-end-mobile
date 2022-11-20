
require('dotenv').config();
const express = require('express');

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const  cors = require("cors");
const CheckMiddleWare = require('./CheckMiddleWare');
const TripRouter = require('./routes/TripRoute');
const DestinationRoute = require('./routes/DestinationRoute');
const CheckAuth = require('./routes/CheckAuth');
const AuthRoute = require('./routes/AuthRoute');
const UserRoute = require('./routes/UserRoute');

const app = express();

// const URL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.qvlli.mongodb.net/React-app?retryWrites=true&w=majority`
const URL = `mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false`
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('Connect DB Success')
    }).catch(err => {
    console.log('err: ', err)
})
app.listen(PORT, () =>
    console.log(`Server started on ${PORT}`)
);

app.use('/api/trip',CheckMiddleWare, TripRouter);
app.use('/api/destination',CheckMiddleWare, DestinationRoute);
app.use('/api/auth', AuthRoute);
app.use('/api/user', CheckMiddleWare, UserRoute);
app.use('/api/check-auth',CheckMiddleWare, CheckAuth);

app.use(bodyParser.json({limit: '30ms'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '30ms' }));



