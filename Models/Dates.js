const mongoose = require("mongoose");

const dateSchema = new mongoose.Schema({
    Quizes:[{
        type: String,
        required: true,
    }],
    Assignments:[{
        type: String,
        required:true,
    }],
    Lectures:[{
        type: String,
        required: true,
    }],
    midsPaper:{
        type: String,
        required: true
    },
    finalsPaper:{
        type: String,
        required: true,
    }
});

const DateSchema = mongoose.model("dateLimits", dateSchema);
module.exports = DateSchema; 