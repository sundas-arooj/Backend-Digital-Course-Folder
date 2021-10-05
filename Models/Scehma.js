const mongoose = require("mongoose");

const CourseReg = new mongoose.Schema({
    IsRegistration:{
        type: Boolean
    },
    SemesterName:{
        type: String
    }
});
const StartRegSchema = mongoose.model("StartCrsReg", CourseReg);
module.exports = StartRegSchema; 
// const mongoose = require("mongoose");

// const signupSchema = new mongoose.Schema({
//     Name:{
//         type: String,
//         required: true
//     },
//     Email:{
//         type: String,
//         required: true,
//       //  unique: true
//     },
//     Password:{
//         type: String,
//         required: true
//     },
//     Token:{
//         type: String
//       //  required:true
//     }
// });
// signupSchema.index( { "createdAt": 1 }, { expireAfterSeconds: 100 } );
// const SignupSchema = mongoose.model("User", signupSchema);
// //SignupSchema.index( { "createdAt": 1 }, { expireAfterSeconds: 100 } );
// module.exports = SignupSchema; 

// const semesterSchema = new mongoose.Schema({
//     Email:{
//         type: String,
//         required: true
//     },
//     Class:{
//         type: String,
//         required: true
//     },
//     Course:{
//         type: String,
//         required: true
//     }
// });

// const SemesterSchema = mongoose.model("Semester", semesterSchema);
// module.exports = SemesterSchema; 