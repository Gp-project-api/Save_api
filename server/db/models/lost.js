const mongoose = require('mongoose');

const lost = mongoose.model('losts',{

    childname:{
        type:String,
        required:true,
        trim:true,
        index:true
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
    }
 

}) ;



module.exports = {Lost:lost}