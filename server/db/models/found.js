const mongoose = require('mongoose');

const Found  = mongoose.model('Found',{
    gender:{
        type:String,
        required:true,
        index:true
       },
      
    age:{
        type:Number
    },

    descreption:{
        type:String,
        required:true,
        trim:true
    },

    city:{
        required:true,
        trim:true,
        type:String,
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
    

    name:{
        type:String,
        trim:true,
        required:true
    },

    phone:{
        type:String,
        trim:true,
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
        default:new Date().toISOString().slice(0,10)
    },
    
    ban:{
        type:Number,
        max:5,
        default:0,
        required:true,
    }
});

module.exports={Found:Found};
