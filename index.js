'use strict'

const objects = require('objects')
const path = require('path')

let extendedLoggerMethods = {}
let loggerAPIMethods = {}

module.exports = { // LoggingAPI
  load: loadLoggers,
  API: loggerAPI,
}

function loadLoggers(loggers, loggerConfigs, loggerWorkingPath) {
  loggers = objects.expects(loggers, [], false)
  loggerConfigs = objects.expects(loggerConfigs, {})

  if (!loggers)
    throw new Error('[logger] was given an improper loggers object. \'logger.load()\' expects an array of loggers.')

  if (!loggerWorkingPath)
    loggerWorkingPath = path.resolve('./loggers')

  loggers.unshift('template')

  for (let loggerName of loggers) {
    const loggerPath = path.join(loggerWorkingPath, `/${loggerName}`)
    let logger

    // Try to load logger module.
    try {
      logger = require(loggerPath)
    } catch (err) {
      console.error(`[logger] Could not implement '${loggerName}' logger. Error loading logger.`)
      console.error(err)
      continue
    }

    if ( !objects.expects(logger, {}, false) ) {
      console.error(`[logger] Could not implement '${loggerName}' logger. Not a valid logger.`)
      continue
    }

    // Ensure loggers implement an init function
    if ( !objects.expects(logger.init, function() {}, false) ) {
      console.error(`[logger] Could not implement '${loggerName}' logger. Expected 'init' function.`)
      continue
    }

    // Merge logger provided config with global config if we have one.
    let loggerConfig
    let loggerDefaultConfig

    try {
      loggerDefaultConfig = require(path.join(loggerPath, 'config.js'))
      if ( !objects.expects(loggerDefaultConfig, {}, false) )
        console.error(`[logger] Logger '${loggerName}' provided an invalid config file`)
    } catch (err) {
      // Swallow error, because we don't care if the consumer does not provide a default config
    }

    loggerDefaultConfig = objects.expects(loggerDefaultConfig, {})
    loggerConfigs[loggerName] = objects.expects(loggerConfigs[loggerName], {})

    loggerConfig = objects.merge(loggerDefaultConfig, loggerConfigs[loggerName])
    loggerConfig = objects.expects(loggerConfig, {})

    logger.init(loggerConfig)

    // Ensure logger implements the logging functions it's extending.
    if ( !objects.expects(logger.extends, [], false) ) {
      console.error(`[logger] Could not implement '${loggerName}' logger. Expected 'extends' array.`)
      continue
    }

    for (const method of logger.extends) {
      if ( !objects.expects(logger[method], function() {}, false) ) {
        console.warn(`[logger] Logger '${loggerName}' must implement expected '${method}' function.`)
        continue
      }

      if (!extendedLoggerMethods[method])
        extendedLoggerMethods[method] = []

      if (extendedLoggerMethods[method].includes(logger[method])) {
        console.warn(`[logger] Logger '${loggerName}' method '${method}' already extended.`)
        continue
      }

      extendedLoggerMethods[method].push(logger[method])
    }

    console.info(`[logger] Loaded ${loggerName}`)
  }

  return this.API
}

function sendToLoggers(methodName, sender) {
  const logger = function(...params) {
    for (const log of extendedLoggerMethods[methodName]) {
      log.apply({}, [sender, ...params])
    }
  }

  Object.defineProperty(logger, 'name', { value: methodName })
  return logger
}

function loggerAPI(type, name) {
  const sender = ((name) ? { type: type, name: name } : { type: type })

  for (const method of Object.keys(extendedLoggerMethods)) {
    loggerAPIMethods[method] = sendToLoggers(method, sender)
  }

  return loggerAPIMethods
}
