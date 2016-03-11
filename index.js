/*!
 * is-dirty (https://github.com/jonschlinkert|jonschlinkert/is-dirty)
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var gitty = require('gitty');

module.exports = function isDirty(cwd, cb) {
  var fp = path.resolve(cwd, '.git');
  var repo = gitty(cwd);

  fs.stat(fp, function(err, stats) {
    if (err) return cb(err);

    repo.status(function(err, status) {
      if (err) return cb(err);
      if (hasFiles(status)) {
        cb(null, status);
      } else {
        cb(null, false);
      }
    });
  });
};

function hasFiles(status) {
  var types = ['staged', 'unstaged', 'untracked'];
  var len = types.length;
  var idx = -1;

  while (++idx < len) {
    var type = types[idx];
    if (status[type].length) {
      return true;
    }
  }
  return false;
}
