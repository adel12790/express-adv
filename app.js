var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var nconf = require('nconf');
var winston = require('winston');
//var nunjucks = require('nunjucks');
var app = express();
var ig = require('instagram-node').instagram();

ig.use({"client_id": "04e162fa873747c1a3eaa7e558e7b3a7",
        "client_secret": "bbf46bc2590a4d35bb4cc8ea3cdafe51"});

var redirect_uri = 'http://localhost:8000/handleauth';
 
exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
};
 
exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      res.send('You made it!!');
    }
  });
};

// This is where you would initially send users to authorize
app.get('/authorize_user', exports.authorize_user);
// This is your redirect URI
app.get('/handleauth', exports.handleauth);

ig.media_popular((err, media, limit) => {
  if(err) { throw err; }
  console.log(media);
});

require("winston-mail").Mail;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


// nunjucks.configure('views', {
//   autoescape: true,
//   express: app
// });

// config overrides all of the previous ones
// nconf.overrides({
//   "http": {
//     "port": 9000
//   }
// });

// command line option 
nconf.argv({
  'p': {
    'alias': 'http:port',
    'describe': 'The port to listen on'
  }
});
nconf.env("__");
nconf.file("config.json");
nconf.defaults({
  "http": {
    "port": 3000
  },
  "logger": {
    "fileLevel": "error"
  }
});

winston.add(winston.transports.File, {"filename": "error.log", "level": nconf.get("logger:fileLevel")});


// log error level or above to a file
winston.add(winston.transports.Mail, {
  "to": "adel12790@gmail.com",
  "host": "smtp.zoho.com",
  "port":"465",
  "username": "mohamed.adel@eye-ltd.com",
  "password": "zoho123@@",
  "level": "error"
});

//winston.error("Something went wrong!");

// profile a piece of code in milliseconds.
// winston.profile("test");
// setTimeout(() => {
//   winston.profile("test");
// }, 1000);



winston.info('Initialised nconf');
winston.info('HTTP config: ', nconf.get("http"));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
