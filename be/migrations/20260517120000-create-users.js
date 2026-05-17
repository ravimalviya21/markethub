'use strict';

var fs = require('fs');
var path = require('path');

exports.up = function (db) {
  var filePath = path.join(__dirname, 'sqls', '20260517120000-create-users-up.sql');
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
};

exports.down = function (db) {
  var filePath = path.join(__dirname, 'sqls', '20260517120000-create-users-down.sql');
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
};

exports._meta = { version: 1 };
