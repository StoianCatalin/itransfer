const CoreRouter = require('koa-router');
const isAuthenticated = require('../middlewares/authentication.middleware').isAuthenticated;

const router = new CoreRouter();
router.get('/me', isAuthenticated, async (ctx, next) => {
  console.log(ctx.state);
  ctx.response.body = 'ok';
  await next();
});

module.exports = { router };
