const jsonwebtoken = require('jsonwebtoken');
const jwtKey = require('../constants/secret-key').jwtKey;

const hasAdminAccess = async (ctx, next) => {
  if (ctx.state.user.role !== 3) {
    ctx.response.status = 403;
    ctx.response.body = { message: 'You are not allowed to do this.' };
    return;
  }
  await next();
};

const hasSecretarAccess = async (ctx, next) => {
  if (ctx.state.user.role !== 2) {
    ctx.response.status = 403;
    ctx.response.body = { message: 'You are not allowed to do this.' };
    return;
  }
  await next();
};

const hasContabilAccess = async (ctx, next) => {
  if (ctx.state.user.role !== 1) {
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
