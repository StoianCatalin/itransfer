const Sequelize = require('sequelize');

const Office = (sequelize, type) => {
  return sequelize.define('office', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    office_id: {
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
  });
};

module.exports = Office;
