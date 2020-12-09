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
  return db.createTable('auth', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true },
    user_id: {
      type: 'int',
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: 'auth_user_id_foreign_key',
        table: 'users',
        mapping: 'id',
        rules: { onDelete: 'CASCADE', }
      }
    },
    refresh_token: { type: 'string', notNull: true },
    expires_at: { type: 'int', notNull: true, unsigned: true }
  });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1
};
