const mongoose = require('mongoose');
const valiator = require('validator');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema({
        Fname:{
            type:String,
            required:true,
            trim:true
        },

        Lname:{
            type:String,
            required:true,
            trim:true
        },

        phone:{
            type:String,
            required:true,
        },

        trusted1:{
            type:String,
        },

        trusted2:{
            type:String,
        },

        trusted3:{
            type:String,
        },
        
        email:{
            type:String,
            required:true,
            trim:true,
            unique:true,
            validate:{
                validator: (value) => {
                        return valiator.isEmail(value)
                },
                    message: '{VALUE} is not a valid email'
                },
        },

        password:{
            type:String,
            required:true,
            minlength:5
            
        },

        tokens: [{
            access: {
                type:String,
                required:true
            },
            token:{
                type:String,
                required:true
            }
        }]
});
// Model methods

    UserSchema.statics.findByCredintials = function(email,pass){
        var user = this;
      return  user.findOne({email}).then((user) => {
            if(!user){
                return Promise.reject();
            }
            return new Promise((resolve,reject)=>{
                bcrypt.compare(pass,user.password,(err,res) => {
                  if(res){
                    resolve(user);
                  }else{
                    reject();
                  }
                })
              })
        })
        
    };

    UserSchema.statics.findByToken = function(token){
        var user = this;
        var decoded;
        try{
            decoded = JWT.verify(token,process.env.JWT_SECRETE);
        }
        catch(e){
            console.log(e);
            return Promise.reject();
        }
        return user.findOne({
         '_id':decoded._id,
         'tokens.token': token,
         'tokens.access':'auth'
        });
    };




// instance methods

        UserSchema.methods.generateAuthToken = function(){
            var user=this;
            var access = 'auth';
            var token = JWT.sign({ _id:user._id, access:access },process.env.JWT_SECRETE);
            user.tokens.push({
                access:access,
                token:token
            });
           return user.save().then(() => {
               return token;
           });
            
        }


        UserSchema.methods.removeToken = function(token){
            var user=this;
           return  user.updateOne({
                $pull: {
                    tokens: {
                        token:token
                    }
                }
            })
        }


        UserSchema.pre('save',function(next)  {
            var user = this;
            if(user.isModified('password')){
                bcrypt.genSalt(10,(err,salt) => {
                    bcrypt.hash(user.password,salt,(err,hash) => {
                        user.password = hash;
                        next();
                    });
                })
            }else{
                next();
            }
        });

 const user = mongoose.model('users',UserSchema);
 module.exports = {User:user}