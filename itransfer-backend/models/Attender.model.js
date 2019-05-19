const Sequelize = require('sequelize');

const Attender = (sequelize, type) => {
  return sequelize.define('attender', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
  })
};

module.exports = Attender;


