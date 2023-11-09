const { Sequelize } = require('sequelize');

sequelizeInstance = new Sequelize(process.env.DB_NAME_2, process.env.DB_USER_2, process.env.DB_PASSWORD_2, {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = sequelizeInstance;