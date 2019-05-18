const CoreRouter = require('koa-router');
const DatabaseConnection = require('../models/DatabaseConnection');
const md5 = require('md5');
const UserModel = DatabaseConnection.User;
const jwtKey = require('../constants/secret-key').jwtKey;
const jsonwebtoken = require('jsonwebtoken');
const {Member, Plan} = require('../models/DatabaseConnection');
const { UserCommands } = require('../commands/User.commands');

const router = new CoreRouter();
router.post('/login', async (ctx, next) => {
  const { email, password } = ctx.request.body;
  if (!email || !password) {
    ctx.response.status = 409;
    ctx.response.body = { message: 'Email or password is missing' };
    return;
  }
  const user = await UserModel.findOne({
    where: {
      email
    }
  });
  if (!user) {
    ctx.response.status = 409;
    ctx.response.body = { message: 'Email or password are wrong' };
    return;
  }

  if (!user.contractUrl && user.role === 0) {
    ctx.response.status = 400;
    ctx.response.body = { message: 'Your account is not activated. Please contact our support for more details.' };
    return;
  }

  const hashedPassword = md5(password);
  if (user.password !== hashedPassword) {
    ctx.response.status = 409;
    ctx.response.body = { message: 'Email or password are wrong' };
    return;
  }
  const members = await Member.findAll({
    where: { userId: user.id },
    raw: true,
  });
  const plan = await Plan.findOne({
    where: { id: user.planId },
    raw: true
  });
  const token = jsonwebtoken.sign({
    email: user.email,
    full_name: user.full_name,
    id: user.id,
  }, jwtKey, { expiresIn: 60 * 60 });
  ctx.response.status = 200;
  ctx.response.body = {
    token,
    members,
    plan,
    email: user.email,
    full_name: user.full_name,
    id: user.id,
    role: user.role,
  };
  await next();
});

router.post('/register', async (ctx, done) => {
  const { user, plan } = ctx.request.body;
  const userCommands = new UserCommands();
  const { body, status } = await userCommands.register(user, plan);
  ctx.response.status = status;
  ctx.response.body = body;
  await done();
});

module.exports = { router };
