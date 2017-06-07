'use strict'

const Boom = require('boom')
const Player = require('../services').PlayerService

module.exports = {

  getBalance: (request, reply) => {
    console.log(request.query.playerId)
    Player.getBalance(request.query.playerId)
      .then(rows=>{return reply(rows).code(200)})
      .catch(err=>{reply(err)})
  },

  take: (request, reply) => {
    Player.takePoints(request.query.playerId, request.query.points)
        .then(rows=>{return reply().code(200)})
        .catch(err=>{reply(err)})
  },
  fund: (request, reply) => {
    Player.fundPoints(request.query.playerId, request.query.points)
        .then(rows=>{return reply().code(200)})
        .catch(err=>{reply(err)})
  }
}