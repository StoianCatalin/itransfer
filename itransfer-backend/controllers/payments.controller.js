const { PaymentCommands } = require('../commands/Payment.commands');
const koaBody = require("koa-body");

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

router.post('/upload/:paymentId', isAuthenticated, koaBody({ multipart: true }), async (ctx, next) => {
  const paymentId = ctx.params.paymentId;
  const file = ctx.request.files.filepond;
  if (!file.type.startsWith('image/')) {
    ctx.response.status = 409;
    return;
  }
  const paymentCommands = new PaymentCommands();
  const response = await paymentCommands.uploadFileAndCompletePayment(paymentId, ctx.state.user.id, file);
  ctx.response.status = response.status;
  await next();
});

router.delete('/upload/:paymentId', isAuthenticated, async (ctx, next) => {
  const paymentId = ctx.params.paymentId;
  const paymentCommands = new PaymentCommands();
  const response = await paymentCommands.deleteFileAndUncompletePayment(paymentId, ctx.state.user.id);
  ctx.response.status = response.status;
  await next();
});

module.exports = { router };
