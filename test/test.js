'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var gitty = require('gitty');
var del = require('delete');
var copy = require('copy');
var mkdirp = require('mkdirp');
var isDirty = require('..');
var repo;

var cwd = __dirname;
var fixtures = path.resolve.bind(path, cwd, 'fixtures');
var project = path.resolve.bind(path, cwd, 'project');

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

  describe('untracked', function() {
    beforeEach(function(cb) {
      mkdirp(project(), function(err) {
        if (err) return cb(err);
        process.chdir(project());

        copy(fixtures('*.txt'), project(), function(err) {
          if (err) return cb(err);

          repo = gitty(process.cwd());
          repo.init(cb);
        });
      });
    });

    afterEach(function(cb) {
      process.chdir(cwd);
      del(project(), cb);
    });

    it('should return an object with an array of untracked files', function(cb) {
      isDirty(project(), function(err, status) {
        if (err) return cb(err);
        assert(status);
        assert(status.untracked);
        assert(Array.isArray(status.untracked));
        cb();
      });
    });

    it('should add files to a `file` property', function(cb) {
      isDirty(project(), function(err, status) {
        if (err) return cb(err);
        assert.equal(status.untracked[0], 'a.txt');
        assert.equal(status.untracked[1], 'b.txt');
        assert.equal(status.untracked[2], 'c.txt');
        cb();
      });
    });
  });

  describe('unstaged', function() {
    beforeEach(function(cb) {
      mkdirp(project(), function(err) {
        if (err) return cb(err);
        process.chdir(project());

        copy(['a.txt', 'b.txt', 'c.txt'], project(), {cwd: fixtures()}, function(err) {
          if (err) return cb(err);
          repo = gitty(process.cwd());
          repo.init(function(err) {
            if (err) return cb(err);
            repo.add(['.'], function(err) {
              if (err) return cb(err);
              repo.commit('first commit', function(err) {
                if (err) return cb(err);
                fs.writeFile('a.txt', 'zzz', {cwd: fixtures()}, cb);
              });
            });
          });
        });
      });
    });

    afterEach(function(cb) {
      process.chdir(cwd);
      del(project(), cb);
    });

    it('should return an object with an array of unstaged files', function(cb) {
      isDirty(project(), function(err, status) {
        if (err) return cb(err);
        assert(status);
        assert(status.unstaged);
        assert(Array.isArray(status.unstaged));
        cb();
      });
    });

    it('should add files to the `file` property', function(cb) {
      isDirty(project(), function(err, status) {
        if (err) return cb(err);
        assert.equal(status.unstaged[0].file, 'a.txt');
        cb();
      });
    });
  });

  describe('staged', function() {
    beforeEach(function(cb) {
      mkdirp(project(), function(err) {
        if (err) return cb(err);
        process.chdir(project());

        copy(fixtures('*.txt'), project(), function(err) {
          if (err) return cb(err);

          repo = gitty(process.cwd());
          repo.init(function(err) {
            if (err) return cb(err);
            repo.add(['.'], cb);
          });
        });
      });
    });

    afterEach(function(cb) {
      process.chdir(cwd);
      del(project(), cb);
    });

    it('should return an object with an array of objects', function(cb) {
      isDirty(project(), function(err, status) {
        if (err) return cb(err);
        assert(status);
        assert(status.staged);
        assert(Array.isArray(status.staged));
        cb();
      });
    });

    it('should add files to a `file` property', function(cb) {
      isDirty(project(), function(err, status) {
        if (err) return cb(err);
        assert.equal(status.staged[0].file, 'a.txt');
        assert.equal(status.staged[1].file, 'b.txt');
        assert.equal(status.staged[2].file, 'c.txt');
        cb();
      });
    });
  });

  describe('globs', function() {
    beforeEach(function(cb) {
      mkdirp(project(), function(err) {
        if (err) return cb(err);
        process.chdir(project());

        copy(fixtures('*.txt'), project(), function(err) {
          if (err) return cb(err);

          repo = gitty(process.cwd());
          repo.init(function(err) {
            if (err) return cb(err);
            repo.add(['.'], cb);
          });
        });
      });
    });

    afterEach(function(cb) {
      process.chdir(cwd);
      del(project(), cb);
    });

    it('should take an array of globs and return an array of matching "uncommitted" files', function(cb) {
      isDirty(project(), ['{a..c}.txt'], function(err, status) {
        if (err) return cb(err);
        assert(Array.isArray(status.matches));
        assert.equal(status.matches.length, 3);
        assert.equal(status.matches[0], 'a.txt');
        assert.equal(status.matches[1], 'b.txt');
        assert.equal(status.matches[2], 'c.txt');
        cb();
      });
    });

    it('should take a glob string and return an array of matching "uncommitted" files', function(cb) {
      isDirty(project(), '{a,c}.txt', function(err, status) {
        if (err) return cb(err);
        assert(Array.isArray(status.matches));
        assert.equal(status.matches.length, 2);
        assert.equal(status.matches[0], 'a.txt');
        assert.equal(status.matches[1], 'c.txt');
        cb();
      });
    });

    it('should return an empty array when nothing matches', function(cb) {
      isDirty(project(), ['*.js', '*.md'], function(err, status) {
        if (err) return cb(err);
        assert(Array.isArray(status.matches));
        assert.equal(status.matches.length, 0);
        cb();
      });
    });
  });
});
