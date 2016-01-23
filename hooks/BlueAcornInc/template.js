/**
 * Created by chrispotter on 1/22/16.
 */

'use strict'

var path = require('path');
var fs = require('fs');
var logger = require('log4js').getLogger();
var util = require('util');

/**
 * @param payload - object from github
 * @param helper - helper object with customized functions (optional)
 */

module.exports = run;

var run = function(payload, helper){
    logger.info('Execute function for %s Organization', payload.organization.login);
};