'use strict'

const server = require('../../server')

module.exports = {

  query: (query) => {
    return new Promise((resolve, reject) => {
      server.app.pool.query(query)
          .then(result=>{resolve(result)})
          .catch(err=>{reject(err)})
    })
  },

  getConnection: () => {
    return server.app.pool.getConnection()
  },

  beginTransaction: () => {
    return server.app.pool.beginTransaction()
  }

}