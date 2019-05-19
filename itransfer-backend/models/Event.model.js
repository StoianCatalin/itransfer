const Sequelize = require('sequelize');

const Event = (sequelize, type) => {
  return sequelize.define('event', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    location: {
      type: Sequelize.STRING,
      allowNull: false
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    startTime: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    endTime: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })
};

module.exports = Event;


