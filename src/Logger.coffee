###*
# Logger object providing several logging methods which differ by used severity
###
class Logger

  @DEBUG = 1
  @INFO = 2
  @WARNING = 3
  @ERROR = 4


  ###*
  # @param {int} verbosityLevel One of defined constants.
  ###
  constructor: (verbosityLevel) ->
    @_setVerbosity verbosityLevel


  debug: (msg) ->
    @_log msg, Logger.DEBUG


  info: (msg) ->
    @_log msg, Logger.INFO


  warning: (msg) ->
    @_log msg, Logger.WARNING


  error: (msg) ->
    @_log msg, Logger.ERROR


  _setVerbosity: (verbosityLevel) ->
    allowedVerbosityLevels = [Logger.DEBUG, Logger.INFO, Logger.WARNING, Logger.ERROR]

    if verbosityLevel not in allowedVerbosityLevels
      throw new Error "Invalid verbosity level given '#{verbosityLevel}'."

    @_verbosityLevel = verbosityLevel


  _log: (msg, severity) ->
    console.log msg if severity >= @_verbosityLevel


module.exports = Logger
