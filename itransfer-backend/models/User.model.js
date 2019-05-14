const Sequelize = require('sequelize');

module.exports = (sequelize, type) => {
  return sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    cnp: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    identity_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
    },
    role: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    startDate: {
      type: Sequelize.BIGINT,
    },
    contractUrl: {
      type: Sequelize.STRING,
      allowNull: true,
    }
  })
};

