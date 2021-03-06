const CoreRouter = require('koa-router');
const isAuthenticated = require('../middlewares/authentication.middleware').isAuthenticated;
const { UserCommands } = require('../commands/User.commands');
const {User, Payment, Office, Member, OfficeAccess} = require('../models/DatabaseConnection');
const { hasAdminAccess, hasSecretarAccess } = require('../middlewares/role.middleware');
const koaBody = require("koa-body");
const Op = require('sequelize').Op;
const fs = require('fs');
const mime = require('mime-types');
const jwtKey = require('../constants/secret-key').jwtKey;
const jsonwebtoken = require('jsonwebtoken');
const { getServer } = require("../socket");

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

router.get('/', isAuthenticated, hasSecretarAccess, async (ctx, next) => {
  const userCommands = new UserCommands();
  ctx.response.body = await userCommands.getAllUsers();
  await next();
});

router.post('/', isAuthenticated, hasSecretarAccess, async (ctx, next) => {
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
  const client = await User.findOne({ where: { contractUrl: fileName } });

  if ((user.role !== 3 && user.role !== 2) && user.id !== client.id) {
    ctx.response.status = 401;
    return;
  }

  if (!client) {
    ctx.response.status = 404;
  } else {
    const mimeType = mime.lookup(__dirname + `/../resources/contracts/${client.contractUrl}`);
    ctx.set('Content-Type', mimeType);
    ctx.response.body = fs.readFileSync(__dirname + `/../resources/contracts/${client.contractUrl}`);
  }
  await next();
});

router.get('/receipts/:fileName/:token', async (ctx, next) => {
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
  const payment = await Payment.findOne({ where: { recipeUrl: fileName } });
  console.log(payment.userId, user.role, user.id);

  if (user.role < 1 && user.id !== payment.userId) {
    ctx.response.status = 401;
    return;
  }

  if (!payment) {
    ctx.response.status = 404;
  } else {
    const mimeType = mime.lookup(__dirname + `/../resources/receipts/${payment.recipeUrl}`);
    ctx.set('Content-Type', mimeType);
    ctx.response.body = fs.readFileSync(__dirname + `/../resources/receipts/${payment.recipeUrl}`);
  }
  await next();
});

router.get('/staff', isAuthenticated, hasAdminAccess, async (ctx, next) => {
  const users = await User.findAll({
    where: {
      role: {
        [Op.ne]: 0
      }
    }
  }).map((user) => {
    user.password = null;
    return user;
  });
  ctx.response.body = users;
  await next();
});

router.post('/staff', isAuthenticated, hasAdminAccess, async (ctx, next) => {
  const userCommands = new UserCommands();
  const response = await userCommands.createStaff(ctx.request.body);
  ctx.response.status = response.status;
  ctx.response.body = response.body;
  await next();
});

router.put('/staff/:userId', isAuthenticated, hasAdminAccess, async (ctx, next) => {
  const userCommands = new UserCommands();
  const response = await userCommands.saveStaff(ctx.request.body);
  ctx.response.status = response.status;
  ctx.response.body = response.body;
  await next();
});

router.get('/guard/:id', async (ctx, next) => {
  const { token } = ctx.request.headers;
  console.log(ctx.params.id, 'L$N9T!!kdmW3d6b%;p4S2E=');
  if (ctx.params.id === 'L$N9T!!kdmW3d6b%;p4S2E=') {
    ctx.response.status = 200;
    ctx.response.body = { token: '84/eHM$g\'tx_9[fJdRM9~\\N' };
    return;
  }
  if (!token && token !== '84/eHM$g\'tx_9[fJdRM9~\\N') {
    ctx.response.status = 401;
    return;
  }

  const user = await User.findOne({ include: [Office, Payment, Member], where: { id: ctx.params.id } });
  if (!user) {
    ctx.response.status = 400;
    ctx.response.body = { message: 'User not exists' };
  }
  const unpaidPayment = user.payments.find((payment) => payment.status === 'unpaid');
  user.password = null;
  user.paymentStatus = unpaidPayment ? 'Unpaid' : 'Paid';
  user.status = user.contractUrl ? 'Active' : 'Not active';
  const result = {
    id: user.id,
    last_date: unpaidPayment ? unpaidPayment.startDate + 1296000000 : null,
    full_name: user.full_name,
    email: user.email,
    officeName: user.office.name,
    officeId: user.office.id,
    paymentStatus: user.payments.find((payment) => payment.status === 'unpaid') ? 'Unpaid' : 'Paid',
    status: user.contractUrl ? 'Active' : 'Not active',
    members: user.members.map((member) => { return { name: member.full_name, email: member.email } })
  };
  OfficeAccess.create({
    enterDate: new Date().getTime(),
    office_id: user.office.office_id,
    officeId: user.office.id,
    userId: user.id,
  });
  getServer().emit('scan', result);
  ctx.response.body = result;
  await next();
});

module.exports = { router };
