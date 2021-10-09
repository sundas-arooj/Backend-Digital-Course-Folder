const express = require("express");
const nodemailer = require("nodemailer");
const generatePassword = require("generate-password");
const app = express();
const mailRoutes = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
let DETAILS = require('../Models/Details');
let ArchCrs = require('../Models/ArchiveCourses');
let dates = require('../Models/Dates');
let UserEvents = require('../Models/UserEvents')
let getUserEvents = require('../Models/UserEvents')
let RegCourse = require('../Models/RegCourses');
let StartReg = require('../Models/Scehma');
var fs = require('fs');
const bcrypt = require('bcryptjs');

const details = require("../details.json");
const controller = require("../controller/file.controller");
const userController = require("../controller/user.controller");
const jwtHelper = require('../config/JwtHelper');

// mailRoutes.route('').get(function(req, res) {
//     res.send(
//       "<h1 style='text-align: center'>Wellcome to FunOfHeuristic <br><br>😃👻😃👻😃👻😃👻😃</h1>"
//     );
//   });

  mailRoutes.get("/files", controller.getListFiles);
  mailRoutes.post("/upload", controller.upload);
  mailRoutes.get("/downloadfiles", controller.download);
  mailRoutes.post('/authenticate', userController.authenticate);
  mailRoutes.post('/changePassword', userController.changePassword);
  mailRoutes.post('/req-reset-password', userController.ResetPassword);
  mailRoutes.post('/new-password', userController.NewPassword);
  mailRoutes.post('/valid-password-token', userController.ValidPasswordToken);
  mailRoutes.get('/verifyToken',jwtHelper.verifyJwtToken, userController.userProfile);


mailRoutes.route('/getDates').get((req,res)=>{
  dates.findOne(function (err,date){
    if(err) {
        console.log("Error in retriving the data "+JSON.stringify(err,undefined,2));
    }
    else {
      //console.log(date);
      res.send(date);
    }
  });
});

mailRoutes.route('/getUsers').get((req,res)=>{
    DETAILS.find(function (err,users){
      if(err) {
          console.log("Error in retriving the data "+JSON.stringify(err,undefined,2));
      }
      else {
        var usersdetail=[];
        //console.log(date);
        users.forEach((user)=>{
          if(user.IsAdmin == false){
            user.Semester.forEach((semester)=>{
              if(semester.SemesterName == req.query.semester){
                usersdetail.push({'_id': user._id,'Name': user.Name, 'Username': user.UserName, 'Courses': semester.Courses});
              }
            });
          }
        })  
        res.send(usersdetail);
      }
  });
  });

mailRoutes.route('/saveDates').post((req, res) => {

  var Dates = new dates({
    Quizes: req.body.Quizes,
    Assignments: req.body.Assignments,
    Lectures: req.body.Lectures,
    midsPaper: req.body.midsPaper,
    finalsPaper: req.body.finalsPaper
  });
  Dates.save((err, data) => {
    if (!err) {
      res.send(data);
      console.log("Dates saved");
      // res.send(data);
    }
    else if (err) {
      console.log("Error in saving the dates " + JSON.stringify(err, undefined, 2));
    }
  });
});

mailRoutes.route('/events').post((req, res) => {
  var event={
    title:req.body.title,
    date:req.body.date
  }
  DETAILS.findOneAndUpdate(
    {'UserName' : req.body.Username},
    {$push:{Events: event}},
    {returnOriginal: false},
    (err,user)=>{
    if(err)
    {
      res.send(err);
    }
    else{
      res.send(user);
    }
  })
});

mailRoutes.route('/getEvents').get((req, res) => {
  DETAILS.find(
    {'IsAdmin' : false},
    'Events Name UserName',
    (err,user)=>{
    if(err)
    {
      res.send(err);
    }
    else{
      res.send(user);
    }
  })

});


// mailRoutes.route('/events').post((req, res) => {
//   GetEvents.findOneAndUpdate({}, { SemesterName: req.body.semName }, { upsert: true }, function (err, doc) {
//     if (err) {
//       console.log(err)
//       res.send(null);
//     }
//     else {
//       res.send(doc);
//     }
//   });
// });
mailRoutes.route('/SemName').get((req, res) => {
  StartReg.findOne({}, function (err, sem) {
    if (err) {
      res.send(false);
    }
    else if (sem != null) {
      res.send(JSON.stringify(sem.SemesterName));
    }
    else {
      res.send(false);
    }
  });
});

mailRoutes.route('/SemName').post((req, res) => {
  StartReg.findOneAndUpdate(
    {}, 
    { SemesterName: req.body.semName }, 
    { upsert: true }, 
    function (err, doc) {
    if (err) {
      console.log(err)
      res.send(null);
    }
    else {
      res.send(doc);
    }
  })
});

mailRoutes.route('/StartReg').post((req, res) => {
  console.log(req.body.IsStart);
  StartReg.findOneAndUpdate(
    {}, 
    { IsRegistration: req.body.IsStart }, 
    { upsert: true }, 
    function (err, doc) {
    if (err) {
      console.log(err)
      res.send(null);
    }
    else {
      res.send(doc);
    }
  });
});
mailRoutes.route('/StartReg').get((req, res) => {
  StartReg.findOne({}, function (err, reg) {
    if (err) {
      res.send(false);
    }
    else if (reg != null) {
      res.send(reg.IsRegistration);
    }
    else {
      res.send(false);
    }
  });
});

mailRoutes.route('/getFilesNo').post((req, res) => {
  var filesNumbr = [];
  var promise = new Promise((resolve, reject) => {
    req.body.forEach((dir, index) => {
      fs.access(dir, function(error) {
        if (error) {
          console.log("directory does not exist.")
        } else {
          files = fs.readdirSync(dir);
          filesNumbr.push(files.length);
          // console.log(dir + " : " + filesNumbr[index]);
          // console.log(index === req.body.length-1)
          if (index === req.body.length-1) resolve();
        }
      })         
    });
  })
  promise.then(() => {
    res.send(filesNumbr);
  });
   
  //   // fs.readdir(dir, (err, files) => {
  //   //   //console.log(files.length);
  //   //   filesNumbr.push(files.length);
  //   //   console.log(dir +" : "+filesNumbr[index]);
  //   // });
  // });
  
});

mailRoutes.route('/userCourses').get((req, res) => {
  let username = req.query.username;
  let semesterName = req.query.semesterName;

  DETAILS.findOne({ 'UserName': username }, function (err, user) {
    if (err) {
      console.log("Error in retriving the data " + JSON.stringify(err, undefined, 2));
      res.send(null);
    }
    else if (user != null) {
      console.log(user.Semester);
      if (user.Semester.length != 0) {
        user.Semester.forEach((semester) => {
          if (semester.SemesterName == semesterName) {
            res.send(semester.Courses)
          }
        });
      }
      else {
        res.send(null);
      }
    }
    else {
      res.send(null);
      console.log(user);
    }
  });
});


mailRoutes.route('/getfaculty').get((req, res) => {
  //let email = req.query.Email;
  let pass = req.query.Password;
  let username = req.query.Username;
  DETAILS.findOne({ 'UserName': username, 'Password': pass }, function (err, user) {
    if (err) {
      console.log("Error in retriving the data " + JSON.stringify(err, undefined, 2));
    }
    else {
      console.log(user);
      res.send(user);
    }
  });
});
mailRoutes.route('/getuser').get((req, res) => {
  let uname = req.query.UserName;
  DETAILS.find({ 'UserName': uname }, function (err, user) {
    if (err) {
      console.log("Error in retriving the data " + JSON.stringify(err, undefined, 2));
    }
    else {
      res.send(user);
    }
  });
});
mailRoutes.route('/getcourses').get((req, res) => {
  RegCourse.find({}, { 'CourseName': 1, 'Classes': 1 }, function (err, courses) {
    if (err) {
      console.log("Error in retriving the data " + JSON.stringify(err, undefined, 2));
    }
    else {
      res.send(courses);
    }
  });
});

mailRoutes.route('/getAllcourses').get((req, res) => {
  ArchCrs.findOne({'SemesterName' : req.query.semesterName},'Courses',function (err,ArchCourse){
      if(err) {
          console.log("Error in retriving the data "+JSON.stringify(err,undefined,2));
          res.send("error");
      }
      else {
        RegCourse.find({},function (err,RegCourses){
          if(err) {
              console.log("Error in retriving the data "+JSON.stringify(err,undefined,2));
              res.send("error");
          }
          else {
            var TempCrs = [];
            var crsFound =  false;
            if(ArchCourse !== null){
              ArchCourse.Courses.forEach((course) => {
                RegCourses.every((crs)=>{
    
                  if(crs.CourseName == course.CourseName){
                    course.Classes.forEach( function (value ){
                      crs.Classes.push(value);
                    });
                    crs.Classes.sort();
                    crsFound=true;
                    return false;
                  }else{
                    crsFound=false;
                    return true;
                  }
                });
                if(!crsFound){
                  var obj ={
                    "_id" : course._id,
                    "CourseName" : course.CourseName,
                    "Classes": course.Classes,
                    "CreditHrs" : course.CreditHrs
                  }
                  TempCrs.push(obj);
                }  
              });
              console.log("Archived : "+ TempCrs);
              res.send(TempCrs.concat(RegCourses)); 
            } 
            else{
              res.send(RegCourses);
            }         
          }
      });
          //res.send(courses);
      }
  });
});

mailRoutes.route('/classes').get(function (req, res) {
  let name = req.query.name;
  RegCourse.find({ 'CourseName': name }, function (err, classes) {
    if (err) {
      console.log("Error in retriving the data " + JSON.stringify(err, undefined, 2));
    }
    else {
      // console.log(classes);
      res.send(classes);
    }
  });
});
mailRoutes.route('/deleteCourses').get((req, res) => {
  RegCourse.deleteMany(function (err, courses) {
    if (err) {
      console.log("Error in deleting the data " + JSON.stringify(err, undefined, 2));
      res.send(null);
    }
    else {
      res.send(courses);
    }
  });
});
mailRoutes.route('/deleteDates').get((req, res) => {
  dates.deleteMany(function (err, dates) {
    if (err) {
      console.log("Error in deleting the data " + JSON.stringify(err, undefined, 2));
    }
    else {
      res.send(dates);
    }
  });
});
mailRoutes.route('/saveCourse').post((req, res) => {
  let CrsName = req.body.CName;
  let Class = req.body.Classes;
  let CrdHr = req.body.Credit_Hrs;
  var RCourse = new RegCourse({
    CourseName: CrsName,
    Classes: Class,
    CreditHrs: CrdHr
  });
  //console.log("I'm here");
  RCourse.save((err, data) => {
    if (!err) {
      res.send(data);
      console.log("Courses saved");
      // res.send(data);
    }
    else if (err) {
      console.log("Error in saving the data " + JSON.stringify(err, undefined, 2));
    }
  });
});

mailRoutes.route('/sendMail').post((req, res, next) => {
  console.log("request came");
  var password = generatePassword.generate({
    length: 8,
    numbers: true
  });
  console.log(password);
  var USER = new DETAILS({
    Name: req.body.UserDetails.Name,
    Email: req.body.UserDetails.Email,
    Password: password,
    UserName: req.body.UserDetails.UserName,
    IsAdmin: req.body.UserDetails.IsAdmin
  });
  let subdir = req.body.Semester;
USER.save((err,data) => {
  if(!err){
    sendMail(req.body.UserDetails.Name, req.body.UserDetails.Email, req.body.UserDetails.UserName, password, info => {
      console.log(`The mail has beed send 😃`);
      fs.mkdir(subdir+"/"+req.body.UserDetails.Name, { recursive: true }, (err) => {
        if (err) throw err;
     });
      // if(req.body.UserDetails.IsAdmin){
      //   fs.mkdir(subdir, { recursive: true }, (err) => {
      //     if (err) throw err;
      //  });
        
      // }else{
      //   fs.mkdir(subdir+"/"+req.body.UserDetails.Name, { recursive: true }, (err) => {
      //     if (err) throw err;
      //  });
      // }
      res.send(true);
    //   res.send(info);
    });
    console.log("User saved");
  }      
  else{
    if (err.code == 11000)
      res.status(422).send(['Duplicate email address found.']);
    else
      res.send(err);
  //  console.log("Error in saving the data "+JSON.stringify(err,undefined,2));
  } 
}); 
});

async function sendMail(Name, Email, username, pass, callback) {
  // create reusable transporter object using the default SMTP transport
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
    to: Email, // list of receivers
    subject: "Registration Email", // Subject line
    html: `<h1>Hi ${Name}</h1><br>
    <p>Your account has been created, Please find the login details below</p> <br>
    <p> Username: ${username} </p> <br>
    <p style="font-family: Georgia;"> Password: ${pass} </p> <br> <br> 
    <p> Click on the link for login </p> <a href="http://localhost:4200/">http://localhost:4200</a>`
  };
  // <a href="http://localhost:4000/AUfolder/confirmation/${token}">http://localhost:4200/dashboard/${token}</a>
  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);

  callback(info);
}
mailRoutes.route('/editCourses').post((req, res) => {
 DeleteRegCourse(req.body.RegCrs,req.body.SemesterName);
 AddRegCourses(req.body.RegCrs);
 DeleteUserCourses(req.body.Uname,req.body.SemesterName);
  res.send(true);
})
async function DeleteRegCourse(RegCrs,SemesterNamee){
  await ArchCrs.findOne({'SemesterName' : SemesterNamee},(err,data)=>{
    RegCrs.forEach((obj,i)=>{
        data.Courses.every(Crs=> {
            if(Crs.CourseName == RegCrs[i].CourseName){
              for(var j=0;j<RegCrs[i].Classes.length; j++)
              {
                Crs.Classes = Crs.Classes.filter(clas => clas!==RegCrs[i].Classes[j])
              }
              Crs.Classes.sort();
              return false;
            }
            else{
              return true;  
            }      
          });
    });
    data.save().then(data => {
      console.log(data)
      }).catch(err => {
        console.log(err)
    });
  })
  ArchCrs.findOne({'SemesterName' : SemesterNamee},(err,data)=>{
    data.Courses.forEach(Crs=> {
      if(Crs.Classes.length == 0){
        ArchCrs.updateOne({'SemesterName' : SemesterNamee},
        { $pull : {"Courses" : {"CourseName": Crs.CourseName}}},(err,raw)=>{
          if(err){
            console.log(err);
          }
          else{
            console.log(raw);
          }
        });
      }
    })
  })
}
async function AddRegCourses(RegCrs){
  await RegCourse.find({},(err,data)=>{
    console.log(data);
    for(var i=0;i<RegCrs.length; i++)
      { 
        var found=false;
        data.every(Crs=> {
            if(Crs.CourseName == RegCrs[i].CourseName){
              found=true;
              for(var j=0;j<RegCrs[i].Classes.length; j++)
              {
                Crs.Classes.push(RegCrs[i].Classes[j]);
              }
              Crs.Classes.sort();
              Crs.save().then(data => {
                console.log(data)
                }).catch(err => {
                  console.log(err)
              });
              return false;
            }
            else{
              return true;  
            }
          });
        if(!found){
          var obj = new RegCourse({
            CourseName : RegCrs[i].CourseName,
            Classes : RegCrs[i].Classes,
            CreditHrs : RegCrs[i].CreditHrs
          });
          obj.save().then(data => {
            console.log(data)
            }).catch(err => {
              console.log(err)
          });
        }
      }  
  })
}
async function DeleteUserCourses(Username, semester){
  await DETAILS.updateOne(
    {'UserName' : Username},
    { $pull : {"Semester" : {"SemesterName" : semester}}},
    (err,raw)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log(raw);
      }
    });
  DETAILS.findOne({'UserName' : Username},'Name',(err,res)=>{
    if(err)
    {
      console.log(err);
    }
    else{
      var dir = semester + '/' + res.Name;
      fs.rmdir(dir, { recursive: true }, (err) => {
        if (err) throw err;
      });
      console.log(res);
    }
  })
}
// Archive function definition
async function archiveCrs(CrsDetail) {
  // console.log("In archive function")
   await ArchCrs.findOne({'SemesterName' : CrsDetail.SemesterName},(err,data)=>{
     if(data!=null){
       for(var i=0;i<CrsDetail.Courses.length; i++)
       { 
         var found=false;
         data.Courses.every(Crs=> {
             if(Crs.CourseName == CrsDetail.Courses[i].CourseName){
               found=true;
               for(var j=0;j<CrsDetail.Courses[i].Classes.length; j++)
               {
                 Crs.Classes.push(CrsDetail.Courses[i].Classes[j]);
               }
               Crs.Classes.sort();
               return false;
             }
             else{
               return true;  
             }
           });
         if(!found){
           data.Courses.push(CrsDetail.Courses[i]);
         }
       }
       data.save().then(data => {
         console.log(data)
         //res.json('Update complete');
         }).catch(err => {
           console.log(err)
             //res.status(400).send("unable to update the database");
       });
     }
     else{
       var obj = new ArchCrs ({
         SemesterName : CrsDetail.SemesterName,
         Courses: CrsDetail.Courses
       });
       obj.save((error,data2) => {
         if(!error){
           console.log("Archive Courses Saved");
           //res.send(data2)
         }
         else{
           console.log(error);
           //res.send(error);
         }
       })
     }
   })
 }

//delete course function definition
function DeleteCourse(RegCrs) {
  console.log("In delete function")
  RegCrs.forEach((obj, index) => {
    RegCourse.updateOne({ CourseName: obj.CourseName },
      { $pull: { Classes: { $in: obj.Classes } } }, (err, raw) => {
        if (err) {
          console.log(err)
          // if((index + 1) == RegCrs.length ) // only send response in last iteration
          // {
          //   res.send(err)
          // }      
        }
        else {
          console.log(raw)
          // if((index + 1) == RegCrs.length ) // only send response in last iteration
          // {
          //   res.send("successful")
          // }        
        }
      });
    RegCourse.findOne({ "CourseName": obj.CourseName }, function (err, course) {
      if (course.Classes.length == 0) {
        RegCourse.deleteOne({ "CourseName": obj.CourseName }, function (err, res) {
          if (err) {
            console.log(err)
          }
          else {
            console.log(res)
          }
        })
      }
    })
  });
}
mailRoutes.route('/registerCourse').post((req, res) => {
  let Username = req.body.UName;
  DETAILS.findOne({ 'UserName': Username }, function (err, user) {
    if (err) {
      console.log("Error in retriving the data " + JSON.stringify(err, undefined, 2));
    }
    else {
      var semester = {
        SemesterName: req.body.Semester,
        Courses: req.body.RegCrs
      };
      console.log(user);
      var index = user.Semester.push(semester);
      user.save().then(SavedUser => {
        // function calling archive then delete
        archiveCrs(semester);
        DeleteCourse(req.body.RegCrs);
        console.log(SavedUser);
        let name = SavedUser.Name;
        let currentSemester = SavedUser.Semester[index - 1].SemesterName;
        let maindir = currentSemester + "/" + name;
        let courses = SavedUser.Semester[index - 1].Courses;
        courses.forEach((course) => {
          // console.log(course.Classes);
          let coursefolder = maindir + "/" + course.CourseName;
          fs.mkdir(coursefolder, { recursive: true }, (err) => {
            if (err) throw err;
          });
          let classes = course.Classes;
          classes.forEach((val) => {
            var classfolder = coursefolder + "/" + val;
            fs.mkdir(classfolder, { recursive: true }, (err) => {
              if (err) throw err;
            });
            var quizfolder = classfolder + "/" + "Quizes";
            fs.mkdir(quizfolder, { recursive: true }, (err) => {
              if (err) throw err;
            });
            var assignfolder = classfolder + "/" + "Assignments";
            fs.mkdir(assignfolder, { recursive: true }, (err) => {
              if (err) throw err;
            });
            var midsfolder = classfolder + "/" + "Mids";
            fs.mkdir(midsfolder, { recursive: true }, (err) => {
              if (err) throw err;
            });
            var finalsfolder = classfolder + "/" + "Finals";
            fs.mkdir(finalsfolder, { recursive: true }, (err) => {
              if (err) throw err;
            });
            var bestMid = midsfolder + "/" + "BestPaper";
            fs.mkdir(bestMid, { recursive: true }, (err) => {
              if (err) throw err;
            })
            var worstMid = midsfolder + "/" + "WorstPaper";
            fs.mkdir(worstMid, { recursive: true }, (err) => {
              if (err) throw err;
            })
            var avgMid = midsfolder + "/" + "AvgPaper";
            fs.mkdir(avgMid, { recursive: true }, (err) => {
              if (err) throw err;
            })
            var bestFinal = finalsfolder + "/" + "BestPaper";
            fs.mkdir(bestFinal, { recursive: true }, (err) => {
              if (err) throw err;
            })
            var worstFinal = finalsfolder + "/" + "WorstPaper";
            fs.mkdir(worstFinal, { recursive: true }, (err) => {
              if (err) throw err;
            })
            var avgFinal = finalsfolder + "/" + "AvgPaper";
            fs.mkdir(avgFinal, { recursive: true }, (err) => {
              if (err) throw err;
            })
            var lecturefolder = classfolder + "/" + "Lectures";
            fs.mkdir(lecturefolder, { recursive: true }, (err) => {
              if (err) throw err;
            });
          });
        });
        // console.log("Folders created");
        res.send(user);
      });
    }
  });
  // console.log(req.body.RegCrs);
  // let regCrs = req.body.RegCrs;
});

/*
   mailRoutes.route('/sendMail').post((req, res) => {
    console.log("request came");
    let name = req.body.Name;
    let email = req.body.Email;
    let pass = req.body.Password;
    const token = jwt.sign({name,email,pass}, "1234abc" , {expiresIn: '1d'});
          var USER = new Signup({
            Name :  name,
            Email : email,
            Password: pass,
            Token: token
        });
        USER.save((err,data) => {
            if(!err){
              sendMail(name, email, token , info => {
                console.log(`The mail has beed send 😃 and the id is ${info.messageId}`);
                res.send(info);
              });
              console.log("User saved");
               // res.send(data);
            }      
            else if (err){
              Signup.deleteOne({ Email: email }).then(function(){ 
                console.log("Data deleted"); // Success 
            }).catch(function(error){ 
                console.log(error); // Failure 
            }); 
                console.log("Error in saving the data "+JSON.stringify(err,undefined,2));
            } 
        });      
   });
 
  mailRoutes.route('/confirmation/:token').get((req, res) => {
    let token = req.params.token;
    var query  = Signup.where({ Token :  token }); 

   query.findOne( (err,user)=>{
      if(err) throw err;
      console.log(user.Email + user.Name);
     // res.send(user);
      jwt.verify(token,"1234abc",(err,decode)=>{
        if(err) {
          res.send("Activation link expired");
        }
        else if(!user){
          res.send("Activation expired");
        }
        else {
          console.log(user.Email);
          // user.Token = "";
          // user.Isconfirmed = true;
          var USER = new DETAILS ({
            Name :  user.Name,
            Email : user.Email,
            Password : user.Password
          });
        USER.save((err,data) => {
          if(!err){
            console.log("User saved");
            Signup.deleteOne({ Email: user.Email }).then(function(){ 
              console.log("Data deleted"); // Success 
          }).catch(function(error){ 
              console.log(error); // Failure 
          });
          }      
          else{
            console.log("Error in saving the data "+JSON.stringify(err,undefined,2));
          } 
        }); 
          console.log(user.Token);
          // user.save((err)=>{
          //         if(err){
          //           console.log(err);
          //         }
          //         else{
          //          return res.redirect('http://localhost:4200');
          //         }
          //       });
           //  ).then(user => {
      //      // res.json('Update complete');
      //      res.redirect('http://localhost:4200');
      //   }).catch(err => {
      //     res.status(400).send("unable to update the database");
      // });
        
      //   // (err)=>{
      //   //     if(err){
      //   //       console.log(err);
      //   //     }
      //   //     else{
      //   //       console.log("User updated successfully");
      //   //     }
      //   //   });
          
         }
       });
    });
   
  });
*/
module.exports = mailRoutes;