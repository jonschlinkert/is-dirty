'use strict';

var isDirty = require('./');

isDirty(process.cwd(), function(err, status) {
  console.log(err, status);
});
