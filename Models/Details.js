const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Details = new mongoose.Schema({
    Name:{
        type: String,
        required: 'Name is required',
        minlength: [3, 'Name must be atleast 3 character long']
    },
    Email:{
        type: String,
        required: 'Email is required'
    },
    UserName:{
        type: String,
        required: 'Username is required',
        unique: true
    },
    Password:{
        type: String,
        required: 'Password is required',
        minlength: [8, 'Password must be atleast 8 character long']
    },
    IsAdmin:{
        type: Boolean,
        default: false
    },
    saltSecret: String,
    Events:[{
        title:{
            type:String
        },
        date:{
            type:String
        }
    }],
    Semester:[{
        SemesterName:{
            type: String,
        },        
        Courses:[{
            CourseName:{
                type: String,
            },
            CreditHrs:{
                type: Number,
            },
            Classes :[{
                type: String
                    
            }]
        }]
    }]
});
// Custom validation for email
Details.path('Email').validate((val) => {
    emailRegex = /^([a-zA-Z0-9_]+)@?(students)\.(au)\.(edu)\.pk$/;
    return emailRegex.test(val);
}, 'Email must be on the students.au.edu.pk domain.');
Details.path('Name').validate((val) => {
    nameRegex = /^([a-zA-Z ]+)$/;
    return nameRegex.test(val);
}, 'Name must be alphabets.');

// Events
Details.pre('save', function (next) {
    if(!this.isModified('Password')) return next();
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.Password, salt, (err, hash) => {
            console.log("In pre function ",this.Password);
            this.Password = hash;
            this.saltSecret = salt;
            next();
        });
    });
});

// Methods
Details.methods.verifyPassword = function (Password) {
    // console.log(Password);
    // console.log(this.Password);
    // console.log(bcrypt.compareSync(Password, this.Password))
    return bcrypt.compareSync(Password, this.Password);
};
Details.methods.generateJwt = function () {
    return jwt.sign({ _id: this._id, Name: this.Name, Username: this.UserName, IsAdmin: this.IsAdmin},
        process.env.JWT_SECRET
    // {
    //     expiresIn: process.env.JWT_EXP
    // }
    );
}
const details = mongoose.model("Details", Details);
module.exports = details; 