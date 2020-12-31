const os = require('os')
const path = require('path')

const { ServiceBroker } = require('moleculer')
const ApiGatewayService = require('moleculer-web')
const { CustomLogger } = require('./customLogger')
const InterNamespaceMiddleware = require('./inter-middleware')

module.exports = async (osseus) => {
  try {
    const config = osseus.config

    const getNodeID = () => {
      const appName = config.application_name
      const hostName = config.hostInfo.hostname
      const pid = config.hostInfo.pid
      const osHostName = os.hostname()

      return `
        ${appName}:${hostName}:${pid}:${osHostName}
        `.toLowerCase()
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
      const envRoutesValue =
        config.osseus_moleculerweb.routes_path || './broker/routes'
      const routesFilePath = path.join(cwd, envRoutesValue)

      try {
        const routes = require(routesFilePath).default
        return routes
      } catch (err) {
        throw new Error(`Could not require ${routesFilePath}`)
      }
    }

    const loadStartedEventHandler = () => {
      const cwd = process.cwd()
      const envStartedHandlerValue =
        config.osseus_moleculerweb.started_event_handler_path ||
        './broker/events'
      const eventHandlerPath = path.join(cwd, envStartedHandlerValue)

      try {
        const eventHandler = require(eventHandlerPath).default
        return eventHandler
      } catch (err) {
        throw new Error(`could not require ${eventHandlerPath}`)
      }
    }

    const loadActions = () => {
      if (!config.osseus_moleculerweb.should_load_actions) {
        return {}
      }
      const cwd = process.cwd()
      const envActionsValue =
        config.osseus_moleculerweb.actions_path || './broker/actions'
      const actionsFilePath = path.join(cwd, envActionsValue)

      try {
        const actions = require(actionsFilePath).default
        return actions
      } catch (err) {
        throw new Error(`Could not require ${actionsFilePath}`)
      }
    }

    const defaultBrokerOptions = {
      logLevel: config.osseus_logger.log_level,
      logger: new CustomLogger(osseus.logger),
      nodeID: getNodeID(),
      transit: {
        disableReconnect: true,
      },
      transporter: 'TCP',
      middleware: [InterNamespaceMiddleware([
        {
          namespace: 'colu-mqtt',
          transporter: config.moleculer_broker_transporter
        },
       /* {
          namespace: 'colu-tcp',
          transporter: 'TCP'
        }*/
      ])]
    }

    osseus.logger.info('Initializing broker!')

    const serviceBroker = new ServiceBroker(defaultBrokerOptions)

    const serviceScheme = serviceBroker.createService({
      mixins: [ApiGatewayService],
      name: 'api',
      settings: {
        server: false,
        use: loadMiddlewares(),
        routes: loadRoutes(),
      },
      actions: {
        ...loadActions(),
        send: async (ctx) => {
          new Promise((resolve, reject) => {
            try {
              const params = ctx.params
              osseus.logger.info(
                `notifying consumer with socket ${JSON.stringify(ctx.params)}`
              )
              osseus.io.to(params.audience).emit('serverEvent', params.data)
            } catch (err) {
              return reject(err)
            }
          })
        },
      },
      started: loadStartedEventHandler().bind(null, osseus),
    })

    return Promise.resolve({ broker: serviceBroker, service: serviceScheme })
  } catch (err) {
    return Promise.reject(err)
  }
}
