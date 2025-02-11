var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var fileRouter = require('./routes/file');
var usersRouter = require('./routes/users');
var saleRouter = require('./routes/sale')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/file', fileRouter);
app.use('/api/users', usersRouter);
app.use('/api/sale', saleRouter)




module.exports = app;
