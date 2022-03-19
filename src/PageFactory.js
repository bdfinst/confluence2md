/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-named-as-default-member */
import formatter from './Formatter'
import utilities from './utilities'

function getSpacePath(space, fileNameNew) {
  return `../${utilities.sanitizeFilename(space)}/${fileNameNew}`
}

function getFileNameNew(fileName, heading) {
  if (fileName === 'index.html') {
    return 'index.md'
  }
  return `${utilities.sanitizeFilename(heading)}.md`
}

function getHeading(fileName, content) {
  const title = content.find('title').text()
  if (fileName === 'index.html') {
    return title
  }
  const indexName = content.find('#breadcrumbs .first').text().trim()
  return title.replace(`${indexName} : `, '')
}

export function buildNewPage(fullPath) {
  const fileName = utilities.getBasename(fullPath)
  const fileBaseName = utilities.getBasename(fullPath, '.html')
  const filePlainText = utilities.readFile(fullPath)
  const $ = formatter.load(filePlainText)
  const content = $.root()
  const heading = getHeading(fileName, content)
  const fileNameNew = getFileNameNew(fileName, heading)
  const space = utilities.getBasename(utilities.getDirname(fullPath))

  const spacePath = getSpacePath(space, fileNameNew)

  function getTextToConvert(pages, contentIn) {
    let pageContent = formatter.getRightContentByFileName(contentIn, fileName)
    pageContent = formatter.fixHeadline(pageContent)
    pageContent = formatter.fixIcon(pageContent)
    pageContent = formatter.fixEmptyLink(pageContent)
    pageContent = formatter.fixEmptyHeading(pageContent)
    pageContent = formatter.fixPreformattedText(pageContent)
    pageContent = formatter.fixImageWithinSpan(pageContent)
    pageContent = formatter.removeArbitraryElements(pageContent)
    pageContent = formatter.fixArbitraryClasses(pageContent)
    pageContent = formatter.fixAttachmentWrapper(pageContent)
    pageContent = formatter.fixPageLog(pageContent)
    pageContent = formatter.fixLocalLinks(pageContent, space, pages)
    pageContent = formatter.addPageHeading(pageContent, heading)
    return formatter.getHtml(pageContent)
  }

  return { spacePath, fileBaseName, getTextToConvert }
}
