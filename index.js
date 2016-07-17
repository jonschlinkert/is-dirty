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
var mm = require('micromatch');

module.exports = function isDirty(cwd, patterns, cb) {
  if (typeof patterns === 'function') {
    cb = patterns;
    patterns = null;
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected a callback function');
  }

  if (typeof cwd !== 'string') {
    cwd = process.cwd();
  }

  var fp = path.resolve(cwd, '.git');
  var repo = gitty(cwd);

  fs.stat(fp, function(err, stats) {
    if (err) {
      cb(err);
      return;
    }

    repo.status(function(err, status) {
      if (err) {
        cb(err);
        return;
      }

      if (hasFiles(status)) {
        status.matches = [];

        if (patterns) {
          cb(null, getMatches(cwd, patterns, status));
        } else {
          cb(null, status);
        }

      } else {
        cb();
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

function getMatches(cwd, patterns, status) {
  if (status.staged.length) {
    status.matches = mm(pluckFiles(status.staged), patterns);
  }
  if (status.unstaged.length) {
    status.matches = status.matches.concat(mm(pluckFiles(status.unstaged), patterns));
  }
  if (status.untracked.length) {
    status.matches = status.matches.concat(mm(status.untracked, patterns));
  }
  status.matches = status.matches.map(function(filename) {
    return path.relative(cwd, path.resolve(cwd, filename));
  });
  return status;
}

function pluckFiles(arr) {
  var res = [];
  var len = arr.length;
  var idx = -1;
  while (++idx < len) {
    var val = arr[idx];
    if (val.status !== 'deleted') {
      res.push(val.file);
    }
  }
  return res;
}
