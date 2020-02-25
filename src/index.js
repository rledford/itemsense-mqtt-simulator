const { Configuration } = require('./lib/configuration');
const { Simulator } = require('./lib/simulator');

const config = new Configuration('./config.json');
const sim = new Simulator(config);

sim.start();
