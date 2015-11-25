require('dotenv').config({silent: true});
var express = require("express"),
bodyParser = require("body-parser"),
methodOverride = require("method-override"),
http = require('http'),
https = require('https'),
app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());

app.set('port', (process.env.PORT || 8000));
app.use(express.static(__dirname + '/app'));
app.set('view engine', 'ejs');


var validator = require('validator');

var Firebase = require("firebase");
var ref = new Firebase(process.env.FB_URL.toString());
var email = process.env.FB_USER.toString();
var password = process.env.FB_PASSWORD.toString();
ref.authWithPassword({
  email    : email,
  password : password
}, function(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Server Admin successfully logged into Firebase");
  }
});  

app.get('/', function(req, res) {
  res.render('index');
});

app.post('/createUser', function(req, res) {
   ref.createUser({
     email    : req.body.email,
     password : req.body.password
   }, function(error, userData) {
     if (error) {
       console.log("Error creating user:", error);
       return false;
     } else {
       console.log("Successfully created user account with uid:", userData.uid);
       ref.child('users').child(userData.uid).update({
         admin:false,
         active: true,
         deleted: false,
         email: req.body.email,
         lastLoggedIn: new Date(),
         lastModified: new Date(),
         uid: userData.uid
       });
       res.redirect('/#/users/account');
     }
   });        
});

app.post('/changeEmail', function(req, res) {
   ref.changeEmail({
     oldEmail : req.body.oldEmail,
     newEmail : req.body.newEmail,
     password : req.body.password
   }, function(error) {
     if (error === null) {
       console.log("Email changed successfully");
       ref.child('users').child(req.body.uid).update({
         email: req.body.newEmail
       });
      return true;
     } else {
       console.log("Error changing email:", error);
       return false;
     }
   });
});

app.post('/changePassword', function(req, res) {
   ref.changePassword({
     email       : req.body.email,
     oldPassword : req.body.oldPassword,
     newPassword : req.body.newPassword
   }, function(error) {
     if (error === null) {
       console.log("Password changed successfully");
       ref.child('users').child(req.body.uid).update({
         lastModified: new Date()
       });
       return true;
     } else {
       console.log("Error changing password:", error);
       return false;
     }
   });    
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});