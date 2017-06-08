'use strict';

// requires for testing
const Code    = require('code');
const expect  = Code.expect;
const Hapi    = require('hapi')
const mysql   = require('promise-mysql')
const config  = require('../config')
const server  = new Hapi.Server()

/** Tests */
describe('functional tests - players', () => {

  before((done) => {
    server.connection(config.server.connection)
    const routes = require('../api/routes')
    for (let route in routes){
      server.route(routes[route]);
    }
    server.controllers = require('../api/controllers')
    server.services = require('../api/services')
    mysql.createConnection(config.database.connection)
      .then(connection => {
        console.log('test server connected!')
        server.pool = mysql.createPool(config.database.connection)
        return server.start()
      })
      .then(() => {
        console.log('test server started')
        return Promise.all([
          server.services.PlayerService.createPlayerTable(),
          server.services.TournamentService.createTournamentTable()])
      })
      .then(()=>{done()})
  });

  it('should get player', () => {
    return server.inject({
      method: 'GET',
      url: '/balance?playerId=p1'
    }).then((response) => {
      return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p1', balance: 0 })
    })
  });

});
