'use strict';

const ERROR = require('starter-lib/dist/common/error');

module.exports = ERROR;

/**
 * RequestError
 *
 * throw new ERROR.RequestError()
 * throw new ERROR.RequestError(400, 'InvalidRequest', 'Invalid request', {})
 */

const WATERLINE_ERRORS = [
  {
    message: 'Could not use specified `label`.  Cannot set "" (empty string) for a required attribute.',
  },
  {
    message: 'Missing value for required attribute `image_uri`.  Expected a string, but instead, got: undefined',
  },
];

ERROR.RequestError = class RequestError extends ERROR.FailureError {
  constructor(status, code, message, extra) {
    super(code || 'InvalidRequest', message || 'Invalid request', extra);
    this.name = 'RequestError';
    this.status = status || 400;
  }

  static fromWaterlineError(err) {
    const extra = {
      _err: err,
      issues: [],
    };

    extra.issues.push({
      field: err.details.split('`')[1],
      code: '?', // required, unique, ...
      message: err.details,
    });

    return new RequestError(null, null, err.details, extra);
  }
};

/**
 * NotFoundError
 *
 * throw new ERROR.NotFoundError()
 */

ERROR.NotFoundError = class NotFoundError extends ERROR.RequestError {
  constructor(message, extra) {
    super(404, 'NotFound', message || 'Not found', extra);
    this.name = 'NotFoundError';
  }
};

/**
 * UnauthenticatedError
 *
 * throw new ERROR.UnauthenticatedError()
 */

ERROR.UnauthenticatedError = class UnauthenticatedError extends ERROR.RequestError {
  constructor(message, extra) {
    super(401, 'Unauthenticated', message || 'Unauthenticated', extra);
    this.name = 'UnauthenticatedError';
  }
};

/**
 * UnauthorizedError
 *
 * throw new ERROR.UnauthorizedError()
 */

ERROR.UnauthorizedError = class UnauthorizedError extends ERROR.RequestError {
  constructor(message, extra) {
    super(403, 'Unauthorized', message || 'Unauthorized', extra);
    this.name = 'UnauthorizedError';
  }
};

/**
 * ValidationError
 *
 * throw new ERROR.ValidationError()
 * throw new ERROR.ValidationError('InvalidPayload', 'Invalid payload')
 * throw new ERROR.ValidationError(null, null, { issues: ['email', 'lastname']})
 */

ERROR.ValidationError = class ValidationError extends ERROR.RequestError {
  constructor(code, message, extra) {
    super(400, code || 'InvalidRequest', message || 'Invalid request', extra);
    this.name = 'ValidationError';
  }
};
