'use strict'

const db = require('./Database')
const mysql = require('promise-mysql')
const Boom = require('boom')


/**
 * Tournament database operations
 * @type {{createTournamentTable: (()), announceTournament: ((p1:Number, p2:Number)), joinTournament: ((p1:Number, p2:String, p3?:Array)), resultTournament: ((p1:Number, p2?:Array))}}
 */
module.exports = {

  /**
   * Creates MySQL table for tournament records
   * @returns {Promise}
   */
  createTournamentTable: () => {
    return db.query('CREATE TABLE IF NOT EXISTS `tournament` (' +
        'tournamentId INT NOT NULL PRIMARY KEY UNIQUE KEY, ' +
        'prizePool INT, ' +
        'deposit INT, ' +
        'participants JSON,' +
        'winners JSON)' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8;')
  },

  /**
   * Announcing new tournament with player's deposit value. Creates new `tournament` record
   * @param {Number} tournamentId
   * @param {Number} deposit
   * @returns {Promise}
   */
  announceTournament: (tournamentId, deposit) => {
    if(!tournamentId || !deposit)
      return Promise.reject(Boom.internal('No id or deposit provided'))
    let conn = null
    return db.getConnection()
      .then(connection=>{
        conn = connection
        return conn.query('SELECT * FROM `tournament` WHERE tournamentId='+ mysql.escape(tournamentId))
          .then(found=>{
            if(found && found.length > 0)
              return Promise.reject(Boom.badRequest('Tournament already announced'))
            return conn.query('INSERT INTO `tournament` (tournamentId, deposit, prizePool, participants, winners) VALUES (' + mysql.escape(tournamentId) + ',' + mysql.escape(deposit) + ', 0, JSON_ARRAY(), JSON_ARRAY())')
          })
      })
  },

  /**
   * Performs players tournament join
   * @param {Number} tournamentId
   * @param {String} playerId
   * @param {Array} backers
   * @returns {Promise}
   */
  joinTournament: (tournamentId, playerId, backers = []) => {
    if(!tournamentId || !playerId)
      return Promise.reject(Boom.internal('No tournamentId or playerId provided'))
    let conn = null
    /** Preparing list of playerIds of joining players including player and backers */
    let payers = backers.slice(0).concat([playerId])
    return db.getConnection()
      .then(connection=>{
        conn = connection
        return conn.beginTransaction()
      })
      .then(() => conn.query('SELECT * FROM tournament WHERE tournamentId='+mysql.escape(tournamentId)+' FOR UPDATE'))
      .then(rows => {
        let tournament = rows[0]
        /** Check tournament */
        if(!tournament)
          return conn.rollback()
            .then(() => Promise.reject(Boom.badData('Tournament is not exist')))
        let participants = JSON.parse(tournament.participants) || []
        if(participants.find(((element)=>{return element.playerId === playerId}))) {
          return conn.rollback()
            .then(() => Promise.reject(Boom.badData('Player '+ playerId +' already joined this tournament')))
        }
        let winners = JSON.parse(tournament.winners)
        if(winners && winners.length > 0)
          return conn.rollback()
            .then(() => Promise.reject(Boom.badData('Tournament already have winners! You cannot join.')))

        return conn.query('SELECT * FROM player WHERE playerId IN (' + mysql.escape(payers) + ') FOR UPDATE')
          .then(rows => {
            /** Preparing data for withdrawing */
            let amount = tournament.deposit/payers.length
            for (let r in rows) {//checking player and his backers balance
              /** player have enough points to join on his own */
              if(rows[r].playerId === playerId && rows[r].balance >= tournament.deposit) {
                payers = [playerId]
                backers = []
                amount = tournament.deposit
                break
              }
              /** player cannot make his own contribution */
              if(rows[r].playerId === playerId && rows[r].balance - amount <= 0) {
                return conn.rollback()
                  .then(()=>Promise.reject(Boom.badData('You have insufficient funds to join. call more backers')))
              }
              /** any of backers have not enough points */
              if(rows[r].balance - amount <= 0) {
                return conn.rollback()
                  .then(()=>Promise.reject(Boom.badData('Player '+ rows[r].playerId + ' have insufficient funds')))
              }
            }
            return conn.query('UPDATE player SET ' +
                'player.balance=player.balance-' + amount +
                ' WHERE playerId IN (' + mysql.escape(payers) + ')')
          })
          .then((res)=>{
            /** Updating tournament with new participants */
            participants.push({playerId: playerId, backers: backers})
            let prizePool = tournament.prizePool + tournament.deposit
            let query = 'UPDATE tournament SET ? WHERE tournamentId=' + mysql.escape(tournamentId)
            let values = {tournamentId: tournamentId,
              participants: JSON.stringify(participants),
              prizePool: prizePool,
              deposit: tournament.deposit}
            return conn.query(mysql.format(query, values))
          })
      })
      .then(() => conn.commit())
      .catch(err => conn.rollback()
        .then(() => Promise.reject(err)))
  },

  /**
   * Performs tournament result calculations. Update tournament entity, releases prize to players
   * @param {Number} tournamentId
   * @param {Array} winners
   * @returns {Promise}
   */
  resultTournament: (tournamentId, winners = []) => {
    if (!tournamentId || winners.length === 0)
      return Promise.reject(Boom.internal('tournamentId or winners not provided'))
    let conn = null
    return db.getConnection()
      .then(connection=>{
        conn = connection
        return conn.beginTransaction()
      })
      .then(()=>conn.query('SELECT * FROM tournament WHERE tournamentId='+mysql.escape(tournamentId) + ' FOR UPDATE'))
        .then(rows => {
          /** Check tournament */
          let tournament = rows[0]
          if(!tournament)
            return conn.rollback()
              .then(() => Promise.reject(Boom.badData('Tournament is not exist')))
          let winners = JSON.parse(tournament.winners)
          if(winners && winners.length > 0)
            return conn.rollback()
              .then(() => Promise.reject(Boom.badData('Tournament already have winners!')))
          let participants = JSON.parse(tournament.participants)
          if(!participants || participants.length === 0)
            return conn.rollback()
              .then(() => Promise.reject(Boom.internal('tournament have no participants')))

          /** Array for winners update functions */
          let paywinners = []

          /** Check if provided winners does participate in the tournament and prepare prize data */
          for(let w in winners) {
            let winnerParticipant = participants.find((p) => { return p.playerId === winners[w].playerId })
            if(!winnerParticipant) {
              return conn.rollback()
                .then(() => Promise.reject(Boom.badData(winners[w].playerId + ' player did not participate in the tournament ' + tournament.tournamentId)))
            }
            let backers = winnerParticipant.backers.slice(0)
            backers.push(winners[w].playerId)
            let amount = winners[w].prize / backers.length
            paywinners.push(conn.query('SELECT * FROM player WHERE playerId IN (' + mysql.escape(backers) + ') FOR UPDATE')
              .then(() => {
                return conn.query('UPDATE player SET player.balance=player.balance+' + amount + ' WHERE playerId IN (' +
                  mysql.escape(backers) + ')')
              }))
          }

          /** Adding prize points to players */
          return Promise.all(paywinners)
            .then(() => {
              /** Updating tournament with winners (Used to prevent tournament result repeating) */
              let query = 'UPDATE tournament SET ? WHERE tournamentId=' + mysql.escape(tournamentId)
              let values = {tournamentId: tournamentId,
                participants: JSON.stringify(participants),
                prizePool: tournament.prizePool,
                deposit: tournament.deposit,
                winners: JSON.stringify(winners)
              }
              return conn.query(mysql.format(query, values))
            })
        })
        .then(() => conn.commit())
        .catch(err => conn.rollback()
            .then(() => Promise.reject(err)))
  }
}
