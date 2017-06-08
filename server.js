'use strict';

const Hapi = require('hapi');
const mysql = require('promise-mysql')
const config = require('./config')
const server = new Hapi.Server();

server.connection(config.server.connection);


/** Applying all created routes */
const routes = require('./api/routes')
for (let route in routes){
  server.route(routes[route]);
}

/** Applying api to server */
server.controllers = require('./api/controllers')
server.services = require('./api/services')


/**
 * Establish database connection. Retry connection after 5 sec if failed
 */
function createConnection () {
  setTimeout(()=>{
    console.log('Trying to establish connection to db')
    mysql.createConnection(config.database.connection)
      .then(connection => {
        console.log('MySQL connected on:', connection.config.host + ':' + connection.config.port)
        connection.end()
        const pool = mysql.createPool(config.database.connection)
        if(pool) {
          console.log('Connection pool created')
          startServer(pool)
        } else {
          throw 'Connection pool is not created. Dropping'
        }
      })
      .catch( err => {
        console.log(err)
        createConnection()
      } )
  },5000)
}

/**
 * Start the server and apply connections
 * @param pool MySQL connection pool
 */
function startServer (pool) {
  server.start(err => {
    if (err) { throw err }
    server.pool = pool
    console.log('Server running at:', server.info.uri)
    prepareDB()
  })
}

/**
 * Calls database initialization methods
 */
function prepareDB() {
  Promise.all([
    server.services.PlayerService.createPlayerTable(),
    server.services.TournamentService.createTournamentTable()
  ])
  .then(() => {
    console.log('database prepared')
  })
  .catch(err=>{console.log(err)})
}

createConnection()

exports.app = server;

