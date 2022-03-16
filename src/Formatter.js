/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Formatter {
  /**
   * @param {cheerio} _cheerio Required lib
   * @param {Utils} utils My lib
   * @param {Logger} logger My lib
   */
  constructor(_cheerio, utils, logger) {
    this._cheerio = _cheerio
    this.utils = utils
    this.logger = logger
  }

  /**
   * @param {string} text Content of a file
   * @return {cheerio obj} Root object of a text
   */
  load(text) {
    return this._cheerio.load(text)
  }

  /**
   * @param {cheerio obj} $content Content of a file
   * @return {string} Textual representation of a content
   */
  getText($content) {
    return $content.text()
  }

  /**
   * @param {cheerio obj} $content Content of a file
   * @return {string} HTML representation of a content
   */
  getHtml($content) {
    const $ = this._cheerio
    let contentHtml = ''
    $content.each((i, el) => {
      return (contentHtml += $(el).html())
    })
    return contentHtml
  }

  /**
   * The right content is selected based on the filename given.
   * Actual content of a page is placed elsewhere for index.html and other pages.
   * @see load() You need to load the content first.
   * @param {string} fileName Name of a file
   */
  getRightContentByFileName($content, fileName) {
    if (fileName === 'index.html') {
      return $content
        .find('#content')
        .find('#main-content>.confluenceTable')
        .remove()
        .end() // Removes arbitrary table located on top of index page
    } else {
      const selector = [
        '#main-content',
        '.pageSection.group:has(.pageSectionHeader>#attachments)',
        '.pageSection.group:has(.pageSectionHeader>#comments)',
      ]
      return $content.find(selector.join(', '))
    }
  }

  /**
   * Removes span inside of a h1 tag.
   * @param {cheerio obj} $content Content of a file
   * @return {cheerio obj} Cheerio object
   */
  fixHeadline($content) {
    return this._removeElementLeaveText($content, 'span.aui-icon')
  }

  addPageHeading($content, headingText) {
    const $ = this._cheerio
    const h1 = $('<h1>').text(headingText)
    $content.first().prepend(h1)
    return $content
  }

  /**
   * Removes redundant icon
   * @param {cheerio obj} $content Content of a file
   * @return {cheerio obj} Cheerio object
   */
  fixIcon($content) {
    return this._removeElementLeaveText($content, 'span.aui-icon')
  }

  /**
   * Removes empty link
   * @param {cheerio obj} $content Content of a file
   * @return {cheerio obj} Cheerio object
   */
  fixEmptyLink($content) {
    const $ = this._cheerio
    return $content
      .find('a')
      .each((i, el) => {
        if (
          $(el).text().trim().length === 0 &&
          $(el).find('img').length === 0
        ) {
          return $(el).remove()
        }
      })
      .end()
  }

  /**
   * Removes empty heading
   * @param {cheerio obj} $content Content of a file
   * @return {cheerio obj} Cheerio object
   */
  fixEmptyHeading($content) {
    const $ = this._cheerio
    return $content
      .find(':header')
      .each((i, el) => {
        if ($(el).text().trim().length === 0) {
          return $(el).remove()
        }
      })
      .end()
  }

  /**
   * Gives the right class to syntaxhighlighter
   * @param {cheerio obj} $content Content of a file
   * @return {cheerio obj} Cheerio object
   */
  fixPreformattedText($content) {
    const $ = this._cheerio
    return $content
      .find('pre')
      .each((i, el) => {
        const data = $(el).data('syntaxhighlighterParams')
        $(el).attr('style', data)
        const styles = $(el).css()
        const brush = styles != null ? styles.brush : undefined
        $(el).removeAttr('class')
        if (brush) {
          return $(el).addClass(brush)
        }
      })
      .end()
  }

  /**
   * Fixes 'p > a > span > img' for which no image was created.
   * @param {cheerio obj} $content Content of a file
   * @return {cheerio obj} Cheerio object
   */
  fixImageWithinSpan($content) {
    const $ = this._cheerio
    return $content
      .find('span:has(img)')
      .each((i, el) => {
        if ($(el).text().trim().length === 0) {
          return $(el).replaceWith($(el).html())
        }
      })
      .end()
  }

  removeArbitraryElements($content) {
    return this._removeElementLeaveText($content, 'span, .user-mention')
  }

  /**
   * Removes arbitrary confluence classes.
   * @param {cheerio obj} $content Content of a file
   * @return {cheerio obj} Cheerio object
   */
  fixArbitraryClasses($content) {
    return $content
      .find('*')
      .removeClass((i, e) =>
        (
          e.match(
            /(^|\s)(confluence\-\S+|external-link|uri|tablesorter-header-inner|odd|even|header)/g,
          ) || []
        ).join(' '),
      )
      .end()
  }

  /**
   * Removes arbitrary confluence elements for attachments.
   * @param {cheerio obj} $content Content of a file
   * @return {cheerio obj} Cheerio object
   */
  fixAttachmentWraper($content) {
    return $content
      .find('.attachment-buttons')
      .remove()
      .end() // action buttons for attachments
      .find('.plugin_attachments_upload_container')
      .remove()
      .end() // dropbox for uploading new files
      .find('table.attachments.aui')
      .remove()
      .end() // overview table with useless links
  }

  /**
   * Removes arbitrary confluence elements for page log.
   * @param {cheerio obj} $content Content of a file
   * @return {cheerio obj} Cheerio object
   */
  fixPageLog($content) {
    return $content
      .find('[id$="Recentspaceactivity"], [id$=Spacecontributors]')
      .parent()
      .remove()
      .end()
      .end()
  }

  /**
   * Changes links to local HTML files to generated MD files.
   * @param {cheerio obj} $content Content of a file
   * @param {string} cwd Current working directory (where HTML file reside)
   * @return {cheerio obj} Cheerio object
   */
  fixLocalLinks($content, space, pages) {
    const $ = this._cheerio
    return $content
      .find('a')
      .each((i, el) => {
        let pageLink, text
        const href = $(el).attr('href')
        if (href === undefined) {
          text = $(el).text()
          $(el).replaceWith(text)
          return this.logger.debug('No href for link with text "#{text}"')
        } else if ($(el).hasClass('createlink')) {
          return $(el).replaceWith($(el).text())
        } else if (
          (pageLink = this.utils.getLinkToNewPageFile(href, pages, space))
        ) {
          return $(el).attr('href', pageLink)
        }
      })
      .end()
  }

  /**
   * @param {array} indexHtmlFiles Relative paths of index.html files from all parsed Confluence spaces
   * @return {cheerio obj} Cheerio object
   */
  createListFromArray(itemArray) {
    const $ = this._cheerio.load('<ul>')
    const $ul = $('ul')
    for (let item of Array.from(itemArray)) {
      const $a = $('<a>').attr('href', item).text(item.replace('/index', ''))
      const $li = $('<li>')
      $li.append($a)
      $ul.append($li)
    }
    return $ul.end()
  }

  /**
   * Removes element by selector and leaves only its text content
   * @param {cheerio obj} $content Content of a file
   * @param {string} selector Selector of an element
   * @return {cheerio obj} Cheerio object
   */
  _removeElementLeaveText($content, selector) {
    const $ = this._cheerio
    return $content
      .find(selector)
      .each((i, el) => {
        return $(el).replaceWith($(el).text())
      })
      .end()
  }
}

module.exports = Formatter
