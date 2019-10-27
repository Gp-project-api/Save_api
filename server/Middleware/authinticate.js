const {User} = require('./../db/models/users');
var authintcate = (req,res,next) => { 
    var token  = req.header('X-AUTH');  
    User.findByToken(token).then((user) => {
        if(!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {res.status(401).send(e)});
  };
  module.exports = {authintcate};