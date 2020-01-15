/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabFile = require('./lib/fabfile');
const FabUser = require('./lib/fabuser');
const FabSale = require('./lib/fabsale');

module.exports.FabFile = FabFile;
module.exports.FabUser = FabUser;
module.exports.FabSale = FabSale;

module.exports.contracts = [ FabFile, FabUser, FabSale ];