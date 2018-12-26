'use strict';

/** @module CONST */

const CONST = { ...require('starter-lib/dist/common/const') };

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
