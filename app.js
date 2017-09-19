var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport')
var FacebookStrategy = require('passport-facebook')
require('dotenv').config()

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize())
app.use(passport.session())

app.use('/', index)
app.use('/users', users)
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user)
});
passport.use(new FacebookStrategy({
    clientID: process.env.fbId,
    clientSecret: process.env.fbSecret,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    scope: ['email', 'public_profile'],
    profileFields: ['email', 'gender']
  },
  (accessToken, refreshToken, profile, cb) => {
    console.log({accessToken,refreshToken,profile,cb})
    User.findOrCreate({ facebookId: profile.id , profile: profile}, (err, user) => {
      console.log('***** user ******', user);
      return cb(null, user)
    })
  }))


var User = {
  findOrCreate: function({facebookId, profile}){
    return new Promise((resolve, reject) => {
      if(facebookId) {
        console.log('******************* successs **************************************************', profile)
        resolve(profile)
      } else {
        console.log('******************* rejected **************************************************')
        const error = {'rejected': 'error'}
        reject(error)
      }
    })
  },
  findById: function(id){
    return new Promise((resolve, reject) => {
      if(id){
        console.log('deserializeUser',id);
        resolve(true)
      } else {
        reject({name:'deserializeUser error'})
      }
    })
  }
}
app.get('/auth/facebook',
  passport.authenticate('facebook'),(req, res)=> {
    console.log('hit first auth')
  });

app.get('/auth/facebook/callback',
  passport.authenticate('facebook',{scope: ['email', 'public_profile']}, { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log('**************** success in /callback ***********************');

    res.redirect('/success');
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
