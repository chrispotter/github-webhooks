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

//limit readdir to subdirectories
exports.getFiles =  function (srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isFile();
  });
};

//  process and determine whether payload is for Organization
//  or a repository
exports.processPayload = function (payload, config, action) {
  if(payload.organization){
    logger.info('payload is for the organization: %s', payload.organization);
    this.getFiles(payload.organization.login).forEach(function(file){
      require(util.format("%s/%s",payload.organization.login, file))(payload, this);
    })
  }else if(payload.repository){
    logger.info('payload is for the repository: %s', payload.repository.full_name);
    this.getFiles(payload.repository.full_name).forEach(function(file){
      var module = require(util.format(
          ".%s/%s/%s",
          config.APP_WORKDIR,
          payload.repository.full_name,
          file)
      );
      //if action exists on the module, run it
      if(module[action]){
        module[action](payload, this);
      }//(payload, this);
    })
  }else{
    logger.info('payload is a mystery')
  }

};

exports.auditHooks = function (ghEntity, type, name, config) {
  ghEntity.hooks(function(err, data, headers){
    if(err){
      logger.warn('%s %s error: %s', name, type, err['message']);
      return;
    }
    var hookfound = false;
    data.forEach(function(hook){
      if(hook.config.url == util.format("%s%s",config.BASEURL, config.GITHUB_HOOK_ROUTE)){
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
