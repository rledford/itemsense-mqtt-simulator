const mqtt = require('mqtt');
const logger = require('./logger');
const { Configuration } = require('./configuration');

class Simulator {
  constructor(config = new Configuration()) {
    this.mqttClient = null;
    this.configuration = config;
    this.nextUpdateTimeoutHandle = -1;
  }

  start() {
    const {
      mqttConnection: { host, port, secured, username, password }
    } = this.configuration;
    const options = {};

    clearTimeout(this.nextUpdateTimeoutHandle);

    if (secured) {
      Object.assign(options, { username, password });
    }
    this.mqttClient = mqtt.connect(`mqtt://${host}:${port}`, options);
    this.mqttClient.on('connect', () => {
      logger.info('connected to mqtt broker');
    });

    this.nextUpdateTimeoutHandle = setTimeout();
  }

  __update() {
    const { epcs, zones, thresholds } = this.configuration;
  }

  stop() {
    clearTimeout(this.nextUpdateTimeoutHandle);
  }
}
