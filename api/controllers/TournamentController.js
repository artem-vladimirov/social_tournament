'use strict'

const Tournament = require('../services').TournamentService

module.exports = {

  /**
   * Calls tournament announce operations
   * @param {Object} request
   * @param {Object} reply
   */
  announceTournament: (request, reply)=> {
    Tournament.announceTournament(request.query.tournamentId, request.query.deposit)
      .then(() => { return reply().code(200) })
      .catch(err => { reply(err) })
  },

  /**
   * Calls tournament join operations
   * @param {Object} request
   * @param {Object} reply
   */
  joinTournament: (request, reply)=> {
    let backers = (typeof request.query.backerId === 'string' ? [request.query.backerId] : request.query.backerId)
    Tournament.joinTournament(request.query.tournamentId, request.query.playerId, backers)
        .then(() => { return reply().code(200) })
        .catch(err => { return reply(err) })
  },

  /**
   * Calls tournament result calculations
   * @param {Object} request
   * @param {Object} reply
   */
  resultTournament: (request, reply)=> {
    Tournament.resultTournament(request.payload.tournamentId, request.payload.winners)
      .then(() => { reply().code(200) })
      .catch((err) => { return reply(err) })
  }
}