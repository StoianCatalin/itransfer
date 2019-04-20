const {User, Member, Plan, Payment} = require('../models/DatabaseConnection');
const md5 = require('md5');
const jwtKey = require('../constants/secret-key').jwtKey;
const jsonwebtoken = require('jsonwebtoken');

class UserCommands {

  constructor() {}

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
      if (teamMember.full_name) {
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
}

module.exports = { UserCommands };
