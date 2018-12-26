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
    req.user = await User.collection.findOne(payload.id);
  }

  if (!req.user) {
    next(new ERROR.UnauthenticatedError());
    return;
  }

  if (!CONST.AUDIENCE_TO_ROLES[req.audience].includes(req.user.role)) {
    next(new ERROR.UnauthorizedError());
    return;
  }

  next();
}

/**
 * Role-restricted Middleware
 */

function roleRestrictedMiddleware(role) {
  return (req, res, next) => {
    if (!CONST.ROLE_TO_ROLES[req.user.role].includes(role)) {
      next(new ERROR.UnauthorizedError());
      return;
    }
    next();
  };
}

/**
 * Permission-restricted Middleware
 */

// function permissionRestrictedMiddleware(permission) {
//   return (req, res, next) => {
//     if (!req.user.permissions.include(permission)) {
//       next(new ERROR.UnauthorizedError());
//       return;
//     }
//     next();
//   };
// }

module.exports = {
  authenticatedMiddleware,
  roleRestrictedMiddleware,
  // permissionRestrictedMiddleware,
};
