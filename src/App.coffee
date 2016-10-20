class App

  ###*
  # htmlFileList list of files with .html extension (original files)
  ###
#  HTML_FILE_LIST = [];

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
#    HTML_FILE_LIST = @utils.getAllHtmlFileNames dir
    @dive @dirIn, @dirOut
    @logger.info 'Total of XXX files processed' # TODO


  ###*
  # Iterates through whole dir structure and converts found files.
  # @param {string} dirIn Directory or file to go through
  # @param {string} dirOut Directory where to place converted MD files
  ###
  dive: (dirIn, dirOut) ->
    @logger.info "Reading: " + dirIn
    isFileDirIn = @utils.isFile dirIn
    list = if isFileDirIn then [dirIn] else @_fs.readdirSync dirIn
    list.forEach (file) =>
      fullPath = if isFileDirIn then dirIn else @_path.join dirIn, file
      fileStat = @_fs.statSync fullPath

      if fileStat && fileStat.isDirectory()
        @dive fullPath, @_path.join dirOut, file
      else
        if not file.endsWith '.html'
          @logger.debug 'Skipping non-html file: ' + file
          return
        @convertFile fullPath, dirOut


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
    $content = @formatter.fixLocalLinks $content, @_path.dirname fullInPath
#    $content = @formatter.fixLinks $content
    content = $content.html();

#    @logger.info "Relinking images ..."
#    @relinkImagesInFile outputFile, attachmentsExportPath, markdownImageReference #TODO attributes
#    @logger.info "done"

    content


  ###*
  # TODO
  ###
  relinkImagesInFile: (outputFile, attachmentsExportPath, markdownImageReference) ->
    text = @_fs.readFileSync outputFile, 'utf8'
    matches = @utils.uniq(
      text.match(/(<img src=")([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)/ig)
    )
    dir = '' ## TODO parent directory of outputFile
    matches.forEach (imgTag) =>
      imgTag = imgTag.replace '<img src="', ''
      attachments = imgTag.replace "attachments/", ""
      if attachments == imgTag
        return
      fileName = attachmentsExportPath + attachments
      @logger.info "Creating image dir: " + fileName.substr(0, fileName.lastIndexOf('/'))
      @_mkdirp fileName.substr(0, fileName.lastIndexOf('/'))
      @logger.info "Creating filename: " + fileName
      try
        @_fs.accessSync dir + "/" + imgTag, @_fs.F_OK
        @_fs.createReadStream dir + "/" + imgTag
          .pipe(
            @_fs.createWriteStream(
              process.cwd() + "/" + fileName
            )
          )
        @logger.info "Wrote: " + dir + "/" + imgTag + "\n To: " + process.cwd() + "/" + fileName
      catch e
        @logger.error "Can't read: " + dir + "/" + imgTag
    lines = text.replace(
      /(<img src=")([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)/ig,
      "$1" + markdownImageReference + "$3/$4"
    )

    @_fs.writeFileSync outputFile, lines


module.exports = App
