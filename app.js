var _ = require('lodash');
var express = require('express');
var github = require('octonode');
var app = express();
var server = require('http').Server(app);
var logger = require('log4js').getLogger();
var fs = require('fs');
var util = require('util');

// read configuration from config.json, export to app.locals
process.env['ENV_VAR_CONFIG_FILE'] = process.env['ENV_VAR_CONFIG_FILE'] ||
  'config.json';
_.assign(app.locals, require('var'));

var client = github.client(app.locals.GITHUB_TOKEN);

app.get('/hooks', function(req,res) {
  res.send('Hooks');
  client.get('/user', {}, function (err, status, body, headers) {
    console.log(body); //json object
  });
});

app.get('/*', function(req,res) {
  var gituser, gitrepo;
  fs.readdir('./hooks', function(err, stats){
    stats.forEach(function(user_dir){
      ghuser = client.user(user_dir);
      ghuser.info(function(err, data, headers) {
        if(!err){
          fs.readdir('./hooks/'+user_dir, function(err, stats){
            stats.forEach(function(repo_dir){
              ghrepo = client.repo(user_dir + '/' + repo_dir);
              ghrepo.info(function(repoerr, repodata, repoheaders){
                if(!repoerr){
                  console.log('data: ' + util.inspect(repodata, false, null));
                }
                else{
                  console.log(repoerr);
                }
              });
            });
          });
        }
      });
      // ghuser.orgs(function(err, data, headers){
      //   console.log('error: ' + err);
      //   console.log('data: ' + util.inspect(data, false, null));
      //   console.log('headers: ' + headers);
      // });
    });
  });
});

//start server
server.listen(app.locals.PORT, function() {
  logger.info('%s listening on %s:%s',
    app.locals.TITLE,
    server.address().address,
    server.address().port);
})
