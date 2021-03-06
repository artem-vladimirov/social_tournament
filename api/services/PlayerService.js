'use strict'

const mysql = require('promise-mysql')
const Boom  = require('boom')

/**
 * Player database operations
 * @type {{createPlayerTable: (()), getBalance: ((p1:String)), takePoints: ((p1:String, p2:Number)), fundPoints: ((p1:String, p2:Number))}}
 */
module.exports = (server) => {
  return {
    /**
     * Creates MySQL table for `player` records and adds 5 default players
     * @returns {Promise}
     */
    createPlayerTable: () => {
      return server.services.Database.query('CREATE TABLE IF NOT EXISTS `player` (' +
          'playerId CHAR(20) PRIMARY KEY UNIQUE KEY, ' +
          'balance INT)' +
          'ENGINE=InnoDB DEFAULT CHARSET=utf8;')
        .then(() => {
          let sql = 'INSERT IGNORE INTO `player` (playerId, balance) VALUES ?'
          let values = [['P1', 0],['P2', 0],['P3', 0],['P4', 0],['P5', 0]]
          return server.services.Database.query(mysql.format(sql, [values]))
        })
    },

    /**
     * Returns player object with specific ID
     * @param {String} playerId
     * @returns {Promise}
     */
    getBalance: (playerId) => {
      if(!playerId)
        return Promise.reject(Boom.internal('No playerId provided'))
      return server.services.Database.query('SELECT * FROM player WHERE playerId=' + mysql.escape(playerId))
          .then(players => {
            if(!players || players.length === 0)
              return Promise.reject(Boom.notFound('Player' + playerId + ' not found'))
            return Promise.resolve(players)
          })
    },

    /**
     * Withdraw points from player balance
     * @param {String} playerId
     * @param {Number} points
     * @returns {Promise}
     */
    takePoints: (playerId, points) => {
      if(!playerId || !points)
        return Promise.reject(Boom.internal('playerId or points are not provided'))
      let conn = null
      return server.services.Database.getConnection()
        .then(connection => {
          conn = connection
          return conn.beginTransaction()
            .then(() => conn.query('SELECT * FROM player WHERE playerId='+mysql.escape(playerId)+' FOR UPDATE'))
            .then(rows => {
              let balance = rows[0].balance - points
              if(balance <= 0)
                return Promise.reject(Boom.badData('Balance cannot be zero or lower'))
              return conn.query('UPDATE player SET balance=' + mysql.escape(balance) + ' WHERE playerId='+mysql.escape(playerId))
            })
            .then(() => conn.commit().then(() => server.services.Database.releaseConnection(conn)))
        })
        .catch(err => conn.rollback().then(() => server.services.Database.releaseConnection(conn)).then(() => Promise.reject(err)))
    },

    /**
     * Add points t player balance
     * @param {String} playerId
     * @param {Number} points
     * @returns {Promise}
     */
    fundPoints: (playerId, points) => {
      if(!playerId || !points)
        return Promise.reject(Boom.internal('playerId or points are not provided'))
      let conn = null
      return server.services.Database.getConnection()
        .then(connection=>{
          conn = connection
          return conn.beginTransaction()
          .then(() => conn.query('SELECT * FROM player WHERE playerId='+mysql.escape(playerId)+' FOR UPDATE'))
          .then(rows => {
            let balance = rows[0].balance + points
            return conn.query('UPDATE player SET balance=' + mysql.escape(balance) + ' WHERE playerId='+mysql.escape(playerId))
          })
          .then(() => conn.commit().then(() => server.services.Database.releaseConnection(conn)))
          })
        .catch(err => conn.rollback().then(() => server.services.Database.releaseConnection(conn))
          .then(() => Promise.reject(err)))
    }
  }
}

