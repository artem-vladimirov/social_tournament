'use strict'

const db    = require('./Database')
const mysql = require('promise-mysql')
const Boom  = require('boom')

/**
 * Player database operations
 * @type {{createPlayerTable: (()), getBalance: ((p1:String)), takePoints: ((p1:String, p2:Number)), fundPoints: ((p1:String, p2:Number))}}
 */
module.exports = {

  /**
   * Creates MySQL table for `player` records
   * @returns {Promise}
   */
  createPlayerTable: () => {
    return db.query('CREATE TABLE IF NOT EXISTS `player` (`playerId` CHAR(20) PRIMARY KEY UNIQUE KEY, `balance` INT)ENGINE=InnoDB DEFAULT CHARSET=utf8;')
      .then(() => {
        let sql = 'INSERT IGNORE INTO `player` (playerId, balance) VALUES ?'
        let values = [['p1', 0],['p2', 0],['p3', 0],['p4', 0],['p5', 0]]
        return db.query(mysql.format(sql, [values]))
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
    return db.query('SELECT * FROM player WHERE playerId=' + mysql.escape(playerId))
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
    return db.getConnection()
      .then(connection => {
        conn = connection
        return conn.beginTransaction()
          .then(() => conn.query('SELECT * FROM player WHERE playerId='+mysql.escape(playerId)+' FOR UPDATE'))
          .then(rows => {
            let balance = rows[0].balance - points
            if(balance <= 0)
              return conn.rollback()
                .then(() => Promise.reject(Boom.badData('Balance cannot be zero or lower')))
            return conn.query('UPDATE player SET balance=' + mysql.escape(balance) + ' WHERE playerId='+mysql.escape(playerId))
          })
          .then(() => conn.commit())
      })
      .catch(err => conn.rollback().then(() => Promise.reject(err)))
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
    return db.getConnection()
      .then(connection=>{
        conn = connection
        return conn.beginTransaction()
        .then(() => conn.query('SELECT * FROM player WHERE playerId='+mysql.escape(playerId)+' FOR UPDATE'))
        .then(rows => {
          let balance = rows[0].balance + points
          return conn.query('UPDATE player SET balance=' + mysql.escape(balance) + ' WHERE playerId='+mysql.escape(playerId))
        })
        .then(() => conn.commit())
        })
      .catch(err => conn.rollback()
        .then(() => Promise.reject(err)))
  }
}
