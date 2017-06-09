'use strict'
/**
 * Server configuration object
 * @type {{connection: {host: string, port: number}}}
 */
module.exports = {
  connection: {
    dev: {
      host: '0.0.0.0',
      port: 8000
    },
    prod: {
      host: '0.0.0.0',
      port: 8000
    }
  }
}