require('./config/config');
const express = require('express');
const fs = require('fs');
const mongoose = require('./db/mongoose');
const {User} = require('./db/models/users');
const {Lost} = require('./db/models/lost');
const {Found} = require('./db/models/found');
const path = require('path');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {authintcate} = require('./Middleware/authinticate');
const multer = require('multer');
const address =  require('os').networkInterfaces().wlp3s0[0].address;
var full_address;

// Uploading Images to uploads folder for Lost
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
        cb(null, './uploads')
        },
        filename: function (req, file, cb) {
        cb(null, + '-' + new Date().toISOString().slice(0,10) + file.originalname )
        }
    }) 
    var upload = multer({ storage: storage })
    

var app = express();
app.use(bodyParser.json());
app.use(express.static('uploads'))


// deafult 
app.get('/',(req,res) => {
    res.send('Hello')
})


// Signing up a new User
app.post('/register',(req,res) => {
    const body = _.pick(req.body,['Fname','Lname','phone','email','password']);
    var newUser = new User(body);
    newUser.save().then(() => {
        return newUser.generateAuthToken()
    }).then((token)=>{
        res.header('X-AUTH',token).status(200).send(newUser);
    }).catch((e) => {res.status(400).send(e)})
})

// signing in a registered user
app.post('/login',(req,res) => {
    var body = _.pick(req.body,['email','password']);
    User.findByCredintials(body.email,body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('X-AUTH',token).send(user);
        })
    }).catch((e) => {res.status(404).send(e)});
})


// Getting user profile data 
  app.get('/profile',authintcate,(req,res) => {
         res.send(req.user);
  })


  // logout a user

  app.delete('/logout',authintcate,(req,res) => {
     req.user.removeToken(req.token).then(() => {
          res.status(200).send()
      }).catch((e) => {res.status(404).send()})
  })


  // upload a lost one data

  app.post('/lost',authintcate,upload.single(""),(req,res) => {

    if(!req.file){
        res.status(400).send("No file uploaded")
    }else { 
        var lostOne = new Lost({
            childname:req.body.childname,
            Gender:req.body.Gender,
            phone:req.body.phone,
            _creator:req.user._id,
            time:new Date().toISOString().slice(0,10),
            image:[{
                main_image:req.file.path,
                main_image_URL:full_address+'/'+ path.basename(req.file.path)
            }]
          
          });
          
  
        lostOne.save().then((data) => {
            res.status(200).send(data);
        }).catch((e) => {res.status(400).send(e)})
  
        
    }

  })

  // upload a found child data

  app.post('/found',authintcate,upload.single(""),(req,res) => {

    if(!req.file){
        res.status(400).send("No file uploaded")
    }else { 
        var foundOne = new Found({
            childname:req.body.childname,
            Gender:req.body.Gender,
            phone:req.body.phone,
            _creator:req.user._id,
            time:new Date().toISOString().slice(0,10),
            image:[{
                main_image:req.file.path,
                main_image_URL:full_address+'/'+ path.basename(req.file.path)
            }] 
          });
          
  
        foundOne.save().then((data) => {
            res.status(200).send(data);
        }).catch((e) => {res.status(400).send(e)})
  
        
    }

  })
     



app.listen(process.env.PORT,address,(err) => {
    if(err){
        console.log(`an error occured: ${err}`);
    }else{
        full_address = `http://${address}:${process.env.PORT}`;
        console.log(full_address );
    }
})

module.exports = {app:app} 

