/* eslint-disable no-useless-escape */
/* eslint-disable consistent-return */
/* eslint-disable no-return-assign */
import cheerio from 'cheerio'

import { getLinkToNewPageFile } from './utilities.js'

/**
 * Removes element by selector and leaves only its text content
 * @param {cheerio obj} content Content of a file
 * @param {string} selector Selector of an element
 * @return {cheerio obj} Cheerio object
 */
export const removeElementLeaveText = (content, selector) => {
  const $ = cheerio
  return content
    .find(selector)
    .each((i, el) => $(el).replaceWith($(el).text()))
    .end()
}

/**
 * @param {string} text Content of a file
 * @return {cheerio obj} Root object of a text
 */
export const load = text => cheerio.load(text)

/**
 * @param {cheerio obj} content Content of a file
 * @return {string} HTML representation of a content
 */
export const getHtml = content => {
  let contentHtml = ''

  content.each((i, el) => (contentHtml += cheerio(el).html()))
  return contentHtml
}

/**
 * The right content is selected based on the filename given.
 * Actual content of a page is placed elsewhere for index.html and other pages.
 * @see load() You need to load the content first.
 * @param {string} fileName Name of a file
 */
export const getRightContentByFileName = (content, fileName) => {
  if (fileName === 'index.html') {
    return content
      .find('#content')
      .find('#main-content>.confluenceTable')
      .remove()
      .end() // Removes arbitrary table located on top of index page
  }
  const selector = [
    '#main-content',
    '.pageSection.group:has(.pageSectionHeader>#attachments)',
    '.pageSection.group:has(.pageSectionHeader>#comments)',
  ]
  return content.find(selector.join(', '))
}

/**
 * Removes span inside of a h1 tag.
 * @param {cheerio obj} content Content of a file
 * @return {cheerio obj} Cheerio object
 */
export const fixHeadline = content =>
  removeElementLeaveText(content, 'span.aui-icon')

export const addPageHeading = (content, headingText) => {
  const $ = cheerio
  const h1 = $('<h1>').text(headingText)
  content.first().prepend(h1)
  return content
}

/**
 * Removes redundant icon
 * @param {cheerio obj} content Content of a file
 * @return {cheerio obj} Cheerio object
 */
export const fixIcon = content =>
  removeElementLeaveText(content, 'span.aui-icon')

/**
 * Removes empty link
 * @param {cheerio obj} content Content of a file
 * @return {cheerio obj} Cheerio object
 */
export const fixEmptyLink = content => {
  const $ = cheerio
  return content
    .find('a')
    .each((i, el) => {
      if ($(el).text().trim().length === 0 && $(el).find('img').length === 0) {
        return $(el).remove()
      }
    })
    .end()
}

/**
 * Removes empty heading
 * @param {cheerio obj} content Content of a file
 * @return {cheerio obj} Cheerio object
 */
export const fixEmptyHeading = content => {
  const $ = cheerio
  return content
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
 * @param {cheerio obj} content Content of a file
 * @return {cheerio obj} Cheerio object
 */
export const fixPreformattedText = content => {
  const $ = cheerio
  return content
    .find('pre')
    .each((i, el) => {
      const data = $(el).data('syntaxhighlighterParams')
      $(el).attr('style', data)
      const styles = $(el).css()
      const brush = styles !== null ? styles.brush : undefined
      $(el).removeAttr('class')
      if (brush) {
        return $(el).addClass(brush)
      }
    })
    .end()
}

/**
 * Fixes 'p > a > span > img' for which no image was created.
 * @param {cheerio obj} content Content of a file
 * @return {cheerio obj} Cheerio object
 */
export const fixImageWithinSpan = content => {
  const $ = cheerio
  return content
    .find('span:has(img)')
    .each((i, el) => {
      if ($(el).text().trim().length === 0) {
        return $(el).replaceWith($(el).html())
      }
    })
    .end()
}

export const removeArbitraryElements = content =>
  removeElementLeaveText(content, 'span, .user-mention')

/**
 * Removes arbitrary confluence classes.
 * @param {cheerio obj} content Content of a file
 * @return {cheerio obj} Cheerio object
 */
export const fixArbitraryClasses = content => {
  const regex =
    /(^|\s)(confluence\-\S+|external-link|uri|tablesorter-header-inner|odd|even|header)/g
  return content
    .find('*')
    .removeClass((i, e) => (e.match(regex) || []).join(' '))
    .end()
}

/**
 * Removes arbitrary confluence elements for attachments.
 * @param {cheerio obj} content Content of a file
 * @return {cheerio obj} Cheerio object
 */
export const fixAttachmentWrapper = content =>
  content
    .find('.attachment-buttons')
    .remove()
    .end() // action buttons for attachments
    .find('.plugin_attachments_upload_container')
    .remove()
    .end() // dropbox for uploading new files
    .find('table.attachments.aui')
    .remove()
    .end() // overview table with useless links

/**
 * Removes arbitrary confluence elements for page log.
 * @param {cheerio obj} content Content of a file
 * @return {cheerio obj} Cheerio object
 */
export const fixPageLog = content =>
  content
    .find('[id$="Recentspaceactivity"], [id$=Spacecontributors]')
    .parent()
    .remove()
    .end()
    .end()

/**
 * Changes links to local HTML files to generated MD files.
 * @param {cheerio obj} content Content of a file
 * @param {string} cwd Current working directory (where HTML file reside)
 * @return {cheerio obj} Cheerio object
 */
export const fixLocalLinks = (content, space, pages) => {
  const $ = cheerio
  return content
    .find('a')
    .each((i, el) => {
      let text
      const href = $(el).attr('href')
      if (href === undefined) {
        text = $(el).text()
        $(el).replaceWith(text)
        return console.debug('No href for link with text "#{text}"')
      }
      if ($(el).hasClass('createlink')) {
        return $(el).replaceWith($(el).text())
      }

      const pageLink = getLinkToNewPageFile(href, pages, space)
      if (pageLink) {
        return $(el).attr('href', pageLink)
      }
    })
    .end()
}

/**
 * @param {array} indexHtmlFiles Relative paths of index.html files from all parsed Confluence spaces
 * @return {cheerio obj} Cheerio object
 */
export const createListFromArray = itemArray => {
  const cheerioList = cheerio.load('<ul>')
  const ulTag = cheerioList('ul')

  itemArray.forEach(item => {
    const aTag = cheerioList('<a>')
      .attr('href', item)
      .text(item.replace('/index', ''))
    const liTag = cheerioList('<li>')
    liTag.append(aTag)
    ulTag.append(liTag)
  })

  return ulTag.end()
}
