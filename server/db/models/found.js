const mongoose = require('mongoose');

const Found  = mongoose.model('Found',{
    Gender:{
        type:String,
        required:true,
        index:true
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
    

    childname:{
        type:String,
        trim:true
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
    }
});

module.exports={Found:Found};
