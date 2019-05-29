const Sequelize = require('sequelize');
const UserModel = require('./User.model');
const PlanModel = require('./Plan.model');
const FacilityModel = require('./Facility.model');
const MemberModel = require('./Member.model');
const PaymentModel = require('./Payment.model');
const RoomModel = require('./Room.model');
const MeetingModel = require('./Meeting.model');
const OfficeModel = require('./Office.model');
const EventModel = require('./Event.model');
const AttenderModel = require('./Attender.model');
const OfficeAccessModel = require('./OfficeAccess.model');

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

const OfficeAccess = OfficeAccessModel(sequelize, Sequelize);
const User = UserModel(sequelize, Sequelize);
const Plan = PlanModel(sequelize, Sequelize);
const Facility = FacilityModel(sequelize, Sequelize);
const Member = MemberModel(sequelize, Sequelize);
const Payment = PaymentModel(sequelize, Sequelize);
const Room = RoomModel(sequelize, Sequelize);
const Meeting = MeetingModel(sequelize, Sequelize);
const Office = OfficeModel(sequelize, Sequelize);
const Event = EventModel(sequelize, Sequelize);
const Attender = AttenderModel(sequelize, Sequelize);

Plan.hasMany(Facility);
User.hasMany(Member);
User.belongsTo(Plan);
User.hasMany(Payment);
User.hasMany(Meeting);
User.hasOne(Office);
Office.belongsTo(User);
Meeting.belongsTo(Room);
Payment.belongsTo(Plan);
Payment.belongsTo(User);
Attender.belongsTo(User);
Attender.belongsTo(Event);
Event.hasMany(Attender);
Office.hasMany(OfficeAccess);

module.exports = {
  sequelize,
  User,
  Plan,
  Facility,
  Member,
  Payment,
  Room,
  Meeting,
  Office,
  Event,
  Attender,
  OfficeAccess
};
