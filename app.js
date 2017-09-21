var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport')
var FacebookStrategy = require('passport-facebook')
var session = require('express-session')
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
app.use(session({
  secret: 'secret',
  resave: true,
  saveUnitialized: true
}))
app.use(passport.session())

app.use('/', index)
app.use('/users', users)

passport.serializeUser(function(user, done) {
  console.log('serialize');
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log('deserializing ***************************************************',obj)
  done(null, obj)
})

var User = {
  findOrCreate: function({facebookId, profile}){
    return new Promise((resolve, reject) => {
      if(facebookId) {
        console.log('******************* resolving ****************', profile)
        resolve(facebookId)
      } else {
        console.log('******************* rejected ******************')
        const error = {'rejected': 'error'}
        resolve(error)
      }
    })
  },
  findById: function(id){
    return new Promise((resolve, reject) => {
      if(id){
        console.log('deserializeUser',id);
        resolve(true)
      } else {
        console.log('rejected');
        reject({name:'deserializeUser error'})
      }
    })
  }
}

const fbOptions = {
    clientID: process.env.fbId,
    clientSecret: process.env.fbSecret,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    scope: ['email', 'public_profile'],
    profileFields: ['email', 'gender', 'displayName'],
    passReqToCallback: true
  }

function fbCallback(req, accessToken, refreshToken, profile, cb) {
  console.log({req: req.session, accessToken, refreshToken, profile, cb})
  return cb(null, profile)
  User.findOrCreate({ facebookId: profile.id , profile: profile}, (err, user) => {
    console.log('soemthing happned after findOrCreate!!!!!~!!!!!!!!!');
    if(err) {
      console.log('there was an error', err);
    } else {
      console.log('***** user ******', user);
      return cb(null, profile)
    }
})
}
passport.use(new FacebookStrategy(fbOptions, fbCallback))

app.get('/auth/facebook',
  passport.authenticate('facebook',{scope: ['email', 'public_profile'],session: true
}))

app.get('/auth/facebook/callback',(req, res, next) =>  {
  passport.authenticate('facebook',{
    scope: ['email', 'public_profile'],
    session: true,
    failureRedirect: '/',
    failureFlash:true },
    (err, user, info) =>  {
      console.log('user', user, 'info',info);
      // Successful authentication, redirect home.
      console.log('**************** success in /callback ***********************')

    res.redirect('/success')
  })(req, res, next)

})
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
