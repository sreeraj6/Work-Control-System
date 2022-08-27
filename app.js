var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db =require('./config/connection')
var hbs = require('express-handlebars')
var userRouter = require('./routes/user');
var staffRouter = require('./routes/staff');
var adminRouter = require('./routes/admin');
var session = require('express-session');
var app = express();


// database connection
db.connect((err)=>{
  if(err) console.log("connection error occured"+err);
  else console.log("Database connected");
})

//session manage
app.use(session({
  secret: 'secret key',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 6000000}
}))

// view engine setup
app.engine('hbs',hbs.engine({
  helpers: {
  inc: function (value, options) {
      return parseInt(value) + 1;
  },
},extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/', partialsDir:__dirname+'/views/partials/'}))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/staff', staffRouter);
app.use('/admin', adminRouter)

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
