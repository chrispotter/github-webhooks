'use strict'

var path = require('path');
var fs = require('fs');
var logger = require('log4js').getLogger();
var util = require('util');

var exports = module.exports = {};

//limit readdir to subdirectories
exports.getDirectories =  function (srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
};

exports.auditHooks = function (ghEntity, type, name, config) {
  ghEntity.hooks(function(err, data, headers){
    if(err){
      logger.warn('%s %s error: %s', name, type, err['message']);
      return;
    }
    var hookfound = false;
    data.forEach(function(hook){
      if(hook.config.url == config.GITHUB_HOOK_ROUTE){
        //found repohook
        hookfound = true;
      }
    });
    if(hookfound){
      logger.warn('Hook found for %s:%s',type,  name);
      return;
    }
    logger.info('Hook not found for %s:%s', type, name);
    logger.info('Creating Hook for %s:%s', type, name);
    ghEntity.hook({
      "name": "web",
      "active": true,
      "events": ["*"],
      "config": {
        "url": util.format("%s%s",config.BASEURL, config.GITHUB_HOOK_ROUTE),
        "secret": config.GITHUB_HOOK_SECRET,
        "content_type": "json"
      }
    }, function(err, data, headers){
      if(err){
        logger.warn('%s Hooks Error: %s', name, err['message']);
        return;
      }
      logger.info('Created Hook for %s:%s',type, name);
    });

  });
};
