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
    if(!tournamentId || !deposit)
      return Promise.reject(Boom.badData('No id or deposit provided'))
    let conn = null
    return db.getConnection()
      .then(connection=>{
        conn = connection
        return conn.query('SELECT * FROM `tournament` WHERE tournamentId='+ mysql.escape(tournamentId))
          .then(found=>{
            if(found && found.length > 0)
              return Promise.reject(Boom.badRequest('Tournament already announced'))
            return conn.query('INSERT INTO `tournament` (tournamentId, deposit, prizePool, participants) VALUES (' + mysql.escape(tournamentId) + ',' + mysql.escape(deposit) + '0, JSON_ARRAY())')
          })
      })

  },

  joinTournament: (tournamentId, playerId, backers = []) => {
      if(!tournamentId || !playerId)
        return Promise.reject(Boom.badData('No tournamentId or playerId provided'))
      let conn = null
      return db.getConnection()
        .then(connection=>{
          conn = connection
          return conn.beginTransaction()
        })
        .then(() => conn.query('SELECT * FROM tournament WHERE tournamentId='+mysql.escape(tournamentId)+' FOR UPDATE'))
        .then(rows => {
          let tournament = rows[0]
          console.log('tournament', tournament)
          let participants = JSON.parse(tournament.participants) || []
          if(participants.find(((element)=>{return element.playerId === playerId}))) {
            return conn.rollback()
              .then(() => Promise.reject(Boom.badData('Player '+ playerId +' already joined this tournament')))
          }
          return PlayerService.chargePlayers(backers.concat(playerId), tournament.deposit)
            .then(()=>{
              console.log('chargePlayers')
              participants.push({playerId: playerId, backers: backers})
              let prizePool = tournament.prizePool + tournament.deposit
              let query = 'UPDATE tournament SET ? WHERE tournamentId=' + mysql.escape(tournamentId)
              let values = {tournamentId: tournamentId,
                participants: JSON.stringify(participants),
                prizePool: prizePool,
                deposit: tournament.deposit}
              return conn.query(query, values)
            })
        })
        .then(()=>conn.commit())
        .catch(err => conn.rollback()
          .then(() => Promise.reject(err)))
  },

  resultTournament: (tournamentId) => {

  },


}