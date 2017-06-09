'use strict';

const Hapi    = require('hapi');
const mysql   = require('promise-mysql')
const config  = require('./config')
const server  = new Hapi.Server();
const environment = process.env.NODE_ENV || 'dev'
const mysqlConnection = config.database.connection[environment]

server.connection(config.server.connection[environment]);

/** Applying api to server */
server.controllers = require('./api/controllers')(server)
server.services = require('./api/services')(server)

/** Applying all created routes */
const routes = require('./api/routes')(server)
for (let route in routes){
  server.route(routes[route]);
}

/** CreateConnection and start server */
mysql.createConnection(mysqlConnection)
    .then(connection => {
      server.pool = mysql.createPool(mysqlConnection)
      return server.start()
    })
    .then(() => {
      console.log('Server started on ', server.info.uri)
      return server.services.Database.dropTables()
    })
    .then(() => Promise.all([
      server.services.PlayerService.createPlayerTable(),
      server.services.TournamentService.createTournamentTable()]))
    .then(() => {console.log('Prepared table')})

exports.app = server;

