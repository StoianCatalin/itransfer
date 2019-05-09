const Sequelize = require('sequelize');

const Room = (sequelize, type) => {
  return sequelize.define('room', {
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

module.exports = Room;


