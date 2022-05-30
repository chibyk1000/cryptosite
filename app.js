const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const cookies = require('cookie-parser')

app.use(cookies())


mongoose.connect("mongodb://localhost/BTC_WALLET"); 
mongoose.Promise = global.Promise;
app.use(bodyParser.json())
const routes = require('./routes/routes')
app.set('view engine', 'ejs')
 
app.use('/static', express.static('static'))

app.use(routes)
app.listen(4040, ()=> console.log('server is listening at port 4040'))