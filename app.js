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
          return
        }
        //audit organization hooks
        helpers.auditHooks(ghorg, 'Organization', user_name, app.locals);
      });
      return
    }
    helpers.getDirectories(user_name).forEach(function(repo_name){
        var ghrepo = client.repo(user_name + '/' + repo_name);
        //audit repository hooks
        helpers.auditHooks(ghrepo, "Repositiory", util.format("%s/%s",user_name, repo_name), app.locals);
      }
    );
  });

});

// middleware
/////////////

var githubMiddleware = require('github-webhook-middleware')({
  secret: app.locals.GITHUB_HOOK_SECRET
});

app.post(app.locals.GITHUB_HOOK_ROUTE, githubMiddleware, function(req, res) {
  var payload = req.body;
  helpers.processPayload(payload, app.locals, req.headers['x-github-event']);

  res.send('Hooks');
});

//start server
server.listen(app.locals.PORT, function() {
  logger.info('%s listening on %s:%s',
    app.locals.TITLE,
    server.address().address,
    server.address().port);
});