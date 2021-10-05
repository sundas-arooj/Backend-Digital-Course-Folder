const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    eventDate:{
        type: String,
        required: true,
    },
    eventCreator:{
        type: String,
        required:true,
    },
    eventTitle:{
        type: String,
        required: true,
    },

});

const getUserEvents = new mongoose.Schema([{
    eventDate:{
        type: String,
        required: true,
    },
    eventCreator:{
        type: String,
        required:true,
    },
    eventTitle:{
        type: String,
        required: true,
    },

}]);

const EventSchema = mongoose.model("userEvents", eventSchema);
const GetEventSchema = mongoose.model("getUserEvents", getUserEvents);
//SignupSchema.index( { "createdAt": 1 }, { expireAfterSeconds: 100 } );
module.exports = EventSchema, GetEventSchema;