'use strict'

var path = require('path');
var fs = require('fs');
var logger = require('log4js').getLogger();
var util = require('util');

// function names should match the action committed to the branch
// i.e.
// ping(payload, helper), push(payload, helper)
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
 * Function called when repo is pushed to
 *
 * @param payload - object from github
 * @param helper - helper object with customized functions (optional)
 */
exports.push = function(payload, helper){
    logger.info('Executing push function for %s repository', payload.repository.full_name);
};

/**
 * Function called when repo issue is created or destroyed, labeled
 *
 * @param payload - object from github
 * @param helper - helper object with customized functions (optional)
 */
exports.issues = function(payload, helper){
    logger.info('Executing issues function for %s repository', payload.repository.full_name);
};

/**
 * Function called when repo issue is commented on
 *
 * @param payload - object from github
 * @param helper - helper object with customized functions (optional)
 */
exports.issue_comment = function(payload, helper){
    logger.info('Executing issue_comment function for %s repository', payload.repository.full_name);
};

/**
 * Function called when repo member is added
 *
 * @param payload - object from github
 * @param helper - helper object with customized functions (optional)
 */
exports.member = function(payload, helper){
    logger.info('Executing member function for %s repository', payload.repository.full_name);
};


/**
 * Function called when repo is forked
 *
 * @param payload - object from github
 * @param helper - helper object with customized functions (optional)
 */
exports.fork = function(payload, helper){
    logger.info('Executing member function for %s repository', payload.repository.full_name);
};