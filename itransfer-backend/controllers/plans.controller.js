const CoreRouter = require('koa-router');
const isAuthenticated = require('../middlewares/authentication.middleware').isAuthenticated;
const { Plan, Facility } = require('../models/DatabaseConnection');

const router = new CoreRouter();
router.get('/:type', async (ctx, next) => {
  const type = ctx.params.type;
  const plans = await Plan.findAll({
    include: [Facility],
    where: {
      type
    }
  });
  ctx.response.body = plans;
  await next();
});

module.exports = { router };
