const {User, Member, Plan, Payment} = require('../models/DatabaseConnection');
const fs = require('fs');
const path = require('path');

class PaymentCommands {

  constructor() {}

  generateRandomName(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

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

  async deleteFileAndUncompletePayment(paymentId, userId) {
    const payment = await Payment.findOne({
      where: { id: paymentId }
    });
    if (payment.userId !== userId) {
      return {
        status: 401,
      }
    }
    fs.unlink(payment.recipeUrl, () => {
      console.log('File deleted...');
    });
    payment.payedDate = null;
    payment.status = 'unpaid';
    payment.recipeUrl = null;
    await payment.save();
    return {
      status: 200,
    }
  }

  async uploadFileAndCompletePayment(paymentId, userId, file) {
    const payment = await Payment.findOne({
      where: { id: paymentId }
    });
    if (payment.userId !== userId) {
      return {
        status: 401,
      }
    }
    const uploadDir = __dirname + '/../resources/receipts/';
    const fileName = this.generateRandomName(40) + path.extname(file.name);
    const readStream = fs.createReadStream(file.path);
    const writeStream = fs.createWriteStream(uploadDir + fileName);

    readStream.on('close', function () {
      fs.unlink(file.path, () => {
        console.log('File deleted...');
      });
    });
    readStream.pipe(writeStream);
    payment.payedDate = new Date().getTime();
    payment.status = 'processing';
    payment.recipeUrl = uploadDir + fileName;
    await payment.save();
    return {
      status: 200
    }
  }
}

module.exports = { PaymentCommands };
