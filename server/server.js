require('./config/config');
const express = require('express');
const mongoose = require('./db/mongoose');
const {User} = require('./db/models/users');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {authintcate} = require('./Middleware/authinticate');

var app = express();
app.use(bodyParser.json()); 

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
     



app.listen(process.env.PORT,(err) => {
    if(err){
        console.log(`an error occured: ${err}`);
    }else{
        console.log('server started with URL: localhost:3000');
    }
})

