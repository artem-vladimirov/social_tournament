'use strict'

const Player = require('../services').PlayerService

module.exports = {

  /**
   * Shows player object
   * @param {Object} request
   * @param {Object} reply
   */
  getBalance: (request, reply) => {
    Player.getBalance(request.query.playerId)
      .then(rows => { return reply(rows[0]).code(200) })
      .catch(err => { return reply(err) })
  },

  /**
   * Call points withdrawal operation
   * @param {Object} request
   * @param {Object} reply
   */
  take: (request, reply) => {
    Player.takePoints(request.query.playerId, request.query.points)
        .then(() => { return reply().code(200) })
        .catch(err => { return reply(err) })
  },

  /**
   * Call points funding operation
   * @param {Object} request
   * @param {Object} reply
   */
  fund: (request, reply) => {
    Player.fundPoints(request.query.playerId, request.query.points)
        .then(() => { return reply().code(200) })
        .catch(err => { return reply(err) })
  }
}
