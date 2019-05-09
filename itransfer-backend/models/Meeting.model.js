const Sequelize = require('sequelize');

const Meeting = (sequelize, type) => {
  return sequelize.define('meeting', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    startDate: {
      type: Sequelize.BIGINT,
    },
    endDate: {
      type: Sequelize.BIGINT,
    },
    attenders: {
      type: Sequelize.TEXT,
    },
    gcalendar_meeting_id: {
      type: Sequelize.STRING,
    }
  })
};

module.exports = Meeting;


