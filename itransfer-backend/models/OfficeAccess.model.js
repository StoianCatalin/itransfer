const Sequelize = require('sequelize');

const OfficeAccess = (sequelize, type) => {
  return sequelize.define('office_access', {
    office_id: {
      type: Sequelize.INTEGER,
    },
    enterDate: {
      type: Sequelize.BIGINT,
    },
  });
};

module.exports = OfficeAccess;
