'use strict';

const CONST = require('@/common/const');

const ERROR = require('@/common/error');

const User = require('./User.model');
const Client = require('./Client.model');

const AuthService = require('./auth.service');

const throwError = (error) => {
  if (error) {
    throw error;
  }
};

/**
 * Authenticated Middleware
 */

async function withAuthenticatedUserMiddleware(req, res, next) {
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

function withRoleRestrictionMiddleware(role) {
  return (req, res, next = throwError) => {
    if (!CONST.ROLE_TO_ROLES[req.user.role].includes(role)) {
      next(new ERROR.UnauthorizedError());
      return;
    }
    next();
  };
}

withRoleRestrictionMiddleware[CONST.ROLE.ADMIN] = withRoleRestrictionMiddleware(CONST.ROLE.ADMIN);
withRoleRestrictionMiddleware[CONST.ROLE.CLIENT] = withRoleRestrictionMiddleware(CONST.ROLE.CLIENT);

/**
 * Permission-restricted Middleware
 */

// function withPermissionRestrictionMiddleware(permission) {
//   return (req, res, next = throwError) => {
//     if (!req.user.permissions.include(permission)) {
//       next(new ERROR.UnauthorizedError());
//       return;
//     }
//     next();
//   };
// }

/**
 * Load client profile
 */

async function withClientMiddleware(req, res, next = throwError) {
  req.client = await Client.collection.findOne(req.user._client);
  next();
}

module.exports = {
  withAuthenticatedUserMiddleware,
  withRoleRestrictionMiddleware,
  // permissionRestrictedMiddleware,
  withClientMiddleware,
};
