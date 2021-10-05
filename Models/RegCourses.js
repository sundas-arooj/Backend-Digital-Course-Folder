const mongoose = require("mongoose");

const RegCourseSchema = new mongoose.Schema({
    CourseName:{
        type: String,
        required: true
    },
    Classes:[{
        type: String,
        required: true,
    }],
    CreditHrs:{
        type: Number,
        required: true
    }

});
const CoursesSchema = mongoose.model("RegCourse", RegCourseSchema);
module.exports = CoursesSchema; 