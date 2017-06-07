'use strict'

const db = require('./Database')
const mysql = require('promise-mysql')
const Boom = require('boom')

module.exports = {
  createPlayerTable: () => {
    return new Promise((resolve, reject)=>{
      db.query('CREATE TABLE IF NOT EXISTS `player` (`playerId` CHAR(20) PRIMARY KEY UNIQUE KEY, `balance` INT)ENGINE=InnoDB DEFAULT CHARSET=utf8;')
        .then(res => {
          let sql = 'INSERT IGNORE INTO `player` (playerId, balance) VALUES ?'
          let values = [['p1', 0],['p2', 0],['p3', 0],['p4', 0],['p5', 0]]
          db.query(mysql.format(sql, [values])).then(res => {
            console.log('created players:', res)
            resolve(res)
          }).catch(err => {reject(err)})
        })
        .catch(err => {reject(err)})
    })
  },

  getBalance: (playerId) => {
    return new Promise((resolve, reject) => {
      if(!playerId) return reject(Boom.internal('No playerId provided'))
      db.query('SELECT * FROM player WHERE playerId=' + mysql.escape(playerId) )
        .then(players => {return resolve(players[0])})
        .catch(err => {reject(Boom.internal(err))})
    })
  },

  getPlayers: (array) => {
    return new Promise((resolve, reject) => {
      if(!array) return reject(Boom.internal('Players array not provided'))
      db.query('SELECT * FROM player WHERE playerId IN' + mysql.escape(playerId) )
          .then(players => {return resolve(players[0])})
          .catch(err => {reject(Boom.internal(err))})
    })
  },

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
            return conn.query('UPDATE player SET balance=' + mysql.escape(balance) + ' WHERE playerId='+mysql.escape(playerId))
          })
          .then(() => conn.query('COMMIT'))
      })
      .catch(err => conn.query('ROLLBACK')
          .then(() => Promise.reject(err)))
  },

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
            .then(() => conn.query('COMMIT'))
          })
        .catch(err => conn.query('ROLLBACK')
            .then(() => Promise.reject(err)))
  },


}