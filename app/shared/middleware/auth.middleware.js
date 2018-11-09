'use strict';

const CONST = require('@/common/const');

const ERROR = require('@/common/error');

const User = require('@/module/auth/User.model');

const AuthService = require('@/module/auth/auth.service');

/**
 * Authenticated Middleware
 */

async function authenticatedMiddleware(req, res, next) {
  const access_token = req.headers.authorization.substr(7) || req.query.access_token;

  const payload = await AuthService.isAccessTokenValid(access_token);

  req.user = await User.collection.findOne({ uid: payload.id });
  req.scope = payload.scope;

  if (!req.user) {
    next(new ERROR.UnauthenticatedError());
    return;
  }

  next();
}

/**
 * Role-restricted Middleware
 */

function roleRestrictedMiddleware(role) {
  return function roleRestrictedMiddleware(req, res, next) {
    if (!CONST.ROLES_MAPPING[req.user.role].includes(role) || req.scope !== role) {
      next(new ERROR.UnauthorizedError());
      return;
    }
    next();
  };
}

module.exports = {
  authenticatedMiddleware,
  roleRestrictedMiddleware,
};
