class Utils

  ###*
  # @param {fs} _fs Required lib
  # @param {path} _path Required lib
  # @param {Logger} logger My lib
  ###
  constructor: (@_fs, @_path, @logger) ->


  getPageTitle: (content) ->
    titleRegex = /<title>(.*)<\/title>/i;
    match = content.match titleRegex

    if match isnt null && match.length >= 1
    then match[1]
    else null


  uniq: (a) ->
    Array.from new Set a


  mkdirSync: (path) ->
    @logger.debug "Making dir: " + path
    try
      @_fs.mkdirSync path
    catch e
      throw e if e.code isnt 'EEXIST'


  ###*
  # fills the HTML_FILE_LIST constant
  ###
  getAllHtmlFileNames: (dir) ->
    htmlFileList = []
    list = @_fs.readdirSync dir
    list.forEach (file) =>
      fullPath = dir + @_path.sep + file
      fileStat = @_fs.statSync fullPath

      if fileStat && fileStat.isDirectory()
        htmlFileList.push (@getAllHtmlFileNames fullPath)...
      else if file.endsWith '.html'
        htmlFileList.push file

    htmlFileList


module.exports = Utils
