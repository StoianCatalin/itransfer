const Sequelize = require('sequelize');
const UserModel = require('./User.model');
const PlanModel = require('./Plan.model');
const FacilityModel = require('./Facility.model');
const MemberModel = require('./Member.model');
const PaymentModel = require('./Payment.model');

const sequelize = new Sequelize('itransfer', 'root', 'root', {
  host: 'itransfer-mysql',
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const User = UserModel(sequelize, Sequelize);
const Plan = PlanModel(sequelize, Sequelize);
const Facility = FacilityModel(sequelize, Sequelize);
const Member = MemberModel(sequelize, Sequelize);
const Payment = PaymentModel(sequelize, Sequelize);

Plan.hasMany(Facility);
User.hasMany(Member);
User.belongsTo(Plan);
User.hasMany(Payment);
Payment.belongsTo(Plan);

module.exports = {
  sequelize,
  User,
  Plan,
  Facility,
  Member,
  Payment,
};
