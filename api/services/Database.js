'use strict'

const server = require('../../server')

/**
 * Database connection service
 * @type {{query: ((p1:String)), getConnection: (())}}
 */
module.exports = {

  /**
   * Performs database query using connection directly from pool. Returns query result as Promise
   * @param {String} query
   * @returns {Promise}
   */
  query: (query) => {
    return server.app.pool.query(query)
  },

  /**
   * Returns new connection from pool to perform operations with lock
   * @returns {Promise}
   */
  getConnection: () => {
    return server.app.pool.getConnection()
  }

}