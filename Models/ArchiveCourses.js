const mongoose = require("mongoose");

const ArchCourseSchema = new mongoose.Schema({
        SemesterName:{
            type: String,
        },
        Courses:[{
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
        }]
   // }]
});
const ACoursesSchema = mongoose.model("ArchiveCourses", ArchCourseSchema);
module.exports = ACoursesSchema; 