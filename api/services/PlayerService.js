'use strict'

const db = require('./Database')
const mysql = require('promise-mysql')
const Boom = require('boom')

module.exports = {

  createPlayerTable: () => {
    return db.query('CREATE TABLE IF NOT EXISTS `player` (`playerId` CHAR(20) PRIMARY KEY UNIQUE KEY, `balance` INT)ENGINE=InnoDB DEFAULT CHARSET=utf8;')
      .then(() => {
        let sql = 'INSERT IGNORE INTO `player` (playerId, balance) VALUES ?'
        let values = [['p1', 0],['p2', 0],['p3', 0],['p4', 0],['p5', 0]]
        return db.query(mysql.format(sql, [values]))
      })
  },

  getBalance: (playerId) => {
    if(!playerId)
      return Promise.reject(Boom.internal('No playerId provided'))
    return db.query('SELECT * FROM player WHERE playerId=' + mysql.escape(playerId))
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
            if(balance <= 0)
              return conn.rollback()
                .then(() => Promise.reject(Boom.badData('Balance cannot be zero or lower')))
            return conn.query('UPDATE player SET balance=' + mysql.escape(balance) + ' WHERE playerId='+mysql.escape(playerId))
          })
          .then(() => conn.commit())
      })
      .catch(err => conn.rollback().then(() => Promise.reject(err)))
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
          .then(() => conn.commit())
        })
      .catch(err => conn.rollback()
        .then(() => Promise.reject(err)))
  },

  chargePlayers: (payers, deposit) => {
    if(!payers || payers.length === 0 || !deposit)
      return Promise.reject(Boom.internal('playerId, backers or deposit lost'))
    let amount = deposit/payers.length
    let conn = null
    return db.getConnection()
      .then(connection => {
        conn = connection
        return conn.beginTransaction()
      })
      .then(() => {
        return conn.query('SELECT * FROM player WHERE playerId IN (' + mysql.escape(payers) + ') FOR UPDATE')
      }).then(rows => {
        console.log('rows', rows)
        for (let r in rows)
          if(rows[r].balance - amount <= 0) {
            console.log(r)
            return conn.rollback().then(()=>Promise.reject(Boom.badData('Player '+ rows[r].playerId + ' have insufficient funds')))
          }

          //@todo charge players for required amount
        // return conn.query('UPDATE player SET balance ' + + ' WHERE playerId IN (' +
        //     mysql.escape(payers) +
        //     ')')
        return conn.rollback().then(() => Promise.resolve())
      })
  },



}