'use strict'

var path = require('path');
var fs = require('fs');

var exports = module.exports = {};

//limit readdir to subdirectories
exports.getDirectories =  function (srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
};
