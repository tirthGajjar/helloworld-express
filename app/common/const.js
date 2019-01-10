'use strict';

/** @module CONST */

const CONST = { ...require('starter-lib/dist/common/const') };

CONST.DATE_REGEXP = /^\d{4}-\d{2}-\d{2}$/;

CONST.TIME_REGEXP = /^\d{2}:\d{2}$/;

CONST.AUDIENCE = Object.freeze({
  ADMIN: CONST.ROLE.ADMIN,
  CLIENT: CONST.ROLE.CLIENT,
});

CONST.AUDIENCE_TO_ROLES = {
  [CONST.AUDIENCE.ADMIN]: [CONST.ROLE.ADMIN],
  [CONST.AUDIENCE.CLIENT]: [CONST.ROLE.CLIENT],
};

CONST.ROLE_TO_ROLES = {
  [CONST.ROLE.ADMIN]: [CONST.ROLE.ADMIN, CONST.ROLE.CLIENT],
  [CONST.ROLE.CLIENT]: [CONST.ROLE.CLIENT],
};

module.exports = Object.freeze(CONST);
