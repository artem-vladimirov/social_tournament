'use strict'

const mysql = require('promise-mysql')
/**
 * Database connection service
 * @type {{query: ((p1:String)), getConnection: (())}}
 */
module.exports = (server) => {

  return {
    /**
     * Performs database query using connection directly from pool. Returns query result as Promise
     * @param {String} query
     * @returns {Promise}
     */
    query: (query) => {
      return server.pool.query(query)
    },

    /**
     * Returns new connection from pool to perform operations with lock
     * @returns {Promise}
     */
    getConnection: () => {
      return server.pool.getConnection()
    },
    /**
     * Returns new connection from pool to perform operations with lock
     * @returns {Promise}
     */
    releaseConnection: (connection) => {
      return server.pool.releaseConnection(connection)
    },

    /**
     * Removes tables
     * @returns {Promise}
     */
    dropTables: () => {
      return Promise.all([
        server.pool.query('DROP TABLE IF EXISTS `player`'),
        server.pool.query('DROP TABLE IF EXISTS `tournament`')
      ])
    }
  }
}
