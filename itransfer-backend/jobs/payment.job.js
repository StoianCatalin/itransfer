const cron = require('node-cron');
const { User, Payment, Plan } = require('../models/DatabaseConnection');

class PaymentJob {

  static run() {
    const task = cron.schedule('*/2 * * * *', async () => {
      await this.job();
    }, {
      scheduled: false
    });
    task.start();
  }

  static async job() {
    const users = await User.findAll({
      include: [Plan],
    });
    for (const user of users) {
      const payment = await Payment.findOne({
        where: {
          userId: user.id,
        },
        order: [ ['startDate', 'DESC'] ],
      });
      if (!payment) {
        return;
      }
      const difference = payment.period === 'month' ? 2592000000 : 86400000; // month or day
      if (new Date().getTime() - payment.startDate >= difference && new Date().getTime() < user.endDate) {
        await Payment.create({
          name: user.plan.name,
          startDate: new Date().getTime(),
          period: user.plan.period,
          status: 'unpaid',
          amount: user.freeAccount ? 0 : user.plan.price,
          userId: user.id,
          planId: user.plan.id,
        });
      }
    }
  }
}

module.exports = PaymentJob;