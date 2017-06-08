'use strict';

const Hapi    = require('hapi');
const mysql   = require('promise-mysql')
const config  = require('./config')
const server  = new Hapi.Server();

server.connection(config.server.connection);

/** Applying all created routes */
const routes = require('./api/routes')
for (let route in routes){
  server.route(routes[route]);
}

/** Applying api to server */
server.controllers = require('./api/controllers')
server.services = require('./api/services')

/** CreateConnection And stat server */
mysql.createConnection(config.database.connection)
    .then(connection => {
      server.pool = mysql.createPool(config.database.connection)
      return server.start().then(() => {
        console.log('Server started on ', server.info.uri)
        return Promise.all([
          server.services.PlayerService.createPlayerTable(),
          server.services.TournamentService.createTournamentTable()])
      })
    })

exports.app = server;

