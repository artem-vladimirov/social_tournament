'use strict'

const db = require('./Database')
const PlayerService = require('./PlayerService')
const mysql = require('promise-mysql')
const Boom = require('boom')

module.exports = {

  createTournamentTable: () => {
    return db.query('CREATE TABLE IF NOT EXISTS `tournament` (' +
        'tournamentId INT NOT NULL PRIMARY KEY UNIQUE KEY, ' +
        'prizePool INT, ' +
        'deposit INT, ' +
        'participants JSON)' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8;')
  },

  announceTournament: (tournamentId, deposit) => {
      return db.query('SELECT * FROM `tournament` WHERE tournamentId='+ mysql.escape(tournamentId))
        .then(found=>{
          if(found && found.length > 0)
            return reject(Boom.badRequest('Tournament already announced'))
          return db.query('INSERT INTO `tournament` (tournamentId, deposit, prizePool, participants) VALUES (' + mysql.escape(tournamentId) + ',' + mysql.escape(deposit) + '0, [])')
        })
  },

  joinTournament: (tournamentId, playerId, backers = []) => {
    return new Promise((resolve, reject)=>{
      if(!tournamentId || !playerId) return reject(Boom.badData('No id or deposit provided'))
      let conn = null
      db.getConnection().then(connection=>{
        conn = connection
        return conn.query('START TRANSACTION')
      }).then(()=>{
        return conn.query('SELECT * FROM tournament WHERE tournamentId='+mysql.escape(tournamentId)+' FOR UPDATE')
      }).then(rows=>{
        let tournament = rows[0]
        let participants = JSON.parse(tournament.participants) || []
        if(participants.find(((element)=>{return element.playerId === playerId}))) {
          conn.query('ROLLBACK')
          return reject(Boom.badData('Player '+ playerId +' already joined this tournament'))
        }
        //checking if backers are use to join the tournament - then
        if(backers && backers.length>0) {
          PlayerService.takeFromBackers(playerId, backers, tournament.deposit)
              .then(()=>{
                participants.push({playerId: playerId, backers: backers})
                let prizePool = tournament.prizePool + tournament.deposit
                let query = 'UPDATE tournament SET ? WHERE tournamentId='+mysql.escape(tournamentId)
                let values = {tournamentId: tournamentId,
                  participants: JSON.stringify(participants),
                  prizePool: prizePool,
                  deposit: tournament.deposit}
                return conn.query(query, values)
              })
              .catch((err)=>{
                conn.query('ROLLBACK')
                return reject(err)
              })
        } else {

        }
      }).then(()=>{
        conn.query('COMMIT')
        return resolve()
      }).catch(err=>{
        conn.query('ROLLBACK')
        return reject(err)
      })
    })
  },

  resultTournament: (tournamentId) => {

  },

  takeFromBackers: (playerId, backers, deposit) => {
    return new Promise((resolve, reject)=>{
      if(!playerId || !backers || !deposit) return reject(Boom.internal('playerId, backers or deposit lost'))
      let payers = backers.concat(playerId)
      let takeAmount = deposit/(payers.length)
      let backersFunc = payers.map((payer) => { return PlayerService.takePoints(payer, takeAmount)})
      Promise.all(backersFunc).then((data) => {
        return resolve()
      }, (err) => {
        return reject(err)
      })
    })

  }
}