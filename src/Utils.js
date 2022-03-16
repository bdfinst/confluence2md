/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Utils {
  /**
   * @param {fs} _fs Required lib
   * @param {path} _path Required lib
   * @param {ncp} _ncp Required lib
   * @param {Logger} logger My lib
   */
  constructor(_fs, _path, _ncp, logger) {
    this._fs = _fs
    this._path = _path
    this._ncp = _ncp
    this.logger = logger
  }

  mkdirSync(path) {
    this.logger.debug('Making dir: ' + path)
    try {
      return this._fs.mkdirSync(path)
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e
      }
    }
  }

  /**
   * Checks if given file exists and is a file.
   * @param {string} filePath Absolute/relative path to a file
   * @param {string|void} cwd Current working directory against which the path is built.
   * @return {bool}
   */
  isFile(filePath, cwd) {
    let stat
    if (cwd == null) {
      cwd = ''
    }
    const pathFull = this._path.resolve(cwd, filePath)
    return (
      this._fs.existsSync(pathFull) &&
      (stat = this._fs.statSync(pathFull)) &&
      stat.isFile()
    )
  }

  /**
   * Checks if given directory exists and is a directory.
   * @param {string} dirPath Absolute/relative path to a directory
   * @param {string|void} cwd Current working directory against which the path is built.
   * @return {bool}
   */
  isDir(dirPath, cwd) {
    let stat
    if (cwd == null) {
      cwd = ''
    }
    const pathFull = this._path.resolve(cwd, dirPath)
    return (
      this._fs.existsSync(pathFull) &&
      (stat = this._fs.statSync(pathFull)) &&
      stat.isDirectory()
    )
  }

  /**
   * Return list of files (and directories) in a given directory.
   * @param {string} path Absolute path to a directory.
   * @param {bool|void} filesOnly Whether to return only files.
   * @return {array}
   */
  readDirRecursive(path, filesOnly) {
    if (filesOnly == null) {
      filesOnly = true
    }
    const fullPaths = []
    if (this.isFile(path)) {
      return [path]
    }
    for (let fileName of Array.from(this._fs.readdirSync(path))) {
      const fullPath = this._path.join(path, fileName)
      if (this.isFile(fullPath)) {
        fullPaths.push(fullPath)
      } else {
        if (!filesOnly) {
          fullPaths.push(fullPath)
        }
        fullPaths.push(
          ...Array.from(this.readDirRecursive(fullPath, filesOnly) || []),
        )
      }
    }
    return fullPaths
  }

  /**
   * Sanitize a filename, replacing invalid characters with an underscore
   * @param (string) filename Filename and extension, but not directory component
   * @return (string)
   */
  sanitizeFilename(name) {
    // Restrictions based on Windows. *nix systems only reserve a subset of this list.
    //    (space)
    // <> (less than, greater than)
    // () (parentheses)
    // [] (square brackets)
    // {} (curly braces)
    // :; (colon variants)
    // "'`(quote variants)
    // /  (forward slash)
    // \  (backslash)
    // |  (vertical bar or pipe)
    // ?  (question mark)
    // *  (asterisk)
    //    (other punctuation, while not strictly invalid, can lead to errors if copy-pasting filenames into shells or scripts)
    // Finally, collapse multiple contiguous underscores into a single underscore
    return name
      .replace(/[\s<>()\[\]{}:;'`"\/\\|?\*~!@#$%^&,]/g, '_')
      .replace(/__+/g, '_')
  }

  getBasename(path, extension) {
    return this._path.basename(path, extension)
  }

  getDirname(path) {
    return this._path.dirname(path)
  }

  readFile(path) {
    return this._fs.readFileSync(path, 'utf8')
  }

  getLinkToNewPageFile(href, pages, space) {
    let matches, page
    const fileName = this.getBasename(href)

    // relative link to file
    if (fileName.endsWith('.html')) {
      const baseName = fileName.replace('.html', '') // gitit requires link to pages without .md extension
      for (page of Array.from(pages)) {
        if (baseName === page.fileBaseName) {
          if (space === page.space) {
            return page.fileNameNew.replace('.md', '') // gitit requires link to pages without .md extension
          } else {
            return page.spacePath.replace('.md', '') // gitit requires link to pages without .md extension
          }
        }
      }

      // link to confluence pageId
    } else if ((matches = href.match(/.*pageId=(\d+).*/))) {
      const pageId = matches[1]
      for (page of Array.from(pages)) {
        if (pageId === page.fileBaseName) {
          return page.spacePath.replace('.md', '') // gitit requires link to pages without .md extension
        }
      }

      // link outside
    } else {
      return undefined
    }
  }

  /**
   * Copies assets directories to path with MD files
   * @param {string} fullInPath Absolute path to file to convert
   * @param {string} dirOut Directory where to place converted MD files
   */
  copyAssets(pathWithHtmlFiles, dirOut) {
    return (() => {
      const result = []
      for (let asset of ['images', 'attachments']) {
        const assetsDirIn = this._path.join(pathWithHtmlFiles, asset)
        const assetsDirOut = this._path.join(dirOut, asset)
        if (this.isDir(assetsDirIn)) {
          result.push(this._ncp(assetsDirIn, assetsDirOut))
        } else {
          result.push(undefined)
        }
      }
      return result
    })()
  }
}

module.exports = Utils
