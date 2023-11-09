var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');
dotenv.config();
require('./models/models');


const middlewares = require('./middlewares')

var indexRouter = require('./routes/index');
var tasksRouter = require('./routes/tasks');
var usersRouter = require('./routes/users');
var tasks2Router = require('./routes/tasks2');
var users2Router = require('./routes/users2');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/tasks', tasksRouter);
app.use('/users', usersRouter);
app.use('/tasks2', tasks2Router);
app.use('/users2', users2Router);



module.exports = app;
