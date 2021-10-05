require('./config/passportConfig');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const passport = require('passport');
require("dotenv").config();

const mongoose = require('mongoose')
const config = require('./db');
Route = require('./Routes/API');
mongoose.Promise = global.Promise;
mongoose.connect(config.DB,{ useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false})
    .then(
        ()=> {console.log('Database is connected')},
        err => { console.log('Cannot connect to the database '+ err)}
    );
mongoose.set('useCreateIndex', true);
const app = express();
global.__basedir = __dirname;
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use('/AUfolder',Route);

app.use('/', (req, res, next) => {
    res.send('server running')
})
  
let port = process.env.PORT || 4000;

const server = app.listen(port,function(){
    console.log('Listening on port ' + port);
});
