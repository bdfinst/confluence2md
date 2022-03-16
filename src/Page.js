/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Page {
  constructor(fullPath, formatter, utils) {
    this.formatter = formatter
    this.utils = utils
    this.path = fullPath
    this.init()
  }

  init() {
    this.fileName = this.utils.getBasename(this.path)
    this.fileBaseName = this.utils.getBasename(this.path, '.html')
    this.filePlainText = this.utils.readFile(this.path)
    this.$ = this.formatter.load(this.filePlainText)
    this.content = this.$.root()
    this.heading = this.getHeading()
    this.fileNameNew = this.getFileNameNew()
    this.space = this.utils.getBasename(this.utils.getDirname(this.path))
    return (this.spacePath = this.getSpacePath())
  }

  getSpacePath() {
    return `../${this.utils.sanitizeFilename(this.space)}/${this.fileNameNew}`
  }

  getFileNameNew() {
    if (this.fileName === 'index.html') {
      return 'index.md'
    }
    return `${this.utils.sanitizeFilename(this.heading)}.md`
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
    let content = this.formatter.getRightContentByFileName(
      this.content,
      this.fileName,
    )
    content = this.formatter.fixHeadline(content)
    content = this.formatter.fixIcon(content)
    content = this.formatter.fixEmptyLink(content)
    content = this.formatter.fixEmptyHeading(content)
    content = this.formatter.fixPreformattedText(content)
    content = this.formatter.fixImageWithinSpan(content)
    content = this.formatter.removeArbitraryElements(content)
    content = this.formatter.fixArbitraryClasses(content)
    content = this.formatter.fixAttachmentWraper(content)
    content = this.formatter.fixPageLog(content)
    content = this.formatter.fixLocalLinks(content, this.space, pages)
    content = this.formatter.addPageHeading(content, this.heading)
    return this.formatter.getHtml(content)
  }
}

module.exports = Page
