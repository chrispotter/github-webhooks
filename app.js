var _ = require('lodash');
var express = require('express');
var github = require('octonode');
var app = express();
var server = require('http').Server(app);
var logger = require('log4js').getLogger();
var fs = require('fs');
var util = require('util');

var client = github.client(app.locals.GITHUB_TOKEN);

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
function processRepoDirectories(err, stats){
  stats.forEach(loopRepoFolders.bind({'client':this['client']}));
}
function processUserDirectories(err, stats){
  stats.forEach(loopUserFolders);
}

// read configuration from config.json, export to app.locals
process.env['ENV_VAR_CONFIG_FILE'] = process.env['ENV_VAR_CONFIG_FILE'] ||
  'config.json';
_.assign(app.locals, require('var'));

app.get('/hooks', function(req,res) {
  res.send('Hooks');
  client.get('/user', {}, function (err, status, body, headers) {
    console.log(body); //json object
  });
});
app.get('/*', function(req,res) {
  fs.readdir('./hooks', processUserDirectories);
});
//start server
server.listen(app.locals.PORT, function() {
  logger.info('%s listening on %s:%s',
    app.locals.TITLE,
    server.address().address,
    server.address().port);
});
