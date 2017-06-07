'use strict'

const Boom = require('boom')
const Tournament = require('../services').TournamentService

module.exports = {

  announceTournament: (request, reply)=> {
    Tournament.announceTournament(request.query.tournamentId, request.query.deposit)
      .then(() => {
        return reply().code(200);
      })
      .catch(err => { reply(err) })
  },

  joinTournament: (request, reply)=> {
    Tournament.joinTournament(request.query.tournamentId, request.query.playerId, request.query.backerId)
        .then(rows => {
          return reply(rows)
        })
        .catch(err => {
          console.log(err)
          return reply(err)
        })
  },

  resultTournament: (request, reply)=> {
    Tournament.resultTournament().then(rows=>{
      return reply(rows);
    })
  }
}