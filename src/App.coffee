class App

  # @link http://hackage.haskell.org/package/pandoc For options description
  @outputTypesAdd = [
    'markdown_github' # use GitHub markdown variant
    'blank_before_header' # insert blank line before header
#    'mmd_link_attributes' # use MD syntax for images and links instead of HTML
    'link_attributes' # use MD syntax for images and links instead of HTML
  ]

  @outputTypesRemove = [
  ]

  @extraOptions = [
    '--atx-headers' # Setext-style headers (underlined) | ATX-style headers (prefixed with hashes)
  ]

  ###*
  # @param {fs} _fs Required lib
  # @param {sync-exec} _exec Required lib
  # @param {path} _path Required lib
  # @param {mkdirp} _mkdirp Required lib
  # @param {Utils} utils My lib
  # @param {Formatter} formatter My lib
  # @param {Logger} logger My lib
  ###
  constructor: (@_fs, @_exec, @_path, @_mkdirp, @utils, @formatter, @logger) ->
    typesAdd = App.outputTypesAdd.join '+'
    typesRemove = App.outputTypesRemove.join '-'
    typesRemove = if typesRemove then '-' + typesRemove else ''
    types = typesAdd + typesRemove
    @pandocOptions = [
      if types then '-t ' + types else ''
      App.extraOptions.join ' '
    ].join ' '


  ###*
  # Converts HTML files to MD files.
  # @param {string} dirIn Directory to go through
  # @param {string} dirOut Directory where to place converted MD files
  ###
  convert: (@dirIn, @dirOut) ->
    indexHtmlFiles = @dive @dirIn, @dirOut
    @writeGlobalIndexFile indexHtmlFiles, @dirOut if not @utils.isFile @dirIn
    @logger.info 'Conversion done'


  ###*
  # Iterates through whole dir structure and converts found files.
  # @param {string} dirIn Absolute path to a directory or file to go through
  # @param {string} dirOut Absolute path to a directory where to place converted MD files
  # @return {array} indexHtmlFiles Relative paths of index.html files from all parsed Confluence spaces
  ###
  dive: (dirIn, dirOut) ->
    @logger.info "Reading: " + dirIn
    isFileInActuallyDirectory = @utils.isFile dirIn
    indexHtmlFiles = []

    if isFileInActuallyDirectory
      startingDir = dirIn
      list = [dirIn]
    else
      startingDir = @_path.dirname dirIn
      list = @_fs.readdirSync dirIn

    list.forEach (file) =>
      fullPath = if isFileInActuallyDirectory then dirIn else @_path.join dirIn, file
      fileStat = @_fs.statSync fullPath

      if fileStat && fileStat.isDirectory()
        indexHtmlFiles.push (@dive fullPath, @_path.join dirOut, file)...
      else
        if not file.endsWith '.html'
          @logger.debug 'Skipping non-html file: ' + file
          return
        if @_path.basename(file) == 'index.html'
          spaceDir = @_path.basename @_path.dirname fullPath
          indexHtmlFiles.push @_path.join spaceDir, 'index.md'
        @convertFile fullPath, dirOut

    indexHtmlFiles


  ###*
  # Converts HTML file at given path to MD.
  # @param {string} fullInPath Absolute path to file to convert
  # @param {string} dirOut Directory where to place converted MD files
  ###
  convertFile: (fullInPath, dirOut) ->
    @logger.info 'Parsing file: ' + fullInPath
    text = @prepareContent fullInPath
    extName = @_path.extname fullInPath
    fullOutFileName = @_path.join dirOut, @_path.basename(fullInPath, extName) + '.md'

    @logger.info 'Making Markdown ...'
    @writeMarkdownFile text, fullOutFileName
    @utils.copyAssets @_path.dirname(fullInPath), dirOut
    @logger.info 'done ' + fullOutFileName


  ###*
  # @param {string} text Makdown content of file
  # @param {string} fullOutFileName Absolute path to resulting file
  # @return {string} Absolute path to created MD file
  ###
  writeMarkdownFile: (text, fullOutFileName) ->
    fullOutDirName = @_path.dirname fullOutFileName
    @_mkdirp.sync fullOutDirName, (error) ->
      if error
        @logger.error 'Unable to create directory #{fullOutDirName}'

    tempInputFile = fullOutFileName + '~'
    @_fs.writeFileSync tempInputFile, text, flag: 'w'
    command = 'pandoc -f html ' +
      @pandocOptions +
      ' -o ' + fullOutFileName +
      ' ' + tempInputFile
    out = @_exec command, cwd: fullOutDirName
    @logger.error out.stderr if out.status > 0
    @_fs.unlink tempInputFile


  ###*
  # Converts HTML file at given path to MD formatted text.
  # @param {string} fullInPath Absolute path to file to convert
  # @return {string} Content of a file parsed to MD
  ###
  prepareContent: (fullInPath) ->
    fileText = @_fs.readFileSync fullInPath, 'utf8'
    $content = @formatter.load fileText
    $content = @formatter.getRightContentByFileName @_path.basename fullInPath
    $content = @formatter.fixHeadline $content
    $content = @formatter.fixIcon $content
    $content = @formatter.fixEmptyLink $content
    $content = @formatter.fixEmptyHeading $content
    $content = @formatter.fixPreformattedText $content
    $content = @formatter.fixImageWithinSpan $content
    $content = @formatter.fixArbitraryClasses $content
    $content = @formatter.fixAttachmentWraper $content
    $content = @formatter.fixPageLog $content
    $content = @formatter.fixLocalLinks $content, @_path.dirname fullInPath
    @formatter.getHtml $content


  ###*
  # @param {array} indexHtmlFiles Relative paths of index.html files from all parsed Confluence spaces
  # @param {string} dirOut Absolute path to a directory where to place converted MD files
  ###
  writeGlobalIndexFile: (indexHtmlFiles, dirOut) ->
    globalIndex = @_path.join dirOut, 'index.md'
    $content = @formatter.createListFromArray indexHtmlFiles
    text = @formatter.getHtml $content
    @writeMarkdownFile text, globalIndex



module.exports = App
