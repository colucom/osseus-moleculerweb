[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# Osseus moleculer-web

## Install

```bash
$ npm install @colucom/osseus-moleculerweb
```

## Usage

This module creates new moleculer-web service: **apiGateway**, as each moleculer service , actions, methods , hooks & events can be added. The routes & started event function are mandatory for the operation of the service. [see details below](#Configuration) <br><br>

```javascript
const OsseusMoleculerWeb = require('@colucom/osseus-moleculerweb')
const moleculer = await OsseusMoleculerWeb.init(osseus)
const broker = moleculer.broker //Moleculer Service Broker Instance
const apiGatewayService = moleculer.service // Moleucler-Web ApiGateway Service
```

### Configuration

#### Mandatory:

To make the moleculer-web Api Gateway module to function there must be configurations added.

* `OSSEUS_MOLECULER_WEB_ROUTES_PATH: 'Custom Path'`

  The moleculer-web scheme need to recieve an array of route functions , [according to the moleculer-web documentation](https://moleculer.services/docs/0.14/moleculer-web.html#Full-service-settings).

  - the path to your routes functions array in the original project that requires the osseus-moleculerweb module.
  - default is `./broker/routes`.

- `OSSEUS_MOLECULER_WEB_STARTED_EVENT_HANDLER_PATH: 'Custom Path'`
  - the path to the event handler for the broker lifecycle 'started' event.
  - default is `./broker/events`.

#### Optional:

- `OSSEUS_MOLECULER_WEB_MIDDLEWARES_PATH`

  * If you wishing to use the middelware like functions in the Api Gateway module , you shoud provide path to the array of those functions in the original project that requires the osseus-moleculerweb module.

- `OSSEUS_MOLECULERWEB_ACTIONS_PATH`

  * if you wish to add moleculer actions to the service , first you need to add the configuration to turn it on: <ins>`OSSEUS_MOLECULERWEB_SHOULD_LOAD_ACTIONS: true,`</ins>, and then add the whising path to the actions object.

- `OSSEUS_MOLECULERWEB_HOOKS_PATH`

  * if you wish to add moleculer actions to the service , first you need to add the configuration to turn it on: <ins>`OSSEUS_MOLECULERWEB_SHOULD_LOAD_HOOKS: true,`</ins>, and then add the whising path to the actions object.

- `OSSEUS_MOLECULERWEB_METHODS_PATH`

  * if you wish to add moleculer actions to the service , first you need to add the configuration to turn it on: <ins>`  OSSEUS_MOLECULERWEB_SHOULD_LOAD_METHODS: true,`</ins>, and then add the whising path to the actions object.

- `OSSEUS_MOLECULERWEB_EVENTS_PATH`

  * if you wish to add moleculer actions to the service , first you need to add the configuration to turn it on: <ins>`OSSEUS_MOLECULERWEB_SHOULD_LOAD_EVENTS: true,`</ins>, and then add the whising path to the actions object.

## Contributing
Please see [contributing guidelines](https://github.com/colucom/osseus-moleculerweb/blob/master/.github/CONTRIBUTING.md).

## License
Code released under the [MIT License](https://github.com/colucom/osseus-moleculerweb/blob/master/LICENSE).
`