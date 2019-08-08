'use strict';

/** @module common/error */

const ERROR = require('helloworld-lib/dist/common/error');

module.exports = ERROR;

const WATERLINE_ERRORS = [
  {
    message: 'Could not use specified `title`.  Cannot set "" (empty string) for a required attribute.',
  },
  {
    message: 'Missing value for required attribute `image_uri`.  Expected a string, but instead, got: undefined',
  },
];

/**
 * InvalidRequestError
 *
 * @example throw new ERROR.InvalidRequestError()
 * @example throw new ERROR.InvalidRequestError(400, 'InvalidRequest', 'Invalid request', {})
 */

ERROR.InvalidRequestError = class InvalidRequestError extends ERROR.FailureError {
  constructor(status, code, message, extra) {
    super(code || 'InvalidRequest', message || 'Invalid request', extra);
    this.name = 'InvalidRequestError';
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

    return new InvalidRequestError(null, null, err.details, extra);
  }
};

/**
 * ValidationError
 *
 * @example throw new ERROR.ValidationError()
 * @example throw new ERROR.ValidationError('InvalidPayload', 'Invalid payload')
 * @example throw new ERROR.ValidationError(null, null, { issues: ['email', 'name']})
 */

ERROR.ValidationError = class ValidationError extends ERROR.InvalidRequestError {
  constructor(code, message, extra) {
    super(400, code || 'InvalidRequest', message || 'Invalid request', extra);
    this.name = 'ValidationError';
  }
};

/**
 * InvalidCredentialsError
 *
 * @example throw new ERROR.InvalidCredentialsError()
 */

ERROR.InvalidCredentialsError = class InvalidCredentialsError extends ERROR.InvalidRequestError {
  constructor(message, extra = null) {
    super(400, 'InvalidCredentials', message || 'Invalid credentials', extra);
    this.name = 'InvalidCredentialsError';
  }
};

/**
 * UnauthenticatedError
 *
 * @example throw new ERROR.UnauthenticatedError()
 */

ERROR.UnauthenticatedError = class UnauthenticatedError extends ERROR.InvalidRequestError {
  constructor(message, extra = null) {
    super(401, 'Unauthenticated', message || 'Unauthenticated', extra);
    this.name = 'UnauthenticatedError';
  }
};

/**
 * UnauthorizedError
 *
 * @example throw new ERROR.UnauthorizedError()
 */

ERROR.UnauthorizedError = class UnauthorizedError extends ERROR.InvalidRequestError {
  constructor(message, extra = null) {
    super(403, 'Unauthorized', message || 'Unauthorized', extra);
    this.name = 'UnauthorizedError';
  }
};

/**
 * NotFoundError
 *
 * @example throw new ERROR.NotFoundError()
 */

ERROR.NotFoundError = class NotFoundError extends ERROR.InvalidRequestError {
  constructor(message, extra = null) {
    super(404, 'NotFound', message || 'Not found', extra);
    this.name = 'NotFoundError';
  }
};
