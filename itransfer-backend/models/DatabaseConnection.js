const Sequelize = require('sequelize');
const UserModel = require('./User.model');

const sequelize = new Sequelize('itransfer', 'root', 'root', {
  host: 'itransfer-mysql',
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const User = UserModel(sequelize, Sequelize);

module.exports = {
  sequelize,
  User,
};
