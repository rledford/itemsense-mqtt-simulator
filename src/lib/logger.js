const INFO = 'info';
const DEBUG = 'debug';
const WARN = 'warn';
const ERROR = 'error';

function print(level = '', message = '') {
  process.stdout.write(
    `${new Date().toLocaleString()} - ${level} - ${message}\n`
  );
}

module.exports = {
  info: msg => {
    print(INFO, msg);
  },
  debug: msg => {
    print(DEBUG, msg);
  },
  warn: msg => {
    print(WARN, msg);
  },
  error: msg => {
    print(ERROR, msg);
  }
};
