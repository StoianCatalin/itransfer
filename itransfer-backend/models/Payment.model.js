const Sequelize = require('sequelize');

const Plan = (sequelize, type) => {
  return sequelize.define('payment', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    payedDate: {
      type: Sequelize.BIGINT,
      allowNull: true
    },
    startDate: {
      type: Sequelize.BIGINT,
    },
    period: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'unpaid'
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    recipeUrl: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    contractUrl: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    payedMethod: {
      type: Sequelize.STRING,
      allowNull: true,
    }
  })
};

module.exports = Plan;


