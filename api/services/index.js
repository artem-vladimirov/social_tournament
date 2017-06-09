'use strict'

/**
 * Application Services
 * @param server
 * @returns {{Database: {query, getConnection}, PlayerService: {createPlayerTable, getBalance, takePoints, fundPoints}, TournamentService: {createTournamentTable, announceTournament, joinTournament, resultTournament}}}
 */
module.exports = (server) => {
  return {
    Database: require('./Database')(server),
    PlayerService: require('./PlayerService')(server),
    TournamentService: require('./TournamentService')(server)
  }
}