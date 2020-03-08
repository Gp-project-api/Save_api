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

  

});

module.exports = {Accedints}