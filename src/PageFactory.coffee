class PageFactory

  Page = require './Page'


  constructor: (@formatter, @utils) ->


  create: (fullPath) ->
    new Page fullPath, @formatter, @utils


module.exports = PageFactory
