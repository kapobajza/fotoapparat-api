/* eslint-disable no-unused-vars */
'use strict';

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable('users', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true },
    email: { type: 'string', notNull: true, unique: true },
    first_name: 'string',
    last_name: 'string'
  });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1
};
