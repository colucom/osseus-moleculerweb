const os = require('os')
const path = require('path')

const { ServiceBroker } = require('moleculer')
const ApiGatewayService = require('moleculer-web')
const { CustomLogger } = require('./customLogger')

module.exports = async osseus => {
  try {
    const config = osseus.config

    const getNodeID = () => {
      const appName = config.application_name
      const hostName = config.hostInfo.hostname
      const pid = config.hostInfo.pid
      const osHostName = os.hostname()

      return `${appName}:${hostName}:${pid}:${osHostName}`.toLowerCase()
    }

    const loadMiddlewares = () => {
      const cwd = process.cwd()
      const envMiddlewaresValue = config.osseus_moleculerweb.middlewares_path
      if (envMiddlewaresValue) {
        const middlewaresFilePath = path.join(cwd, envMiddlewaresValue)
        try {
          const middlewares = require(middlewaresFilePath).default
          return middlewares
        } catch (err) {
          throw new Error(`could not require ${middlewaresFilePath}`)
        }
      } else {
        return []
      }
    }

    const loadRoutes = () => {
      const cwd = process.cwd()
      const envRoutesValue = config.osseus_moleculerweb.routes_path || './broker/services/apiGateway/routes'
      const routesFilePath = path.join(cwd, envRoutesValue)

      try {
        const routes = require(routesFilePath).default
        return routes
      } catch (err) {
        throw new Error(`Could not require ${routesFilePath}`)
      }
    }

    const loadActions = () => {
      if (!config.osseus_moleculerweb.should_load_actions) {
        return {}
      }
      const cwd = process.cwd()
      const envActionsValue = config.osseus_moleculerweb.actions_path || './broker/services/apiGatewayService/actions'
      const actionsFilePath = path.join(cwd, envActionsValue)

      try {
        const actions = require(actionsFilePath).default
        return actions
      } catch (err) {
        throw new Error(`Could not require ${actionsFilePath}`)
      }
    }

    const loadHooks = () => {
      if (!config.osseus_moleculerweb.should_load_hooks) {
        return {}
      }
      const cwd = process.cwd()
      const envHooksValue = config.osseus_moleculerweb.hooks_path || './broker/services/apiGatewayService/hooks'
      const hooksFilePath = path.join(cwd, envHooksValue)

      try {
        const hooks = require(hooksFilePath).default
        return hooks
      } catch (err) {
        throw new Error(`Could not require ${hooksFilePath}`)
      }
    }

    const loadMethods = () => {
      if (!config.osseus_moleculerweb.should_load_methods) {
        return {}
      }
      const cwd = process.cwd()
      const envMethodsValue = config.osseus_moleculerweb.methods_path || './broker/services/apiGatewayService/methods'
      const methodsFilePath = path.join(cwd, envMethodsValue)

      try {
        const methods = require(methodsFilePath).default
        return methods
      } catch (err) {
        throw new Error(`Could not require ${methodsFilePath}`)
      }
    }

    const loadEvents = () => {
      if (!config.osseus_moleculerweb.should_load_events) {
        return {}
      }
      const cwd = process.cwd()
      const envEventsValue = config.osseus_moleculerweb.events_path || './broker/services/apiGatewayService/events'
      const eventsFilePath = path.join(cwd, envEventsValue)

      try {
        const events = require(eventsFilePath).default
        return events
      } catch (err) {
        throw new Error(`Could not require ${eventsFilePath}`)
      }
    }

    const loadStartedEventHandler = () => {
      const cwd = process.cwd()
      const envStartedHandlerValue =
        config.osseus_moleculerweb.started_event_handler_path || './broker/services/apiGatewayService/events/started'
      const eventHandlerPath = path.join(cwd, envStartedHandlerValue)

      try {
        const eventHandler = require(eventHandlerPath).default
        return eventHandler
      } catch (err) {
        throw new Error(`could not require ${eventHandlerPath}`)
      }
    }

    const defaultBrokerOptions = {
      logLevel: config.osseus_logger.log_level,
      logger: new CustomLogger(osseus.logger),
      nodeID: getNodeID(),
      transit: {
        disableReconnect: true
      },
      transporter: config.moleculer_broker_transporter
    }

    osseus.logger.info('Initializing broker!')

    const serviceBroker = new ServiceBroker(defaultBrokerOptions)

    const serviceScheme = serviceBroker.createService({
      mixins: [ApiGatewayService],
      name: 'apiGateway',
      settings: {
        server: false,
        use: loadMiddlewares(),
        routes: loadRoutes()
      },
      actions: {
        ...loadActions()
      },
      hooks: {
        ...loadHooks()
      },
      methods: {
        ...loadMethods()
      },
      events: {
        ...loadEvents()
      },
      started: loadStartedEventHandler().bind(null, osseus)
    })

    return Promise.resolve({ broker: serviceBroker, service: serviceScheme })
  } catch (err) {
    return Promise.reject(err)
  }
}
