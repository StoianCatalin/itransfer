const { User } = require('../models/DatabaseConnection');

const hasAdminAccess = async (ctx, next) => {
  const user = await User.findOne({
    where: { id: ctx.state.user.id },
  });
  if (user.role !== 3) {
    ctx.response.status = 403;
    ctx.response.body = { message: 'You are not allowed to do this.' };
    return;
  }
  await next();
};

const hasSecretarAccess = async (ctx, next) => {
  const user = await User.findOne({
    where: { id: ctx.state.user.id },
  });
  if (user.role < 2) {
    ctx.response.status = 403;
    ctx.response.body = { message: 'You are not allowed to do this.' };
    return;
  }
  await next();
};

const hasContabilAccess = async (ctx, next) => {
  const user = await User.findOne({
    where: { id: ctx.state.user.id },
  });
  if (user.role < 1) {
    ctx.response.status = 403;
    ctx.response.body = { message: 'You are not allowed to do this.' };
    return;
  }
  await next();
};

module.exports = {
  hasAdminAccess,
  hasSecretarAccess,
  hasContabilAccess
};
