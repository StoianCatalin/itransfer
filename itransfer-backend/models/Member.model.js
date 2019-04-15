const Sequelize = require('sequelize');

module.exports = (sequelize, type) => {
  return sequelize.define('member', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
  })
};

