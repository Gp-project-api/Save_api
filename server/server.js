require('./config/config');
const express = require('express');
const fs = require('fs');
const mongoose = require('./db/mongoose');
const {User} = require('./db/models/users');
const {Lost} = require('./db/models/lost');
const {Found} = require('./db/models/found');
const {Accedints} =  require('./db/models/Road');
const {Humanitrain} = require('./db/models/humanitarian');
const {LostThings} = require('./db/models/lostthings');
const path = require('path');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');
const {authintcate} = require('./Middleware/authinticate');
const multer = require('multer');
const fr = require('face-recognition');
const recognizer = fr.FaceRecognizer();
const alladdress = require('os').networkInterfaces();
const address = alladdress['vEthernet (Internal Ethernet Port Windows Phone Emulator Internal Switch)'][1].address;
var full_address;
const os = require('os');

console.log(os.platform());

// Uploading Images to uploads folder for Lost
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
        cb(null, './uploads')
        },
        filename: function (req, file, cb) {
        cb(null,file.originalname )
        }
    }) 
    var upload = multer({ storage: storage })
    

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./uploads'));
app.use(function (req, res, next) {
    // Website you wish to allow to connect 
    res.setHeader('Access-Control-Allow-Origin', '*');
  
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization,X-AUTH');
   
    // Request headers credintials you wish to allow
     res.setHeader('Access-Control-Allow-Credentials', true)
      next();
  });


// deafult 
app.get('/',(req,res) => {
    res.send('Hello')
})

app.post('/image',upload.single(""),(req,res) => {
  if(!req.file)
   res.status(400).send("no file ya hesham")
    res.status(200).send(req.file)
})



    app.post('/register',(req,res) => {
        const body = _.pick(req.body,['Fname','Lname','phone','email','password']);
        var newUser = new User(body);
        newUser.save().then(() => {
            return newUser.generateAuthToken()
        }).then((token)=>{
            res.header('X-AUTH',token).status(200).send(newUser);
        }).catch((e) => {res.status(400).send(e)})
    })


    app.post('/login',(req,res) => {
        var body = _.pick(req.body,['email','password']);
        User.findByCredintials(body.email,body.password).then((user) => {
            return user.generateAuthToken().then((token) => {
                res.header('X-AUTH',token).send(user);
            })
        }).catch((e) => {res.status(404).send(e)});
    })


    app.get('/profile',authintcate,(req,res) => {
            res.send(req.user);
    })


    app.post('/editProfile',authintcate,(req,res) => {
        var body = _.pick(req.body,['Fname','Lname','email','password','phone','trusted1','trusted2','trusted3','address','bloodType']);
        User.findOneAndUpdate({_id:req.user._id},{$set:body},{new: true}).then((updated_usr) => {
            if(!updated_usr)
            res.status(404).send()
            res.status(200).send(updated_usr);
        }).catch((e) => {res.status(400).send(e)})
    })


    app.get('/user/:id',authintcate,(req,res) => {
        var id = req.params.id;
        if(!ObjectId.isValid(id)){
            res.status(400).send("id not valid");
        }
        User.findOne({_id:id}).then((usr) => {
            if(!usr){
                res.status(404).send();
            }
            res.status(200).send(usr);
        }).catch((e)=>{res.status(400).send()})
    })


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
            gender:req.body.gender,
            phone:req.body.phone,
            _creator:req.user._id,
            city:req.body.city,
            age:req.body.age,
            descreption:req.body.descreption,
            time:req.body.time,
            main_image:req.file.path,
            main_image_URL:full_address+'/'+ path.basename(req.file.path)
          
          });
          
  
        lostOne.save().then((data) => {
            res.status(200).send(data);
        }).catch((e) => {res.status(400).send(e)})
  
        
    }

  })

  // Search for a Lost child,(if any one upload his,her data)
  app.post('/LostSearch/:gender',authintcate,upload.single(""),(req,res)=>{
    if(!req.file)
      res.send("No file ") 

    var path = req.file.path;
    console.log(path);
    var search_image = fr.loadImage(`./${path}`);

    Lost.find({gender:req.params.gender}).then((data) => {
        if(data.length === 0){
            res.status(404).send('No childs with this gender right now')
        }
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
      console.log(predictions);
      const accurate_predictions = predictions.filter((dis) => {return dis.distance < 0.3}); 
       
       if(accurate_predictions.length === 0){
           res.status(200).send("Not found")
       }else{
           var names = accurate_predictions.map(name => name.className);
           console.log(names);
             Lost.find({childname:{$in:names}}).then((C_data) => {
                 console.log(C_data);
                 res.status(200).send(C_data)
             }).catch((e) => {res.status(400).send('did it')});
       }

      }).catch((e) => {res.status(400).send('did not')})    
      
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

  // Request for getting all lost posts for timeline
  app.get('/allLostPosts',authintcate,(req,res) => {
    Lost.find().then((data) => {
        res.status(200).send(data);
    }).catch((e) => {res.status(404).send(e)});
});

  // Request for updating a lost post data
  app.post('/editLostPost/:id',authintcate,(req,res) => {
    var id = req.user._id,
        post_id = req.params.id,
        body = _.pick(req.body,['childname','gender','age','city','descreption','phone','time']);

        if(! ObjectId.isValid(post_id)){
        res.status(404).send();
    }
    Lost.findOneAndUpdate({_id:post_id,_creator:id},{$set:body},{new:true}).then((result) => {
        if(!result){
            res.status(404).send();
        }
        res.status(200).send(result);
    }).catch((e) => {res.status(400).send(e)});

});

 // Request for updating a lost post image
 app.post('/editLostPostImage/:id',authintcate,upload.single(""),(req,res) => {
    var id = req.params.id,
        user_id = req.user._id;
    if(!ObjectId.isValid(id)){
            res.status(404).send();
        }
    if(!req.file){
            res.status(404).send();
        }
    Lost.findOneAndUpdate({_id:id,_creator:user_id},{$set:{
        main_image:req.file.path,
        main_image_URL:full_address+'/'+ path.basename(req.file.path)
    }},
    {new:true}
    ).then((data) => {
        res.status(200).send(data);
    }).catch((e) => {res.status(400).send(e)})
});

 // Request for banning a lost post
 app.patch('/banLostPost/:id',authintcate,(req,res) => {
    var id = req.params.id;
    if(!ObjectId.isValid(id)){
        res.status(404).send();
    }
    Lost.findOneAndUpdate({_id:id},{$inc:{ban:1}},{new:true}).then((data) => {
            if(!data){
                res.status(404).send();
            }
        res.status(200).send(data);
    }).catch((e) => {res.status(400).send(e)});
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


  // upload a found child data
  app.post('/found',authintcate,upload.single(""),(req,res) => {

    if(!req.file){
        res.status(400).send("No file uploaded")
    }else { 
        var foundOne = new Found({
            name:req.body.name,
            gender:req.body.gender,
            age:req.body.age,
            city:req.body.city,
            descreption:req.body.descreption,
            phone:req.body.phone,
            _creator:req.user._id,
            time:req.body.time,
            main_image:req.file.path,
            main_image_URL:full_address+'/'+ path.basename(req.file.path) 
          });
          
  
        foundOne.save().then((data) => {
            res.status(200).send(data);
        }).catch((e) => {res.status(400).send(e)})   
     }
  });

  // Search for a Found child,(if any one found him and upload his,her data)
  app.post('/FoundSearch/:gender',authintcate,upload.single(""),(req,res)=>{
    if(!req.file)
      res.send("No file Uploaded") 

    var path = req.file.path;
    var search_image = fr.loadImage(`./${path}`);

    Found.find({gender:req.params.gender}).then((data) => {
        if(data.length === 0){
            res.status(404).send('No childs with this gender right now')
        }
      var childs = data.map(child =>({
          name:child.name,
          img:child.main_image
      }));
      childs.forEach(child => {
          var img_path = child.img;
          var image = fr.loadImage(`./${img_path}`);
          var face = [image]
          recognizer.addFaces(face,child.name)
      });
      
      const predictions = recognizer.predict(search_image);
      console.log(predictions);
      const accurate_predictions = predictions.filter((dis) => {return dis.distance < 0.3}); 
       
       if(accurate_predictions.length === 0){
           res.status(200).send("Not found")
       }else{
           var names = accurate_predictions.map(name => name.className);
           console.log(names);
             Found.find({name:{$in:names}}).then((C_data) => {
                 console.log(C_data);
                 res.status(200).send(C_data)
             }).catch((e) => {res.send(e)});
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

   // Request for getting all found posts for timeline
 app.get('/allFoundPosts',authintcate,(req,res) => {
        Found.find().then((data) => {
            res.status(200).send(data);
        }).catch((e) => {res.status(404).send(e)});
    });

    // Request for updating a found post data
 app.post('/editFoundPost/:id',authintcate,(req,res) => {
        var id = req.user._id,
            post_id = req.params.id,
            body = _.pick(req.body,['gender','age','descreption','city','name','phone','time']);
    
            if(! ObjectId.isValid(post_id)){
            res.status(404).send();
        }
        Found.findOneAndUpdate({_id:post_id,_creator:id},{$set:body},{new:true}).then((result) => {
            if(!result){
                res.status(404).send();
            }
            res.status(200).send(result);
        }).catch((e) => {res.status(400).send(e)});

    });

 // Request for updating a found post image
 app.post('/editFoundPostImage/:id',upload.single(""),authintcate,(req,res) => {
     if(!req.file){
            res.status(404).send();
        }
    var id = req.params.id,
        user_id = req.user._id;
    if(!ObjectId.isValid(id)){
            res.status(404).send();
        }
    Found.findOneAndUpdate({_id:id,_creator:user_id},{$set:{
        main_image:req.file.path,
        main_image_URL:full_address+'/'+ path.basename(req.file.path)
       }},
       {
        new:true
       }
    ).then((data) => {
        res.status(200).send(data);
    }).catch((e) => {res.status(400).send(e)})
});
  
  // Request for banning a found post
  app.patch('/banFoundPost/:id',authintcate,(req,res) => {
    var id = req.params.id;
    if(!ObjectId.isValid(id)){
        res.status(404).send();
    }
    Found.findOneAndUpdate({_id:id},{$inc:{ban:1}},{new:true}).then((data) => {
            if(!data){
                res.status(404).send();
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

// Request for posting a Road accedint

app.post('/RoadAccedint',authintcate,upload.array('',4),(req,res) => {
            if(req.files.length <=0){
            res.status(400).send("please upload photos");
        }else{
            const files = req.files;
            console.log(files);
            var data = files.map(p => ({img:p.path,url:full_address+'/'+ path.basename(p.path)}));
            var pahtes = data.map(e => e.img).join("|");
            var urlPathes = data.map(e => e.url).join("|");
            var acc = new Accedints({
                information:req.body.information,
                _creator:req.user._id,
                city:req.body.city,
                street:req.body.street,
                photo:pahtes,
                photo_URL:urlPathes
            
            });
        acc.save().then((data) => {
            res.status(200).send(data);
        }).catch((e) => {res.status(400).send(e)});
        }
    });

    // Get request for getting acccedints
app.get('/RoadAccedint',authintcate,(req,res) => {
        Accedints.find().then((data) => {
            if(!data)
            res.status(404).send("No Posts yet")

            res.status(200).send(data);
        }).catch((e) => {res.status(400).send(e)})
    });

    // post Humantirian post
 app.post('/humanstatus',authintcate,upload.array('',4),(req,res) => {
    if(req.files.length == 0){
        res.status(404).send();
    }else{
    var files = req.files;
    var data = files.map(p => ({img:p.path,url:full_address+'/'+ path.basename(p.path)}));
    var pahtes = data.map(e => e.img).join("|");
    var urlPathes = data.map(e => e.url).join("|");
    var humanstatus = new Humanitrain({
        descreption:req.body.descreption,
        phone:req.body.phone,
        city:req.body.city,
        photo:pahtes,
        photo_URL:urlPathes,
        _creator:req.user._id
    });
    humanstatus.save().then((data) => {
        res.status(200).send(data);
    }).catch((e) => {res.status(400).send(e)});
  }
 });

     //get humatrain posts

    app.get('/humanstatus',authintcate,(req,res) => {
        Humanitrain.find().then((data) => {
            if(!data){
                res.status(404).send();
            }
            res.status(200).send(data);
        }).catch((e) => {res.status(400).send(e)});
    });

      // get my humantrain posts

      app.get('/myhumanstatus',authintcate,(req,res) => {
          var id = req.user._id;
        Humanitrain.find({_creator:id}).then((data) => {
            if(!data){
                res.status(404).send();
            }
            res.status(200).send(data);
        }).catch((e) => {res.status(400).send(e)});
    });

       // get humantrain post by id

       app.get('/myhumanstatus/:id',authintcate,(req,res) => {
        var id = req.params.id;
      Humanitrain.find({_id:id}).then((data) => {
          if(!data){
              res.status(404).send();
          }
          res.status(200).send(data);
      }).catch((e) => {res.status(400).send(e)});
  });

  // post lostthings posts

   app.post('/lostthings',authintcate,upload.array('',4),(req,res) => {
    if(req.files.length == 0){
        res.status(404).send();
    }else{
    var files = req.files;
    var data = files.map(p => ({img:p.path,url:full_address+'/'+ path.basename(p.path)}));
    var pahtes = data.map(e => e.img).join("|");
    var urlPathes = data.map(e => e.url).join("|");
    var lostthing = new LostThings({
        descreption:req.body.descreption,
        phone:req.body.phone,
        city:req.body.city,
        type:req.body.type,
        photo:pahtes,
        photo_URL:urlPathes,
        _creator:req.user._id
    });
    lostthing.save().then((data) => {
        console.log(data);
        res.status(200).send(data);
    }).catch((e) => {res.status(400).send(e)});
   }
});

  // get lostthings posts

  app.get('/lostthings',authintcate,(req,res) => {
    LostThings.find().then((data) => {
        if(data.length == 0){
            res.status(404).send();
        }
        res.status(200).send(data);
    }).catch((e) => {res.status(400).send(e)});
});

   // get my Lost thing post
   app.get('/mylostthing',authintcate,(req,res) => {
    var id = req.user._id;
  LostThings.find({_creator:id}).then((data) => {
      if(!data){
          res.status(404).send();
      }
      res.status(200).send(data);
  }).catch((e) => {res.status(400).send(e)});
});

  // get lostthing post by id

  app.get('/lostthing/:id',authintcate,(req,res) => {
    var id = req.params.id;
  LostThings.find({_id:id}).then((data) => {
      if(!data){
          res.status(404).send();
      }
      res.status(200).send(data);
  }).catch((e) => {res.status(400).send(e)});
});



app.listen(process.env.PORT,address,(err) => {
    if(err){
        console.log(`an error occured: ${err}`);
    }else{
        full_address = `http://${address}:${process.env.PORT}`;
        console.log(full_address);
    }
})

module.exports = {app:app} 

