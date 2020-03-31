const mongoose = require('mongoose');

const lost = mongoose.model('losts',{

    childname:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        index:true
    },

    gender:{
      type:String,
      trim:true,
      required:true
    },

    age:{
        required:true,
        type:Number
    },

    city:{
        required:true,
        trim:true,
        type:String,
    },

    descreption:{
        type:String,
        required:true,
        trim:true
    },
    
    main_image:{
            type:String,
            trim:true,
            required:true
        },

    main_image_URL:{
            type:String,
            trim:true,
            required:true 
        },

 
    phone:{
        type:String,
        required:true
    },
 
    _creator:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
 
    time:{
        required:true,
        type:String,
        default:null
    },

    post_time:{
        type:String,
        required:true,
        trim:true,
        default:new Date().toISOString().slice(0,10)
    }
 

}) ;



module.exports = {Lost:lost}