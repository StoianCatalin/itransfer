const {User, Member, Plan, Payment, Office} = require('../models/DatabaseConnection');
const md5 = require('md5');
const jwtKey = require('../constants/secret-key').jwtKey;
const jsonwebtoken = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

class UserCommands {

  constructor() {}

  generateRandomName(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
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
    const members = await Member.findAll({
      where: { userId: dbUser.id },
      raw: true,
    });
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
    const token = jsonwebtoken.sign({
      email: dbUser.email,
      full_name: dbUser.full_name,
      id: dbUser.id,
    }, jwtKey, { expiresIn: 60 * 60 });
    return {
      status: 200,
      body: {
        token,
        members,
        plan,
        email: dbUser.email,
        full_name: dbUser.full_name,
        id: dbUser.id,
        role: user.role,
      },
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
}

module.exports = { UserCommands };
