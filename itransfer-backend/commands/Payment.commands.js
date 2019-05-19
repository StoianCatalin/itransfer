const {User, Member, Plan, Payment} = require('../models/DatabaseConnection');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

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
      include: [User],
      where: { id: paymentId }
    });
    const user = await User.findOne({
      where: { id: userId },
    });
    if (payment.userId !== userId && user.role === 0) {
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
    payment.status = user.role === 0 ? 'processing' : 'paid';
    payment.payedMethod = user.role === 0 ? 'Bank transfer' : 'Cash';
    payment.recipeUrl = fileName;
    await payment.save();

    nodemailer.createTestAccount((err, account) => {
      let transporter = nodemailer.createTransport({
        host: 'smtp.googlemail.com', // Gmail Host
        port: 465, // Port
        secure: true, // this is true as port is 465
        auth: {
          user: 'itransfer.noreply@gmail.com', //Gmail username
          pass: 'PaRoLa123!' // Gmail password
        }
      });

      let mailOptions = {
        from: '"ITransfer Team" <itransfer.noreply@gmail.com>',
        to: payment.user.email,
        attachments: [
          { path: uploadDir + fileName }
        ],
        subject: 'Payment confirmation',
        html: `
     <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
    <table class="es-content-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
        <tbody>
            <tr>
                <td class="esd-structure es-p20t es-p40b es-p35r es-p35l" esd-custom-block-id="7685" align="left">
                    <table width="100%" cellspacing="0" cellpadding="0">
                        <tbody>
                            <tr>
                                <td class="esd-container-frame" width="530" valign="top" align="center">
                                    <table width="100%" cellspacing="0" cellpadding="0">
                                        <tbody>
                                            <tr>
                                                <td class="esd-block-text" align="center">
                                                    <h2>Payment information</h2>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="esd-block-text es-p20t es-p10b" align="center">
                                                    <p style="font-size: 16px; color: #777777;">User name: ${payment.user.full_name}</p>
                                                    <p style="font-size: 16px; color: #777777;">Price: ${payment.amount} euro</p>
                                                    <p style="font-size: 16px; color: #777777;">Plan: ${payment.name}</p>
                                                    <p style="font-size: 16px; color: #777777;">Billing date: ${ new Date(payment.startDate).toLocaleString('en-us', { month: 'long' }) + ' ' + new Date(payment.startDate).toLocaleString('en-us', { year: 'numeric' }) }</p>
                                                    <p style="font-size: 16px; color: #777777;">Status: Paid</p>
                                                    <p style="font-size: 16px; color: #777777;">Payed at: ${new Date(payment.payedDate).toLocaleDateString() + ' ' + new Date(payment.payedDate).toLocaleTimeString()}</p>
                                                    <p style="font-size: 16px; color: #777777;">Payment method: ${ payment.payedMethod }<br></p>
                                                    <p style="font-size: 16px; color: #777777;"><br></p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="esd-block-spacer es-p20t es-p15b" align="center">
                                                    <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0">
                                                        <tbody>
                                                            <tr>
                                                                <td style="border-bottom: 3px solid rgb(238, 238, 238); background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%; height: 1px; width: 100%; margin: 0px;"></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="esd-block-button es-p10t es-p20b es-p10r es-p10l" align="center"> <span>Copyright &copy; iTransfer 2019</span> </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
      });
    });

    return {
      status: 200
    }
  }

  async payWithCard(paymentId, userId) {
    const payment = await Payment.findOne({
      where: { id: paymentId }
    });
    if (payment.userId !== userId) {
      return {
        status: 401,
      }
    }
    payment.payedDate = new Date().getTime();
    payment.status = 'paid';
    payment.recipeUrl = this.generateRandomName(20);
    payment.payedMethod = 'Card';
    await payment.save();
    return { status: 200 };
  }
}

module.exports = { PaymentCommands };
