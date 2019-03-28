const jsonwebtoken = require('jsonwebtoken');
const jwtKey = require('../constants/secret-key').jwtKey;

const isAuthenticated = async (ctx, next) => {
  const header = ctx.request.headers.authorization;
  if (!header) {
    ctx.response.status = 401;
    ctx.response.body = { message: 'Header missing' };
  }
  const parts = header.split(' ');
  if (parts[0] !== 'Bearer') {
    ctx.response.status = 400;
    ctx.response.body = { message: 'Invalid token type' };
  }
  try {
    ctx.state.user = jsonwebtoken.verify(parts[1], jwtKey);
  } catch (e) {
    ctx.response.status = 400;
    ctx.response.body = { message: 'Invalid token' };
  }
  await next();
};

module.exports = {
  isAuthenticated
};
