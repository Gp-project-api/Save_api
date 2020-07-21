const mongoose =  require('mongoose');
const LostThings = mongoose.model('Lost Things',{

    descreption:{
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
    type:{
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

module.exports = {LostThings}