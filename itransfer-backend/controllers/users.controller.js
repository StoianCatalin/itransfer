const CoreRouter = require('koa-router');
const isAuthenticated = require('../middlewares/authentication.middleware').isAuthenticated;
const { UserCommands } = require('../commands/User.commands');
const {User} = require('../models/DatabaseConnection');
const { hasAdminAccess, hasSecretarAccess } = require('../middlewares/role.middleware');
const koaBody = require("koa-body");
const fs = require('fs');
const mime = require('mime-types');
const jwtKey = require('../constants/secret-key').jwtKey;
const jsonwebtoken = require('jsonwebtoken');

const router = new CoreRouter();
router.get('/me', isAuthenticated, async (ctx, next) => {
  const userCommands = new UserCommands();
  const { status, body } = await userCommands.getMe(ctx.state.user.id);
  ctx.response.status = status;
  ctx.response.body = body;
  await next();
});

router.post('/members', isAuthenticated, async (ctx, next) => {
  const members = ctx.request.body;
  const userCommands = new UserCommands();
  await userCommands.updateMembers(members);
  ctx.response.status = 200;
  ctx.response.body = members;
  await next();
});

router.get('/', isAuthenticated, hasAdminAccess, async (ctx, next) => {
  const userCommands = new UserCommands();
  ctx.response.body = await userCommands.getAllUsers();
  await next();
});

router.post('/', isAuthenticated, hasAdminAccess, async (ctx, next) => {
  const payload = ctx.request.body;
  const userCommands = new UserCommands();
  const response = await userCommands.saveUser(payload);
  ctx.response.status = response.status;
  ctx.response.body = response.body;
  await next();
});

router.post('/upload/:userId', isAuthenticated, hasSecretarAccess, koaBody({ multipart: true }), async (ctx, next) => {
  const userId = ctx.params.userId;
  const file = ctx.request.files.filepond;
  if (!file.type.startsWith('image/') && !file.type !== 'application/pdf') {
    ctx.response.status = 409;
    return;
  }
  const userCommands = new UserCommands();
  const response = await userCommands.uploadContract(userId, file);
  ctx.response.status = response.status;
  await next();
});

router.delete('/upload/:userId/:fileName', isAuthenticated, hasSecretarAccess, async (ctx, next) => {
  const userId = ctx.params.userId;
  const userCommands = new UserCommands();
  await userCommands.deleteContract(userId);
  ctx.response.status = 200;
  await next();
});

router.delete('/:userId', isAuthenticated, hasAdminAccess, async (ctx, next) => {
  await User.destroy({ where: { id: ctx.params.userId } });
  ctx.response.status = 200;
  await next();
});

router.get('/contracts/:fileName/:token', async (ctx, next) => {
  const token = ctx.params.token;
  const fileName = ctx.params.fileName;

  try {
    ctx.state.user = jsonwebtoken.verify(token, jwtKey);
  } catch (e) {
    ctx.response.status = 400;
    ctx.response.body = { message: 'Invalid token' };
    return;
  }
  const user = await User.findOne({ where: { id: ctx.state.user.id } });

  console.log(user.role);
  if (user.role !== 3 && user.role !== 2) {
    ctx.response.status = 401;
    return;
  }

  const client = await User.findOne({ where: { contractUrl: fileName } });

  if (!client) {
    ctx.response.status = 404;
  } else {
    const mimeType = mime.lookup(__dirname + `/../resources/contracts/${client.contractUrl}`);
    ctx.set('Content-Type', mimeType);
    ctx.response.body = fs.readFileSync(__dirname + `/../resources/contracts/${client.contractUrl}`);
  }
  await next();
});

module.exports = { router };
