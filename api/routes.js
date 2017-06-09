'use strict'

const Joi = require('joi')

module.exports = (server) => {
  return [
    {
      method: 'GET',
      path:'/take',
      handler: server.controllers.PlayerController.take,
      config: {
        validate: {
          query: {
            playerId: Joi.string(),
            points: Joi.number().integer()
          }
        }
      }
    },
    {
      method: 'GET',
      path:'/fund',
      handler: server.controllers.PlayerController.fund,
      config: {
        validate: {
          query: {
            playerId: Joi.string(),
            points: Joi.number().integer()
          }
        }
      }
    },
    {
      method: 'GET',
      path:'/balance',
      handler: server.controllers.PlayerController.getBalance,
      config: {
        validate: {
          query: {
            playerId: Joi.string(),
          }
        }
      }
    },
    {
      method: 'GET',
      path:'/announceTournament',
      handler: server.controllers.TournamentController.announceTournament,
      config: {
        validate: {
          query: {
            tournamentId: Joi.number().integer(),
            deposit: Joi.number().integer()
          }
        }
      }
    },
    {
      method: 'GET',
      path:'/joinTournament',
      handler: server.controllers.TournamentController.joinTournament,
      config: {
        validate: {
          query: {
            tournamentId: Joi.number().integer(),
            playerId: Joi.string(),
            backerId: Joi.any()
          }
        }
      }
    },
    {
      method: 'POST',
      path:'/resultTournament',
      handler: server.controllers.TournamentController.resultTournament,
      config: {
        validate: {
          payload: {
            tournamentId: Joi.number().integer(),
            winners: Joi.array().min(1).items(Joi.object().keys({
              playerId: Joi.string(),
              prize: Joi.number().integer()
            }))
          }
        }
      }
    }
  ]
}

