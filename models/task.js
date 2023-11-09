const { DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Task = sequelize.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    user: {
        type: DataTypes.STRING(25),
    },
    description: {
        type: DataTypes.TEXT,
    },
}, {});


// Task.sync({alter: true});

module.exports = Task;