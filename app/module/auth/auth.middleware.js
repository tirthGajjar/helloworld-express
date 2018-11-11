'use strict';

const CONST = require('@/common/const');

const ERROR = require('@/common/error');

const User = require('./User.model');

const AuthService = require('./auth.service');

/**
 * Authenticated Middleware
 */

async function authenticatedMiddleware(req, res, next) {
  const access_token = AuthService.extractAccessTokenFromRequest(req);

  const payload = await AuthService.validateAccessToken(access_token);

  if (payload) {
    req.audience = payload.aud;
    req.user = await User.collection.findOne({ uid: payload.id });
  }

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
  return (req, res, next) => {
    if (!CONST.ROLES_MAPPING[req.user.role].includes(role) || req.audience !== role) {
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
