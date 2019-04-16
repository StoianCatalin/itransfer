const {User, Member} = require('../models/DatabaseConnection');
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
      return {
        status: 200,
        body: { ...user, password: null }
      }
    } else {
      return {
        status: 409,
        body: { message: 'User not found' }
      }
    }
  }

  async register(user, plan) {
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
    const dbUser = await User.create({ ...userWithPassword, planId: plan.planId, startDate: plan.startDate , role: 0, team: null });
    for (const teamMember of user.team) {
      await Member.create({ full_name: teamMember, userId: dbUser.id });
    }
    const token = jsonwebtoken.sign({
      email: user.email,
      name: user.name,
      id: user.id,
    }, jwtKey, { expiresIn: 60 * 60 });
    return {
      status: 200,
      body: {
        token,
        email: dbUser.email,
        name: dbUser.name,
        id: dbUser.id,
        role: user.role,
      },
    }
  }
}

module.exports = { UserCommands };
