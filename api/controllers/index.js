'use strict'

/**
 * Application Controllers
 * @type {{PlayerController: *, TournamentController: *}}
 */
module.exports = (server) => {
  return {
    PlayerController: require('./PlayerController')(server),
    TournamentController: require('./TournamentController')(server)
  }
}