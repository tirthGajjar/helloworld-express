'use strict';

/** @module common/auth/middleware */

const CONST = require('@/common/const');

const ERROR = require('@/common/error');

const User = require('./User.model');
const Client = require('../account/Client.model');

const AuthService = require('./auth.service');

const throwError = (error) => {
  if (error) {
    throw error;
  }
};

/**
 * Anonymous User
 */

function withAnonymousUser(req, res, next) {
  req.allowAnonymous = true;
  next();
}

/**
 * Authenticated User
 */

async function withAuthenticatedUser(req, res, next) {
  const access_token = AuthService.extractAccessTokenFromRequest(req);

  const payload = await AuthService.validateAccessToken(access_token);

  if (payload) {
    req.audience = payload.aud;
    req.user = await User.collection.findOne(payload.id);
  }

  if (req.allowAnonymous && !req.user) {
    req.audience = CONST.AUDIENCE.CLIENT;
    req.user = {
      id: 'anonymous',
      role: CONST.ROLE.CLIENT,
      _client: 'anonymous',
      toJSON() {
        return this;
      },
    };
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
 * Role-restricted Access
 */

function withRoleRestriction(role) {
  return (req, res, next = throwError) => {
    if (!CONST.ROLE_TO_ROLES[req.user.role].includes(role)) {
      next(new ERROR.UnauthorizedError());
      return;
    }
    next();
  };
}

withRoleRestriction[CONST.ROLE.ADMIN] = withRoleRestriction(CONST.ROLE.ADMIN);
withRoleRestriction[CONST.ROLE.CLIENT] = withRoleRestriction(CONST.ROLE.CLIENT);

/**
 * Permission-restricted Access
 */

function withPermissionRestriction(permission) {
  return (req, res, next = throwError) => {
    if (!req.user.permissions.include(permission)) {
      next(new ERROR.UnauthorizedError());
      return;
    }
    next();
  };
}

/**
 * Load client profile
 */

async function withUserAsClient(req, res, next = throwError) {
  req.client = await Client.collection.findOne(req.user._client);
  next();
}

/**
 * Exports
 */
module.exports = {
  withAnonymousUser,
  withAuthenticatedUser,
  withRoleRestriction,
  withPermissionRestriction,
  withUserAsClient,
};
