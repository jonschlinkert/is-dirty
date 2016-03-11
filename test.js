'use strict';

require('mocha');
var assert = require('assert');
var isDirty = require('./');

describe('is-dirty', function() {
  it('should export a function', function() {
    assert.equal(typeof isDirty, 'function');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      isDirty();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'Path must be a string. Received undefined');
      cb();
    }
  });
});
