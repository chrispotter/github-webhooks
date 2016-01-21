var _ = require('lodash');
var express = require('express');
var github = require('../octonode/lib/octonode.js');
var app = express();
var server = require('http').Server(app);
var logger = require('log4js').getLogger();
var fs = require('fs');
var util = require('util');
var helpers = require('./lib/helpers.js');

// read configuration from config.json, export to app.locals
process.env['ENV_VAR_CONFIG_FILE'] = process.env['ENV_VAR_CONFIG_FILE'] ||
  'config.json';
_.assign(app.locals, require('var'));

var client = github.client(app.locals.GITHUB_TOKEN);

// change into hooks listing directory
try {
  fs.accessSync(app.locals.APP_WORKDIR, fs.W_OK | fs.X_OK);
  process.chdir(app.locals.APP_WORKDIR);
  logger.info('set CWD to %s', app.locals.APP_WORKDIR);
} catch(e) {
  logger.warn(e.message);
  logger.error("could not write to APP_WORKDIR - %s", app.locals.APP_WORKDIR);
  process.exit(1);
}

var user_directories = helpers.getDirectories('.');
user_directories.forEach(function(user_name){
  var ghuser = client.user(user_name);
  var organization = false;
  ghuser.info(function(err, data, headers){
    if(err){
      logger.error('%s user error: %s', user_name, err['message']);
      return
    }
    if(data.type == "Organization"){
      logger.warn('%s is an organization', user_name);
      var ghorg = client.org(user_name);
      ghorg.info(function(err, data, headers){
        if(err){
          logger.error('%s organization error: %s', user_name, err['message']);
        }
        //see if organization has any hooks
        ghorg.hooks(function(err, data, headers){
          if(err){
            logger.error('%s Hooks Error: %s', user_name, err['message']);
            return;
          }
          var hookfound = false;
          data.forEach(function(hook){
            if(hook.config.url == app.locals.GITHUB_HOOK_ROUTE){
              //found repohook
              hookfound = true;
            }
          });
          if(hookfound){
            logger.info('Hook found for org:%s', user_name);
            return;
          }
          logger.info('Hook not found for org:%s', user_name);
          logger.info('Creating Hook for org:%s', user_name);
          ghorg.hook({
            "name": "web",
            "active": true,
            "events": ["*"],
            "config": {
              "url": app.locals.GITHUB_HOOK_ROUTE,
              "content_type": "json"
            }
          },function(err, data, headers){
            if(err){
              logger.warn('%s Hooks Error: %s', user_name, err['message']);
              return;
            }
            logger.info('Created Hook for org:%s', user_name);
          });
        });
      });
      return
    }
    helpers.getDirectories(user_name).forEach(function(repo_name){
        var ghrepo = client.repo(user_name + '/' + repo_name);
        ghrepo.hooks(function(err, data, headers){
          if(err){
            logger.warn('%s/%s Hooks Error: %s', user_name, repo_name, err['message']);
            return;
          }
          var hookfound = false;
          data.forEach(function(hook){
            if(hook.config.url == app.locals.GITHUB_HOOK_ROUTE){
              //found repohook
              hookfound = true;
            }
          });
          if(hookfound){
            logger.warn('Hook found for repo:%s/%s', user_name, repo_name);
            return;
          }
          logger.info('Hook not found for repo:%s/%s', user_name, repo_name);
          logger.info('Creating Hook for repo:%s/%s', user_name, repo_name);
          ghrepo.hook({
            "name": "web",
            "active": true,
            "events": ["*"],
            "config": {
              "url": app.locals.GITHUB_HOOK_ROUTE,
              "secret": app.locals.GITHUB_HOOK_SECRET,
              "content_type": "json"
            }
          }, function(err, data, headers){
            if(err){
              logger.warn('%s/%s Hooks Error: %s', user_name, repo_name, err['message']);
              return;
            }
            logger.info('Created Hook for repo:%s/%s', user_name, repo_name);
          });

        });
      }
    );
  });
  if(!organization){
    return;
  }
});

app.get('/hooks', function(req,res) {
  res.send('Hooks');
  client.get('/user', {}, function (err, status, body, headers) {
    console.log(body); //json object
  });
});

//start server
server.listen(app.locals.PORT, function() {
  logger.info('%s listening on %s:%s',
    app.locals.TITLE,
    server.address().address,
    server.address().port);
});