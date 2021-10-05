const mongoose = require('mongoose');
const passport = require('passport');
let DETAILS = require ('../Models/Details');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
let PasswordResetScehma = require('../Models/PasswordReset')
const details = require("../details.json");

module.exports.authenticate = (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => {       
        // error from passport middleware
        if (err) 
        {
            console.log("Error ", err);
            return res.status(400).json(err);
        }
        // registered user
        else if (user) return res.status(200).json({ "token": user.generateJwt() });
        // unknown user or wrong password
        else 
        {
            console.log("Info ", info);
            return res.status(404).json(info);
        }
    })(req, res);
}

module.exports.userProfile = (req, res, next) =>{
   // console.log("In user profile api ", req._id);
    DETAILS.findOne({ _id: req._id }, (err, user) => {
        if (!user)
          return res.status(404).json({ status: false, message: 'User record not found.' });
        else
          return res.status(200).json({ status: true, message: 'User found.' });
        //  user : _.pick(user,['fullName','email'])
    });
}
module.exports.changePassword = (req,res,next) => {
    DETAILS.findOne({UserName: req.body.UserName},(err,user)=>{
        if (err) { 
            res.send(null);
        }
        else{
            user.Password = req.body.Password
            user.save().then(data => {
                res.send(data)
                }).catch(err => {
                  res.send(err)
              });
        }
    })
}
module.exports.ResetPassword = async (req, res) => {
    if (!req.body.email) {
    return res
    .status(500)
    .json({ message: 'Email is required' });
    }
    const user = await DETAILS.findOne({Email:req.body.email, UserName: req.body.username});
    if (!user) {
    return res
    .status(409)
    .json({ message: 'Email does not exist' });
    }
    var resettoken = new PasswordResetScehma({ _userId: user._id, resettoken: crypto.randomBytes(16).toString('hex') });
    resettoken.save(function (err) {
    if (err) { return res.status(500).send({ msg: err.message }); }
    PasswordResetScehma.find({ _userId: user._id, resettoken: { $ne: resettoken.resettoken } }).deleteOne().exec();
    res.status(200).json({ message: 'Reset Password successfully.' });
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: details.email,
          pass: details.password
        }
    });
    let mailOptions = {
        from: '"University"<example.gmail.com>', // sender address
        to: user.Email, // list of receivers
        subject: "Password Reset", // Subject line
        text: 'You are receiving this because you (or someone else) have requested the reset the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://localhost:4200/resetPassword/' + resettoken.resettoken + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
    
        transporter.sendMail(mailOptions, (err, info) => {
            if(err)
            {
                console.log(err)
            }
            if(info){
                console.log(info)
            }
        })
    })
}

module.exports.ValidPasswordToken = async (req, res) => {
    console.log(req.body.resettoken)
    if (!req.body.resettoken) {
    return res
    .status(500)
    .json({ message: 'Token is required' });
    }
    const user = await PasswordResetScehma.findOne({resettoken: req.body.resettoken});
    console.log(user)
    if (!user) {
    return res
    .status(409)
    .json({ message: 'Invalid URL' });
    }
    DETAILS.findOne({ _id: user._userId }).then(() => {
    res.status(200).json({ message: 'Token verified successfully.' });
    }).catch((err) => {
    return res.status(500).send({ msg: err.message });
    });
}

module.exports.NewPassword =  async (req, res) => {
    PasswordResetScehma.findOne({ resettoken: req.body.resettoken }, function (err, userToken, next) {
        if (!userToken) {
        return res
            .status(409)
            .json({ message: 'Token has expired' });
        }
        DETAILS.findOne({_id: userToken._userId}, function (err, user, next) {
        if (!user) {
            return res
            .status(409)
            .json({ message: 'User does not exist' });
        }
        user.Password = req.body.newPassword
        user.save().then(data => {
            userToken.deleteOne()
            res.json({ message: 'Password reset successfully' })
            }).catch(err => {
                res.json({ message: 'Password can not reset.' });
            });
        // return bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
        //     if (err) {
        //     return res
        //         .status(400)
        //         .json({ message: 'Error hashing password' });
        //     }
        //     userEmail.password = hash;
        //     userEmail.save(function (err) {
        //     if (err) {
        //         return res
        //         .status(400)
        //         .json({ message: 'Password can not reset.' });
        //     } else {
        //         userToken.remove();
        //         return res
        //         .status(201)
        //         .json({ message: 'Password reset successfully' });
        //     }

        //     });
        // });
        });

    })
}