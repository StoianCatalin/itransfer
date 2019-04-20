const { PaymentCommands } = require('../commands/Payment.commands');

const CoreRouter = require('koa-router');
const isAuthenticated = require('../middlewares/authentication.middleware').isAuthenticated;

const router = new CoreRouter();
router.get('/all', isAuthenticated,async (ctx, next) => {
  const paymentCommands = new PaymentCommands();
  const payments = await paymentCommands.getLastTen(ctx.state.user.id);
  ctx.response.status = 200;
  ctx.response.body = payments;
  await next();
});

module.exports = { router };
