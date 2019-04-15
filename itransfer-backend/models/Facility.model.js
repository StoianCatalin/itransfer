const Sequelize = require('sequelize');

module.exports = (sequelize, type) => {
  return sequelize.define('facility', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
  })
};

