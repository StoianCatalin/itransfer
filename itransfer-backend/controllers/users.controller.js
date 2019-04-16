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

module.exports = { router };
