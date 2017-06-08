'use strict'

const Joi = require('joi')
const controllers = require('./controllers')

module.exports = [
    {
      method: 'GET',
      path:'/take',
      handler: controllers.PlayerController.take,
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
      handler: controllers.PlayerController.fund,
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
      handler: controllers.PlayerController.getBalance,
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
      handler: controllers.TournamentController.announceTournament,
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
      handler: controllers.TournamentController.joinTournament,
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
      handler: controllers.TournamentController.resultTournament,
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
