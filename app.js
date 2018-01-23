const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const passport = require('./modules/passport');
const index = require('./routes/index');
const api = require('./routes/api');

const app = express();

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

let sessionSecret;
if (process.env.NODE_ENV) { // Running on production server
	let SECRETS = process.env; // Configureation is stored on process environment
	sessionSecret = SECRETS.SESSION_SECRET;
} else { // Running on local machine
	var SECRETS = require('./config');
  sessionSecret = SECRETS.SESSION.SESSION_SECRET;
}

// set up sessions
app.use(session({
	secret: sessionSecret,
	resave: 'false',
	saveUninitialized: 'true'
}));

// hook up passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/api', api);

// authentication routes
app.get('/auth/mitopenid', passport.authenticate('mitopenid'));

// authentication callback routes
app.get('/auth/mitopenid/callback', passport.authenticate('mitopenid', {
	successRedirect: '/home',
	failureRedirect: '/'
}));

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
