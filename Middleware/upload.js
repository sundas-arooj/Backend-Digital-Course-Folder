const util = require("util");
const multer = require("multer");
const path = require('path')
const { copySync } = require('fs-extra');
const maxSize = 2 * 1024 * 1024;
const fs = require('fs');

const storage = multer.diskStorage({    
  destination: (req, file, cb)  => {
   fs.access( __basedir + '/' +req.query.path+ '/', function(error) {
      if (error) {
        console.log("Directory does not exist.")
      } else {
        cb(null, __basedir + '/' +req.query.path+ '/');
      }
    }) 
  },
  filename: (req, file, cb) => {
    //single file
    fs.access( __basedir + '/' +req.query.path+ '/', function(error) {
      if (error) {
        console.log("Directory does not exist.")
      } else {
        fileExtension = file.originalname.substr((file.originalname.lastIndexOf('.') + 1));
        files = fs.readdirSync(__basedir + '/' +req.query.path+ '/');
        var name = req.query.path.match(/([^\/]*)\/*$/)[1];
        var fileName=name+' '+(files.length+1)+'.'+fileExtension;
        console.log(fileName);
        cb(null, fileName); 
         //multiple files
        // var filename = file.originalname;
        // cb(null, filename);
      }
    }) 
  }
});
//single file

let uploadFile = multer({
  storage: storage,
  // limits: { fileSize: maxSize },
}).single("file");

//multiple files

// let uploadFile = multer({
//   storage: storage
// }).array("multi-files", 10)

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;