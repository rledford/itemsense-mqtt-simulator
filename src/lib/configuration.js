const fs = require('fs');
const joi = require('@hapi/joi');
const logger = require('./logger');

const configurationSchema = joi
  .object()
  .keys({
    zones: joi
      .array()
      .items(joi.string())
      .default([]),
    thresholds: joi
      .array()
      .items(
        joi.object().keys({
          in: joi.string().required(),
          out: joi.string().required()
        })
      )
      .default([]),
    epcs: joi
      .array()
      .items(
        joi
          .string()
          .hex()
          .uppercase()
      )
      .default([]),
    tagHeartbeatDuration: joi
      .number()
      .integer()
      .min(1000)
      .default(1000),
    reportingInterval: joi
      .number()
      .integer()
      .min(1000)
      .default(1000),
    mqttConnection: joi.object().keys({
      host: joi
        .string()
        .default('localhost')
        .required(),
      port: joi
        .number()
        .integer()
        .min(1)
        .max(65535)
        .default(1833),
      topic: joi
        .string()
        .allow('')
        .default(''),
      prefix: joi
        .string()
        .allow('')
        .default(''),
      suffix: joi
        .string()
        .allow('')
        .default(''),
      secured: joi.boolean().default(false),
      username: joi
        .string()
        .allow('')
        .default(''),
      password: joi
        .string()
        .allow('')
        .default('')
    })
  })
  .options({ stripUnknown: true });

class Configuration {
  /**
   * Creates a Configuration object to be used by a Simulator
   *
   * @param {String} path path to a configuration file
   * @param {Object} options additional configuration options
   */
  constructor(path = '') {
    this.zones = ['zone'];
    this.thresholds = [{ in: 'in', out: 'out' }];
    this.epcs = ['0a1b2c3d4e5f6'];
    this.tagHeartbeatDuration = 1000;
    this.reportingInterval = 1000;
    this.mqttConnection = {
      host: 'localhost',
      port: 1833,
      topic: 'topic',
      prefix: 'prefix',
      suffix: 'suffix',
      secured: false,
      username: '',
      password: ''
    };

    this.__load(path);
  }

  /**
   *
   * @param {String} path path to JSON configuration file
   */
  __load(path = '') {
    logger.info('loading configuration file');
    let config = {};

    try {
      config = joi.attempt(
        JSON.parse(fs.readFileSync(path)),
        configurationSchema
      );
    } catch (err) {
      logger.error(err.message);
      process.exit(1);
    }

    Object.assign(this, config);
    logger.info('configuration file loaded');
    logger.info(JSON.stringify(this));
  }
}

module.exports = {
  Configuration
};
