'use strict';

/**
 * Authenticated Middleware
 */

function authenticatedMiddleware(req, res, next) {
  req.user = {};
  // ...
  if (!req.user) {
    next(new Error('Unauthenticated'));
    return;
  }
  next();
}

/**
 * Role-restricted Middleware
 */

const ROLES = {
  admin: ['admin', 'client'],
  professional: ['professional', 'client'],
  client: ['client'],
};

function roleRestrictedMiddleware(role) {
  return function roleRestrictedMiddleware(req, res, next) {
    if (ROLES[req.user.role || 'client'].includes(role)) {
      next(new Error('Unauthorized'));
      return;
    }
    next();
  };
}

module.exports = {
  authenticatedMiddleware,
  roleRestrictedMiddleware,
};
