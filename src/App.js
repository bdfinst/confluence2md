/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class App {
  static initClass() {
    // @link http://hackage.haskell.org/package/pandoc For options description
    this.outputTypesAdd = [
      'markdown_github', // use GitHub markdown variant
      'blank_before_header', // insert blank line before header
      //    'mmd_link_attributes' # use MD syntax for images and links instead of HTML
      //    'link_attributes' # use MD syntax for images and links instead of HTML
    ]

    this.outputTypesRemove = []

    this.extraOptions = [
      '--markdown-headings=atx', // Setext-style headers (underlined) | ATX-style headers (prefixed with hashes)
    ]
  }

  /**
   * @param {fs} _fs Required lib
   * @param {sync-exec} _exec Required lib
   * @param {path} _path Required lib
   * @param {mkdirp} _mkdirp Required lib
   * @param {Utils} utils My lib
   * @param {Formatter} formatter My lib
   * @param {PageFactory} pageFactory My lib
   * @param {Logger} logger My lib
   */
  constructor(
    _fs,
    _exec,
    _path,
    _mkdirp,
    utils,
    formatter,
    pageFactory,
    logger,
  ) {
    this._fs = _fs
    this._exec = _exec
    this._path = _path
    this._mkdirp = _mkdirp
    this.utils = utils
    this.formatter = formatter
    this.pageFactory = pageFactory
    this.logger = logger
    const typesAdd = App.outputTypesAdd.join('+')
    let typesRemove = App.outputTypesRemove.join('-')
    typesRemove = typesRemove ? `-${typesRemove}` : ''
    const types = typesAdd + typesRemove
    this.pandocOptions = [
      types ? `-t ${types}` : '',
      App.extraOptions.join(' '),
    ].join(' ')
  }

  /**
   * Converts HTML files to MD files.
   * @param {string} dirIn Directory to go through
   * @param {string} dirOut Directory where to place converted MD files
   */
  convert(dirIn, dirOut) {
    const filePaths = this.utils.readDirRecursive(dirIn)
    const pages = (() => {
      const result = []
      for (const filePath of Array.from(filePaths)) {
        if (filePath.endsWith('.html')) {
          result.push(this.pageFactory.create(filePath))
        }
      }
      return result
    })()

    const indexHtmlFiles = []
    for (const page of Array.from(pages)) {
      ;(page => {
        if (page.fileName === 'index.html') {
          indexHtmlFiles.push(this._path.join(page.space, 'index')) // gitit requires link to pages without .md extension
        }
        return this.convertPage(page, dirIn, dirOut, pages)
      })(page)
    }

    if (!this.utils.isFile(dirIn)) {
      this.writeGlobalIndexFile(indexHtmlFiles, dirOut)
    }
    return this.logger.info('Conversion done')
  }

  /**
   * Converts HTML file at given path to MD.
   * @param {Page} page Page entity of HTML file
   * @param {string} dirOut Directory where to place converted MD files
   */
  convertPage(page, dirIn, dirOut, pages) {
    this.logger.info(`Parsing ... ${page.path}`)
    const text = page.getTextToConvert(pages)
    const fullOutFileName = this._path.join(
      dirOut,
      page.space,
      page.fileNameNew,
    )

    this.logger.info(`Making Markdown ... ${fullOutFileName}`)
    this.writeMarkdownFile(text, fullOutFileName)
    this.utils.copyAssets(
      this.utils.getDirname(page.path),
      this.utils.getDirname(fullOutFileName),
    )
    return this.logger.info('Done\n')
  }

  /**
   * @param {string} text Makdown content of file
   * @param {string} fullOutFileName Absolute path to resulting file
   * @return {string} Absolute path to created MD file
   */
  writeMarkdownFile(text, fullOutFileName) {
    const fullOutDirName = this.utils.getDirname(fullOutFileName)
    this._mkdirp.sync(fullOutDirName, function (error) {
      if (error) {
        return this.logger.error('Unable to create directory #{fullOutDirName}')
      }
    })

    const tempInputFile = `${fullOutFileName}~`
    this._fs.writeFileSync(tempInputFile, text, { flag: 'w' })
    const command =
      `pandoc -f html ${this.pandocOptions} -o "${fullOutFileName}"` +
      ` "${tempInputFile}"`
    const out = this._exec(command, { cwd: fullOutDirName })
    if (out.status > 0) {
      this.logger.error(out.stderr)
    }
    return this._fs.unlinkSync(tempInputFile)
  }

  /**
   * @param {array} indexHtmlFiles Relative paths of index.html files from all parsed Confluence spaces
   * @param {string} dirOut Absolute path to a directory where to place converted MD files
   */
  writeGlobalIndexFile(indexHtmlFiles, dirOut) {
    const globalIndex = this._path.join(dirOut, 'index.md')
    const $content = this.formatter.createListFromArray(indexHtmlFiles)
    const text = this.formatter.getHtml($content)
    return this.writeMarkdownFile(text, globalIndex)
  }
}
App.initClass()

module.exports = App
