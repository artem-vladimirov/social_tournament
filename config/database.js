'use strict'

/**
 * Database configuration object
 * @type {{connection: {host: string, user: string, port: string, password: string, database: string}}}
 */
module.exports = {
  connection: {
    dev: {
      host: 'localhost',
      user: 'root',
      port: '3306',
      password: '',
      database: 'social_tournament',
      connectTimeout: 60000
    },
    prod: {
      host: 'db',
      user: 'root',
      port: '3306',
      password: '',
      database: 'social_tournament',
      connectTimeout: 60000
    }
  }
}