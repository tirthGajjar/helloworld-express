'use strict';

/** @module auth/middleware */

const CONST = require('@/common/const');

const ERROR = require('@/common/error');

const User = require('./User.model');

const AuthService = require('./auth.service');

/**
 * Authenticated Middleware
 *
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 * @param {function} next
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
 *
 * @param {string} role
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
