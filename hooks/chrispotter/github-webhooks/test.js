'use strict'

var path = require('path');
var fs = require('fs');
var logger = require('log4js').getLogger();
var util = require('util');
//function names should match the action committed to the branch i.e. ping(payload, helper), push(payload, helper)
var exports = module.exports = {};

/**
 * Function called when repo is pinged
 *
 * @param payload - object from github
 * @param helper - helper object with customized functions (optional)
 */
exports.ping = function(payload, helper){
    logger.info('Executing ping function for %s repository', payload.repository.full_name);
};

/**
 * Function called when repo is pinged
 *
 * @param payload - object from github
 * @param helper - helper object with customized functions (optional)
 */
exports.commit = function(payload, helper){
    logger.info('Executing commit function for %s repository', payload.repository.full_name);
}