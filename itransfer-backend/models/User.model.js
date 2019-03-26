const Sequelize = require('sequelize');

module.exports = (sequelize, type) => {
  return sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
    },
  })
};

