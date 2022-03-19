'use strict'

const Formatter = require('./Formatter')
const Utils = require('./Utils')

let formatter
let utils

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Page {
  constructor(fullPath) {
    formatter = new Formatter()
    utils = new Utils()
    this.path = fullPath
    this.init()
  }

  init() {
    this.fileName = utils.getBasename(this.path)
    this.fileBaseName = utils.getBasename(this.path, '.html')
    this.filePlainText = utils.readFile(this.path)
    this.$ = formatter.load(this.filePlainText)
    this.content = this.$.root()
    this.heading = this.getHeading()
    this.fileNameNew = this.getFileNameNew()
    this.space = utils.getBasename(utils.getDirname(this.path))

    this.spacePath = this.getSpacePath()

    return this.spacePath
  }

  getSpacePath() {
    return `../${utils.sanitizeFilename(this.space)}/${this.fileNameNew}`
  }

  getFileNameNew() {
    if (this.fileName === 'index.html') {
      return 'index.md'
    }
    return `${utils.sanitizeFilename(this.heading)}.md`
  }

  getHeading() {
    const title = this.content.find('title').text()
    if (this.fileName === 'index.html') {
      return title
    }
    const indexName = this.content.find('#breadcrumbs .first').text().trim()
    return title.replace(`${indexName} : `, '')
  }

  /**
   * Converts HTML file at given path to MD formatted text.
   * @return {string} Content of a file parsed to MD
   */
  getTextToConvert(pages) {
    let content = formatter.getRightContentByFileName(
      this.content,
      this.fileName,
    )
    content = formatter.fixHeadline(content)
    content = formatter.fixIcon(content)
    content = formatter.fixEmptyLink(content)
    content = formatter.fixEmptyHeading(content)
    content = formatter.fixPreformattedText(content)
    content = formatter.fixImageWithinSpan(content)
    content = formatter.removeArbitraryElements(content)
    content = formatter.fixArbitraryClasses(content)
    content = formatter.fixAttachmentWrapper(content)
    content = formatter.fixPageLog(content)
    content = formatter.fixLocalLinks(content, this.space, pages)
    content = formatter.addPageHeading(content, this.heading)
    return formatter.getHtml(content)
  }
}

module.exports = Page
