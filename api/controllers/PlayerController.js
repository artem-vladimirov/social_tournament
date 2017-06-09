'use strict'

module.exports = (server) => {
  return {
    /**
     * Shows player object
     * @param {Object} request
     * @param {Object} reply
     */
    getBalance: (request, reply) => {
      server.services.PlayerService.getBalance(request.query.playerId)
          .then(rows => reply(rows[0]).code(200))
          .catch(err => reply(err))
    },

    /**
     * Call points withdrawal operation
     * @param {Object} request
     * @param {Object} reply
     */
    take: (request, reply) => {
      server.services.PlayerService.takePoints(request.query.playerId, request.query.points)
          .then(() => reply().code(200))
          .catch(err => reply(err))
    },

    /**
     * Call points funding operation
     * @param {Object} request
     * @param {Object} reply
     */
    fund: (request, reply) => {
      server.services.PlayerService.fundPoints(request.query.playerId, request.query.points)
          .then(() => reply().code(200))
          .catch(err => reply(err))
    }
  }
}
