const {User, Member, Plan, Payment, Office} = require('../models/DatabaseConnection');
const md5 = require('md5');
const path = require('path');
const fs = require('fs');

class UserCommands {

  constructor() {}

  generateRandomName(length) {
    let str = "";
    const table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
      str += table.charAt(Math.floor(Math.random() * table.length));

    return str;
  }

  async getAllUsers() {
    return await User.findAll({
      include: [Member, Office, Payment, Plan],
      where: { role: 0 },
    }).map((user) => {
      user.password = null;
      return user;
    });
  }

  async uploadContract(userId, file) {
    const user = await User.findOne({ where: { id: userId } });
    const uploadDir = __dirname + '/../resources/contracts/';
    if (user.contractUrl) {
      fs.unlink(`${uploadDir}${user.contractUrl}`, () => {
        console.log('File deleted...');
      });
    }
    const fileName = this.generateRandomName(40) + path.extname(file.name);
    const readStream = fs.createReadStream(file.path);
    const writeStream = fs.createWriteStream(uploadDir + fileName);

    readStream.on('close', function () {
      fs.unlink(file.path, () => {
        console.log('File deleted...');
      });
    });
    readStream.pipe(writeStream);
    user.contractUrl = fileName;
    await user.save();
    return {
      status: 200
    }
  }

  async deleteContract(userId) {
    const user = await User.findOne({ where: { id: userId } });
    user.contractUrl = null;
    await user.save();
  }

  async saveUser(payload) {
    const user = await User.findOne({
      include: [Member, Office],
      where: { id: payload.id }
    });
    if (!user) {
      return { status: 400, body: { message: 'User not found.' } }
    }
    user.address = payload.address;
    user.cnp = payload.cnp;
    user.email = payload.email;
    user.full_name = payload.full_name;
    user.identity_number = payload.identity_number;
    user.freeAccount = payload.freeAccount;
    user.freeAccountObservation = payload.freeAccountObservation;
    if (payload.endDatePeriod) {
      user.endDate = user.startDate + 2592000000 * payload.endDatePeriod;
    }
    await user.save();

    for (const member of user.members) {
      const payloadMember = payload.team.find((i) => i.id === member.id);
      if (payloadMember) {
        member.full_name = payloadMember.full_name;
        await member.save();
      }
    }
    user.office.userId = null;
    await user.office.save();
    const office = await Office.findOne({ where: { id: payload.office.id } });
    office.userId = user.id;
    await office.save();

    return {
      status: 200,
      body: { message: 'User has been updated' }
    }
  }

  async getMe(userId) {
    const user = await User.findOne({
      where: { id: userId },
      raw: true,
    });
    if (user) {
      const members = await Member.findAll({
        where: { userId: userId },
        raw: true,
      });
      const plan = await Plan.findOne({
        where: { id: user.planId },
        raw: true
      });
      return {
        status: 200,
        body: { ...user, password: null, members: members, plan: plan }
      }
    } else {
      return {
        status: 409,
        body: { message: 'User not found' }
      }
    }
  }

  async updateMembers(members) {
    for (const member of members) {
      await Member.update({ full_name: member.full_name, email: member.email }, { where: { id: member.id } });
    }
    return { status: 200, body: members };
  }

  async register(user, bodyPlan) {
    const plan = await Plan.findOne({ where: { id: bodyPlan.planId } });
    if (!plan) {
      return {
        status: 409,
        body: { message: 'Invalid plan.' },
      }
    }
    const alreadyUser = await User.findOne({
      where: { email: user.email },
    });
    if (alreadyUser) {
      return {
        status: 409,
        body: { message: 'This email is already used.' },
      }
    }
    const userWithPassword = { ...user, password: md5(user.password) };
    const dbUser = await User.create({ ...userWithPassword, planId: plan.id, startDate: new Date(bodyPlan.startDate).getTime(), role: 0, team: null });
    for (const teamMember of user.team) {
      if (teamMember) {
        await Member.create({ full_name: teamMember, userId: dbUser.id });
      }
    }
    await Payment.create({
      userId: dbUser.id,
      planId: plan.id,
      amount: plan.price,
      name: plan.name,
      startDate: new Date(bodyPlan.startDate).getTime(),
      period: plan.period,
    });
    const office = await Office.findOne({
      where: {
        office_id: user.office_id,
      }
    });
    office.userId = dbUser.id;
    await office.save();
    await this.sendNotificationsToSecretary(dbUser);
    return {
      status: 200,
      body: { message: 'Account created. Now you have to wait until a staff member will activate your account.' },
    }
  }

  async createStaff(payload) {
    if (!payload.password) {
      return { status: 400, message: 'Password is empty' };
    }
    const user = await User.create({
      ...payload,
      cnp: '1',
      identity_number: '1',
      address: '1',
      startDate: new Date().getTime(),
      password: md5(payload.password),
    });
    return { status: 200, user };
  }

  async saveStaff(payload) {
    const user = await User.findOne({ where: { id: payload.id } });

    if (user.email !== payload.email) {
      const checkUser = await User.findOne({ where: { email: payload.email } });
      if (checkUser) {
        return { status: 409, message: 'Email already taken.' };
      }
    }

    user.full_name = payload.full_name;
    user.email = payload.email;
    user.role = payload.role;
    if (payload.password) {
      user.password = md5(payload.password);
    }
    await user.save();
    return { status: 200, message: 'User updated' }
  }

  async sendNotificationsToSecretary(user) {
    const secretaries = await User.findAll({ where: { role: 2 } });
    if (!secretaries) {
      return;
    }
    for (const secretary of secretaries) {
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
          to: secretary.email,
          subject: 'New user was registered',
          html: `
     <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
    <table width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
        <tbody>
            <tr>
                <td esd-custom-block-id="7685" align="left">
                    <table width="100%" cellspacing="0" cellpadding="0">
                        <tbody>
                            <tr>
                                <td width="530" valign="top" align="center">
                                    <table width="100%" cellspacing="0" cellpadding="0">
                                        <tbody>
                                            <tr>
                                                <td align="center">
                                                    <h2>New user registered</h2>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center">
                                                    <p style="font-size: 16px; color: #777777;">User name: ${user.full_name}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center">
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
                                                <td align="center"> <span>Copyright &copy; iTransfer 2019</span> </td>
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
    }
  }
}

module.exports = { UserCommands };
