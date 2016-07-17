'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var gitty = require('gitty');
var del = require('delete');
var isDirty = require('./');
var repo;

var originalCwd = process.cwd();
var fixtures = path.resolve.bind(path, 'fixtures');

describe('is-dirty', function() {
  describe('API', function() {
    it('should export a function', function() {
      assert.equal(typeof isDirty, 'function');
    });

    it('should throw an error when invalid args are passed', function(cb) {
      try {
        isDirty();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected a callback function');
        cb();
      }
    });
  });

  describe('status', function() {
    beforeEach(function(cb) {
      process.chdir(fixtures());
      repo = gitty();

      repo.init(function(err) {
        if (err) return cb(err);
        repo.add(['.'], cb);
      });
    });

    afterEach(function(cb) {
      del(fixtures('.git'), function(err) {
        if (err) return cb(err);
        process.chdir(originalCwd);
        cb();
      });
    });
  });
});
