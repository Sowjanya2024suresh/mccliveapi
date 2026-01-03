const express = require ('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 5000;
const dotenv = require('dotenv');
var Upgrade = require('./upgrade.js');
var member = require('./mcc_members.js');
var restaurant = require('./restaurant.js');
var vs = require('./viewstatement.js');
var dashboard = require('./dashboard.js');
var events	=	require('./events.js');
var feedbacks = require('./feedbacks.js');
// var viewreport = require('./viewreport.js');
var user = require('./user.js');
var broadcastval = require('./broadcast.js');
var testemail = require('./testemail.js');
var banquet = require('./banquet.js');
var chamber = require('./chamber.js');
var magazine = require('./clubman.js');
var generalsetting = require('./general.js');
dotenv.config();



app.use(cors());
app.use(express.json({limit: '1024mb'}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); 
app.use((req, res, next) => {    
    res.setHeader('Access-Control-Allow-Origin', '*');   
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');    
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');    
    next();
    });// to get access to the server from any domain like postman.
app.use(express.static('uploads'));
app.use('/upgrade',Upgrade)
app.use('/member',member)
app.use('/restaurant',restaurant)
app.use('/events', events) 
app.use('/vs',vs)
app.use('/testemail', testemail)
app.use('/dashboard',dashboard)
app.use('/feedbacks',feedbacks)
// app.use('/viewreport',viewreport)
app.use('/user',user)
app.use('/broadcast',broadcastval)

app.use('/banquet',banquet)
app.use('/chamber',chamber)
app.use('/magazine', magazine)
app.use('/general',generalsetting)
app.listen(PORT, function(){
    console.log("Server is running on Port: " +PORT);


})