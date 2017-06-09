'use strict';

// requires for testing
const Code    = require('code');
const expect  = Code.expect;
const Hapi    = require('hapi')
const mysql   = require('promise-mysql')
const config  = require('../config')
const server  = new Hapi.Server()
const environment = process.env.NODE_ENV || 'dev'

/** Tests */
describe('Functional :: test tournament flow ', () => {

  before((done) => {
    server.connection(config.server.connection[environment]);
    server.controllers = require('../api/controllers')(server)
    server.services = require('../api/services')(server)
    const routes = require('../api/routes')(server)
    for (let route in routes){
      server.route(routes[route]);
    }
    mysql.createConnection(config.database.connection[environment])
        .then(connection => {
          server.pool = mysql.createPool(config.database.connection[environment])
          return server.start()
        })
        .then(() => {
          console.log('Server started on ', server.info.uri)
          return server.services.Database.dropTables()
        })
        .then(() => Promise.all([
          server.services.PlayerService.createPlayerTable(),
          server.services.TournamentService.createTournamentTable()]))
        .then(() => { return done() })

  });

  describe('Check start points ::', () => {

    it('ENSURE TESTS STATE', () => {
      return server.inject({
        method: 'GET',
        url: '/balance?playerId=p1'
      }).then((response) => {
        return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p1', balance: 0 })
      })
    });

    it('ENSURE TESTS STATE', () => {
      return server.inject({
        method: 'GET',
        url: '/balance?playerId=p2'
      }).then((response) => {
        return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p2', balance: 0 })
      })
    });

    it('ENSURE TESTS STATE', () => {
      return server.inject({
        method: 'GET',
        url: '/balance?playerId=p3'
      }).then((response) => {
        return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p3', balance: 0 })
      })
    });

    it('ENSURE TESTS STATE', () => {
      return server.inject({
        method: 'GET',
        url: '/balance?playerId=p4'
      }).then((response) => {
        return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p4', balance: 0 })
      })
    });

    it('ENSURE TESTS STATE', () => {
      return server.inject({
        method: 'GET',
        url: '/balance?playerId=p5'
      }).then((response) => {
        return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p5', balance: 0 })
      })
    });


  })




  describe('Deposit points to players accounts ::', () => {

    it('Deposit 300 to p1 ::', () => {
      return server.inject({
        method: 'GET',
        url: '/fund?playerId=p1&points=300'
      }).then((response) => {
        return Code.expect(response.statusCode).to.equal(200)
      })
    });

    it('Deposit 300 to p2 ::', () => {
      return server.inject({
        method: 'GET',
        url: '/fund?playerId=p2&points=300'
      }).then((response) => {
        return Code.expect(response.statusCode).to.equal(200)
      })
    });

    it('Deposit 300 to p3 ::', () => {
      return server.inject({
        method: 'GET',
        url: '/fund?playerId=p3&points=300'
      }).then((response) => {
        return Code.expect(response.statusCode).to.equal(200)
      })
    });

    it('Deposit 500 to p4 ::', () => {
      return server.inject({
        method: 'GET',
        url: '/fund?playerId=p4&points=500'
      }).then((response) => {
        return Code.expect(response.statusCode).to.equal(200)
      })
    });

    it('Deposit 1000 to p5 ::', () => {
      return server.inject({
        method: 'GET',
        url: '/fund?playerId=p5&points=1000'
      }).then((response) => {
        return Code.expect(response.statusCode).to.equal(200)
      })
    });


  })

  describe('Creating tournament ::', () => {

    it('Announce tournament ::', () => {
      return server.inject({
        method: 'GET',
        url: '/announceTournament?tournamentId=1&deposit=1000'
      }).then((response) => {
        return Code.expect(response.statusCode).to.equal(200)
      })
    });

  })



  describe('Join players to tournament ::', () => {

    it(':: Join Player 5 ::', () => {
      return server.inject({
        method: 'GET',
        url: '/joinTournament?tournamentId=1&playerId=p5'
      }).then((response) => {
        return Code.expect(response.statusCode).to.equal(200)
      })
    });

    it(':: Join Player 1 with backers  ::', () => {
      return server.inject({
        method: 'GET',
        url: '/joinTournament?tournamentId=1&playerId=p1&backerId=p2&backerId=p3&backerId=p4'
      }).then((response) => {
        return Code.expect(response.statusCode).to.equal(200)
      })
    });

  })

  describe('RESULT tournament ::', () => {
    it(':: SEND  TOURNAMENT RESULTS ::', () => {
      return server.inject({
        method: 'POST',
        url: '/resultTournament',
        payload: JSON.stringify({
          "tournamentId": 1,
          "winners": [{
            "playerId": "p1",
            "prize": 2000
          }]
        })
      }).then((response) => {
        return Code.expect(response.statusCode).to.equal(200)
      })

    });
  })

  describe(':: Getting the results of tournament::', () => {

    it('Get player 1', () => {
      return server.inject({
        method: 'GET',
        url: '/balance?playerId=p1'
      }).then((response) => {
        return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p1', balance: 550 })
      })
    });

    it('Get player 2', () => {
      return server.inject({
        method: 'GET',
        url: '/balance?playerId=p2'
      }).then((response) => {
        return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p2', balance: 550 })
      })
    });


    it('Get player 3', () => {
      return server.inject({
        method: 'GET',
        url: '/balance?playerId=p3'
      }).then((response) => {
        return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p3', balance: 550 })
      })
    });


    it('Get player 4', () => {
      return server.inject({
        method: 'GET',
        url: '/balance?playerId=p4'
      }).then((response) => {
        return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p4', balance: 750 })
      })
    });


    it('Get player 5', () => {
      return server.inject({
        method: 'GET',
        url: '/balance?playerId=p5'
      }).then((response) => {
        return Code.expect(response.result).to.be.a.object().and.to.include({ playerId: 'p5', balance: 0 })
      })
    });

  })



  after(() => {
    server.stop()
  })

});
