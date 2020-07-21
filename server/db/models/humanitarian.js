const mongoose = require("mongoose");
const humanitrianSchema = new mongoose.Schema({
    descreption:{
        type:String,
        required:true,
        trim:true
    },
    phone:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        required:true
    },

    photo_URL:{
        type:String,
        required:true
    },
    
    city:{
        type:String,
        required:true,
        trim:true
    },
    _creator:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
});
const humanitrian = mongoose.model('humanitrian',humanitrianSchema);
module.exports = {Humanitrain:humanitrian};