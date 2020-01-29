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
const {ObjectId} = require('mongodb');
const {authintcate} = require('./Middleware/authinticate');
const multer = require('multer');
const fr = require('face-recognition');
const recognizer = fr.FaceRecognizer();
const address =  require('os').networkInterfaces().wlp3s0[0].address;
var full_address;

// Uploading Images to uploads folder for Lost
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
        cb(null, './uploads')
        },
        filename: function (req, file, cb) {
        cb(null,  + new Date().toISOString().slice(0,10) + file.originalname )
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
            main_image:req.file.path,
            main_image_URL:full_address+'/'+ path.basename(req.file.path)
        
          
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
            main_image:req.file.path,
            main_image_URL:full_address+'/'+ path.basename(req.file.path) 
          });
          
  
        foundOne.save().then((data) => {
            res.status(200).send(data);
        }).catch((e) => {res.status(400).send(e)})   
     }
  });

  // Search for a Lost child,(if any one upload his,her data)

  app.post('/LostSearch/:gender',authintcate,upload.single(""),(req,res)=>{
    if(!req.file)
      res.send("No file Uploaded") 

    var path = req.file.path;
    var search_image = fr.loadImage(`./${path}`);

    Lost.find({Gender:req.params.gender}).then((data) => {
      var childs = data.map(child =>({
          name:child.childname,
          img:child.main_image
      }));
      childs.forEach(child => {
          var img_path = child.img;
          var image = fr.loadImage(`./${img_path}`);
          var face = [image]
          recognizer.addFaces(face,child.name)
      });
      
      const predictions = recognizer.predict(search_image);
      const accurate_predictions = predictions.filter((dis) => {return dis.distance < 0.3}); 
       
       if(accurate_predictions.length === 0){
           res.status(200).send("Not found")
       }else{
           var names = accurate_predictions.map(name => name.className);
           console.log(names);
             Lost.find({childname:{$in:names}}).then((C_data) => {
                 console.log(C_data);
                 res.status(200).send(C_data)
             }).catch((e) => {res.send(e)});
       }

      }).catch((e) => {res.status(400).send(e)})    
      
  });


  // Search for a Found child,(if any one found him and upload his,her data)

  app.post('/FoundSearch/:gender',authintcate,upload.single(""),(req,res)=>{
    if(!req.file)
      res.send("No file Uploaded") 

    var path = req.file.path;
    var search_image = fr.loadImage(`./${path}`);

    Found.find({Gender:req.params.gender}).then((data) => {
      var childs = data.map(child =>({
          name:child.childname,
          img:child.main_image
      }));
      childs.forEach(child => {
          var img_path = child.img;
          var image = fr.loadImage(`./${img_path}`);
          var face = [image]
          recognizer.addFaces(face,child.name)
      });
      
      const predictions = recognizer.predict(search_image);
      const accurate_predictions = predictions.filter((dis) => {return dis.distance < 0.3}); 
       
       if(accurate_predictions.length === 0){
           res.status(200).send("Not found")
       }else{
           var names = accurate_predictions.map(name => name.className);
           console.log(names);
             Found.find({childname:{$in:names}}).then((C_data) => {
                 console.log(C_data);
                 res.status(200).send(C_data)
             }).catch((e) => {res.send(e)});
       }

      }).catch((e) => {res.status(400).send(e)})    
      
  });

  // Request for getting a user LostPosts

  app.get('/LostPosts',authintcate,(req,res) => {
      var id = req.user._id;
      Lost.find({_creator:id}).then((data) => {
           if(data.length === 0){
               res.status(404).send("No Posts found")
           }else{
               res.status(200).send(data)
           }
           
      }).catch((e) => {res.status(400).send(e)})
  });

  // Request for getting a user FoundPosts

  app.get('/FoundPosts',authintcate,(req,res) => {
    var id = req.user._id;
    Found.find({_creator:id}).then((data) => {
         if(data.length === 0){
             res.status(404).send("No Posts found")
         }else{
             res.status(200).send(data)
         }
         
    }).catch((e) => {res.status(400).send(e)})
});


//Request for deleting a LostPost

app.delete('/LostPost/:id',authintcate,(req,res) => {
    var id  = req.params.id
    if(!ObjectId.isValid(id)){
        return res.status(404).send("ID not Valid")
    }
   Lost.findOneAndDelete({_id:id , _creator:req.user.id}).then((data) => {
       if(!data){
           return res.status(404).send("No data Found");
       }
       res.status(200).send(data);
   }).catch((e) => {res.status(400).send(e)});
});
     
//Request for deleting a FoundPost

app.delete('/FoundPost/:id',authintcate,(req,res) => {
    var id  = req.params.id
    if(!ObjectId.isValid(id)){
        return res.status(404).send("ID not Valid")
    }
   Found.findOneAndDelete({_id:id , _creator:req.user.id}).then((data) => {
       if(!data){
           return res.status(404).send("No data Found");
       }
       res.status(200).send(data);
   }).catch((e) => {res.status(400).send(e)});
});
     



app.listen(process.env.PORT,address,(err) => {
    if(err){
        console.log(`an error occured: ${err}`);
    }else{
        full_address = `http://${address}:${process.env.PORT}`;
        console.log(full_address );
    }
})

module.exports = {app:app} 

