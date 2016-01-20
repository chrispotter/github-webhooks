var _ = require('lodash');
var express = require('express');
var github = require('octonode');
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

// // change into hooks listing directory
try {
  fs.accessSync(app.locals.APP_WORKDIR, fs.W_OK | fs.X_OK);
  process.chdir(app.locals.APP_WORKDIR);
  logger.info('set CWD to %s', app.locals.APP_WORKDIR);
} catch(e) {
  logger.warn(e.message);
  logger.error("could not write to APP_WORKDIR - %s", app.locals.APP_WORKDIR);
  process.exit(1);
}

app.get('/hooks', function(req,res) {
  res.send('Hooks');
  client.get('/user', {}, function (err, status, body, headers) {
    console.log(body); //json object
  });
});
app.get('/*', function(req,res) {
  var user_directories = helpers.getDirectories('.');
  user_directories.forEach(function(user_name){
    helpers.getDirectories(user_name).forEach(function(repo_name){
        var ghrepo = client.repo(user_name + '/' + repo_name);
        ghrepo.hooks(function(err, data, headers){
          if(err){
            logger.warn('%s Hooks Error: %s', repo_name, err['message']);
            return;
          }
          data.forEach(function(hook){
            console.log(hook.config.url)
          })

          // console.log(util.inspect(data));
        });
        console.log(util.format('%s/%s', user_name, repo_name));
      }
    );
  })
});
//start server
server.listen(app.locals.PORT, function() {
  logger.info('%s listening on %s:%s',
    app.locals.TITLE,
    server.address().address,
    server.address().port);
});



function loopUserFolders(user_dir){
  var ghuser = client.user(user_dir);
  ghuser.info(processuser.bind({'client': ghuser}));
}

function loopRepoFolders(repo_dir){
  var ghrepo = client.repo(this['client']['login'] + '/' + repo_dir);
  ghrepo.info(processrepos.bind({'client': this['client'], 'repo': ghrepo}));
}

function processuser(err, data, headers){
  if(!err){
    fs.readdir('./hooks/'+this['client']['login'], processRepoDirectories.bind({'client':this['client']}));
  }
}
function processrepos(err, data, headers){
  console.log(this['client']['login']);
  console.log(this['repo']['name']);
  if(!err){
    console.log('data: ' + util.inspect(data, false, null));
  }
  else{
    // console.log(this);
    console.log(err);
    // console.log('data: ' + util.inspect(data, false, null));
  }
}
function processRepoDirectories(err, files){
  files.forEach(loopRepoFolders.bind({'client':this['client']}));
}
function processUserDirectories(err, files){
  //ensure that these are folders and not just files
  files.forEach(loopUserFolders);
}
