const {User, Member, Plan, Payment} = require('../models/DatabaseConnection');

class PaymentCommands {

  constructor() {}

  async getLastTen(userId) {
    const payments = await Payment.findAll({
      where: { userId: userId },
      limit: 10,
      raw: true,
      order: [ ['createdAt', 'DESC'] ]
    });
    if (!payments.length) {
      return [payments];
    } else {
      return payments;
    }
  }
}

module.exports = { PaymentCommands };
