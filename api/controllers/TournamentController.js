'use strict'

module.exports = (server) => {
  return {

    /**
     * Calls tournament announce operations
     * @param {Object} request
     * @param {Object} reply
     */
    announceTournament: (request, reply) => {
      server.services.TournamentService.announceTournament(request.query.tournamentId, request.query.deposit)
        .then(() => reply().code(200))
        .catch(err => reply(err))
    },

    /**
     * Calls tournament join operations
     * @param {Object} request
     * @param {Object} reply
     */
    joinTournament: (request, reply) => {
      let backers = (typeof request.query.backerId === 'string' ? [request.query.backerId] : request.query.backerId)
      server.services.TournamentService.joinTournament(request.query.tournamentId, request.query.playerId, backers)
        .then(() => reply().code(200))
        .catch(err => reply(err))
    },

    /**
     * Calls tournament result calculations
     * @param {Object} request
     * @param {Object} reply
     */
    resultTournament: (request, reply) => {
      server.services.TournamentService.resultTournament(request.payload.tournamentId, request.payload.winners)
        .then(() => reply().code(200))
        .catch((err) => reply(err))
    }
  }
}
