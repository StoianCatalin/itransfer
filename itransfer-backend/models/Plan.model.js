const Sequelize = require('sequelize');

const Plan = (sequelize, type) => {
  return sequelize.define('plan', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    period: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    allowMoreThanOne: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  })
};

module.exports = Plan;


