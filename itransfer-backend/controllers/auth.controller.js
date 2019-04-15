const CoreRouter = require('koa-router');
const DatabaseConnection = require('../models/DatabaseConnection');
const md5 = require('md5');
const UserModel = DatabaseConnection.User;
const jwtKey = require('../constants/secret-key').jwtKey;
const jsonwebtoken = require('jsonwebtoken');

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
  const hashedPassword = md5(password);
  if (user.password !== hashedPassword) {
    ctx.response.status = 409;
    ctx.response.body = { message: 'Email or password are wrong' };
    return;
  }
  const token = jsonwebtoken.sign({
    email: user.email,
    name: user.name,
    id: user.id,
  }, jwtKey, { expiresIn: 60 * 60 });
  ctx.response.status = 200;
  ctx.response.body = {
      token,
      email: user.email,
      name: user.name,
      id: user.id,
    };
  await next();
});

module.exports = { router };
