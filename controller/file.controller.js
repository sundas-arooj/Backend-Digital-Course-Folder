const uploadFile = require("../Middleware/upload");
var fs = require('fs');


//single file upload
const upload = async (req, res) => {

  try {
     var dir=req.query.path;
     console.log(req.query.path);
  //    fs.mkdir(dir, { recursive: true }, (err) => {
  //     if (err) throw err;
  // })

    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {

    if (err.code == "LIMIT_FILE_SIZE") {
        return res.status(500).send({
          message: "File size cannot be larger than 2MB!",
        });
    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
}
};


//multiple files upload
const multipleUpload = async (req, res) => {
  try {
    await uploadFile(req, res);
    console.log(req.files);

    if (req.files.length <= 0) {
      return res.send(`You must select at least 1 file.`);
    }

    return res.send(`Files has been uploaded.`);
  } catch (error) {
    console.log(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
};



const getListFiles = (req, res) => {
  const dir =  __basedir +'/'+ req.query.path + '/';
  //console.log('reached at '+dir)

  fs.readdir(dir, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }
    else{
      let fileInfos = [];

      files.forEach((file) => {
        fileInfos.push({
          name: file,
          url: "http://localhost:4000/AUfolder/downloadfiles/",
        });
      });
  
      res.status(200).send(fileInfos);
    }  
  });
};

const download = (req, res) => {
  console.log(req.query.name);
  console.log(req.query.path);
  const fileName = req.query.name;
  const path = req.query.path;
  const directoryPath =__basedir +'/'+ path + '/';
  console.log(directoryPath);

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

module.exports = {
  upload,
  multipleUpload,
  getListFiles,
  download,
};