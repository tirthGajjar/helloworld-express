'use strict';

/** @module CONST */

const CONST = { ...require('starter-lib/dist/common/const') };

CONST.ROLES_MAPPING = {
  [CONST.ROLE.ADMIN]: [CONST.ROLE.ADMIN, CONST.ROLE.CLIENT],
  [CONST.ROLE.CLIENT]: [CONST.ROLE.CLIENT],
};

module.exports = Object.freeze(CONST);
