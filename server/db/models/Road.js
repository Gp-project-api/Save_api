const mongoose =  require('mongoose');
const Accedints = mongoose.model('Road Accedints',{

    information:{
        type:String,
        trim:true,
        required:true
    },
    _creator:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    city:{
        type:String,
        trim:true,
        required:true
    },
    street:{
        type:String,
        trim:true,
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
    
    ban:{
        type:Number,
        default:0,
        required:true,
        max:5
    }

  

});

module.exports = {Accedints}