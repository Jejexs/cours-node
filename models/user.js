const {DataTypes} = require('sequelize');
const sequelize = require('../utils/sequelize');
const Task = require('./task');

const User = sequelize.define('User', {
    email: {
        type: DataTypes.TEXT,
    },
    password: {
        type: DataTypes.STRING,
    },
    display_name: {
        type: DataTypes.TEXT,
    },
}, {});

// User.hasMany(Task);
// Task.belongsTo(User);

// User.belongToMany(Task, {through: 'UserTask'});
// Task.belongToMany(User, {through: 'UserTask'});

// User.sync({alter: true});

module.exports = User;