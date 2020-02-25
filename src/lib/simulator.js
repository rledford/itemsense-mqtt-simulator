const mqtt = require('mqtt');
const fs = require('fs');
const logger = require('./logger');
const helpers = require('./helpers');
const { Configuration } = require('./configuration');

class Simulator {
  /**
   * Simulates ItemSense threshold and item activity based on configuration settings and publishes events to an MQTT broker
   *
   * @param {Object} config a configuration object
   */
  constructor(config = new Configuration()) {
    this.client = null;
    this.configuration = config;
    this.__nextUpdateTimeoutHandle = -1;
    this.__started = false;
    this.__epcTagHeartbeatMap = {};
  }

  start() {
    if (this.__started) return;

    clearTimeout(this.__nextUpdateTimeoutHandle);

    this.__started = true;
    this.__generateEpcs();

    const {
      mqtt: { host, port, auth, username, password },
      epcs,
      tagHeartbeatDuration
    } = this.configuration;

    if (epcs.save && epcs.use.length) {
      logger.info('saving epcs');
      fs.writeFile(`${process.cwd()}/epcs.txt`, epcs.use.join('\n'), err => {
        if (err) {
          logger.error(`error saving epcs - ${err.message}`);
        }
      });
    }

    for (let epc of epcs.use) {
      this.__epcTagHeartbeatMap[epc] = new Date(
        Date.now() + Math.floor(Math.random() * tagHeartbeatDuration)
      );
    }

    const options = { connectionTimeout: 5000 };

    if (auth) {
      Object.assign(options, { username, password });
    }

    logger.info(`connecting to mqtt broker [ mqtt://${host}:${port} ]`);

    this.client = mqtt.connect(`mqtt://${host}:${port}`, options);
    this.client.on('connect', () => {
      logger.info('connected to mqtt broker');
      if (this.__started) {
        this.__prepareUpdate();
      }
    });
  }

  __prepareUpdate() {
    this.__nextUpdateTimeoutHandle = setTimeout(() => {
      this.__update();
    }, this.configuration.reportingInterval);
  }

  __update() {
    if (this.__started) {
      const {
        epcs: { use },
        mqtt: { prefix, suffix },
        zones,
        thresholds,
        tagHeartbeatDuration
      } = this.configuration;

      let topic;
      let msg;
      let nMessages = 0;
      const now = Date.now();
      for (let i = 0; i < use.length; i++) {
        if (this.__epcTagHeartbeatMap[use[i]].getTime() > now) continue;
        nMessages++;
        this.__epcTagHeartbeatMap[use[i]].setTime(now + tagHeartbeatDuration);
        topic =
          Math.random() <= 0.5
            ? thresholds.length
              ? 'threshold'
              : 'item'
            : 'item';
        switch (topic) {
          case 'item':
            msg = this.__generateItemMessageForEpc(use[i]);
            break;
          case 'threshold':
            msg = this.__generateThresholdMessageForEpc(use[i]);
            break;
        }
        this.client.publish(
          `${prefix ? prefix + '/' : ''}${topic}${suffix ? '/' + suffix : ''}`,
          JSON.stringify(msg)
        );
      }
      logger.info(`sent [ ${nMessages} ] messages`);
      this.__prepareUpdate();
    }
  }

  __generateItemMessageForEpc(epc = '') {
    return {
      epc,
      tagId: '',
      jobId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      jobName: 'jobName',
      from: {
        zone: 'ABSENT',
        floor: null,
        facility: null,
        x: null,
        y: null
      },
      to: {
        zone: helpers.randInArray(this.configuration.zones),
        floor: '1',
        facility: 'DEFAULT',
        x: 0.0,
        y: 0.0
      },
      observationTime: new Date().toISOString()
    };
  }

  __generateThresholdMessageForEpc(epc = '') {
    const fromZone = helpers.randInArray(['IN', 'OUT']);
    const toZone = fromZone === 'IN' ? 'OUT' : 'IN';
    return {
      epc,
      fromZone,
      toZone,
      threshold: helpers.randInArray(this.configuration.thresholds),
      thresholdId: 1,
      confidence: 1.0,
      jobId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      jobName: 'threshold_job',
      observationTime: new Date().toISOString()
    };
  }

  __generateEpcs() {
    const nEpcs =
      this.configuration.epcs.total - this.configuration.epcs.use.length;
    if (nEpcs <= 0) return;

    logger.info(`generating [ ${nEpcs} ] epcs`);

    let epc;
    for (let i = 0; i < nEpcs; i++) {
      epc = this.__generateRandomEpc();
      this.configuration.epcs.use.push(epc);
    }
  }

  __generateRandomEpc() {
    let parts = [];
    for (let i = 0; i < 13; i++) {
      parts.push(
        Math.abs((Math.random() * 0xff) << 0)
          .toString(16)
          .toUpperCase()
      );
    }

    return parts.join('');
  }

  stop() {
    this.__started = false;
    clearTimeout(this.__nextUpdateTimeoutHandle);
  }
}

module.exports = {
  Simulator
};
