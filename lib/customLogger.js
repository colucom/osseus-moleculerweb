// Copyright 2018 Colu, Inc.

const BaseLogger = require('moleculer').Loggers.Base

class CustomLogger extends BaseLogger {
  constructor(logger) {
    super()
    this._logger = logger
  }

  getLogHandler(bindings) {
    return (type, args) => this._logger[type](`[${bindings.mod}]`, ...args)
  }
}

module.exports = {
  CustomLogger,
}
