const CoreRouter = require('koa-router');
const isAuthenticated = require('../middlewares/authentication.middleware').isAuthenticated;
const { UserCommands } = require('../commands/User.commands');

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

module.exports = { router };
