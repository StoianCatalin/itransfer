const CoreRouter = require('koa-router');

const router = new CoreRouter();
router.get('/status', async (ctx, next) => {
  ctx.response.body = 'ok';
  await next();
});

module.exports = { router };
