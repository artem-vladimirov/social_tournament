'use strict'

/**
 * Application Services
 * @type {{Database: *, PlayerService: *, TournamentService: *}}
 */
module.exports = {
  Database: require('./Database'),
  PlayerService: require('./PlayerService'),
  TournamentService: require('./TournamentService')
}