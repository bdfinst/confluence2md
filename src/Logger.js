/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/**
 * Logger object providing several logging methods which differ by used severity
 */
class Logger {
  static initClass() {
  
    this.DEBUG = 1;
    this.INFO = 2;
    this.WARNING = 3;
    this.ERROR = 4;
  }


  /**
   * @param {int} verbosityLevel One of defined constants.
   */
  constructor(verbosityLevel) {
    this._setVerbosity(verbosityLevel);
  }


  debug(msg) {
    return this._log(msg, Logger.DEBUG);
  }


  info(msg) {
    return this._log(msg, Logger.INFO);
  }


  warning(msg) {
    return this._log(msg, Logger.WARNING);
  }


  error(msg) {
    return this._log(msg, Logger.ERROR);
  }


  _setVerbosity(verbosityLevel) {
    const allowedVerbosityLevels = [Logger.DEBUG, Logger.INFO, Logger.WARNING, Logger.ERROR];

    if (!Array.from(allowedVerbosityLevels).includes(verbosityLevel)) {
      throw new Error(`Invalid verbosity level given '${verbosityLevel}'.`);
    }

    return this._verbosityLevel = verbosityLevel;
  }


  _log(msg, severity) {
    if (severity >= this._verbosityLevel) { return console.log(msg); }
  }
}
Logger.initClass();


module.exports = Logger;
