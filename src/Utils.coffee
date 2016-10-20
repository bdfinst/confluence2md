class Utils

  ###*
  # @param {fs} _fs Required lib
  # @param {path} _path Required lib
  # @param {ncp} _ncp Required lib
  # @param {Logger} logger My lib
  ###
  constructor: (@_fs, @_path, @_ncp, @logger) ->


  mkdirSync: (path) ->
    @logger.debug "Making dir: " + path
    try
      @_fs.mkdirSync path
    catch e
      throw e if e.code isnt 'EEXIST'


  ###*
  # Checks if given file exists and is a file.
  # @param {string} filePath Absolute/relative path to a file
  # @param {string|void} cwd Current working directory against which the path is built.
  # @return {bool}
  ###
  isFile: (filePath, cwd = '') ->
    pathFull = @_path.resolve cwd, filePath
    @_fs.existsSync(pathFull) \
      && ((stat = @_fs.statSync(pathFull)) && stat.isFile())


  ###*
  # Checks if given directory exists and is a directory.
  # @param {string} dirPath Absolute/relative path to a directory
  # @param {string|void} cwd Current working directory against which the path is built.
  # @return {bool}
  ###
  isDir: (dirPath, cwd = '') ->
    pathFull = @_path.resolve cwd, dirPath
    @_fs.existsSync(pathFull) \
      && ((stat = @_fs.statSync(pathFull)) && stat.isDirectory())


  ###*
  # Copies assets directories to path with MD files
  # @param {string} fullInPath Absolute path to file to convert
  # @param {string} dirOut Directory where to place converted MD files
  ###
  copyAssets: (pathWithHtmlFiles, dirOut) ->
    for asset in ['images', 'attachments']
      assetsDirIn = @_path.join pathWithHtmlFiles, asset
      assetsDirOut = @_path.join dirOut, asset
      @_ncp assetsDirIn, assetsDirOut if @isDir(assetsDirIn)


module.exports = Utils
