import {
  addPageHeading,
  fixArbitraryClasses,
  fixAttachmentWrapper,
  fixEmptyHeading,
  fixEmptyLink,
  fixHeadline,
  fixIcon,
  fixImageWithinSpan,
  fixLocalLinks,
  fixPageLog,
  fixPreformattedText,
  getHtml,
  getRightContentByFileName,
  load,
  removeArbitraryElements,
} from './mdFormatter'
import {
  getBasename,
  getDirname,
  readFile,
  sanitizeFilename,
} from './utilities'

const getSpacePath = (space, fileNameNew) =>
  `../${sanitizeFilename(space)}/${fileNameNew}`

const getFileNameNew = (fileName, heading) => {
  if (fileName === 'index.html') {
    return 'index.md'
  }
  return `${sanitizeFilename(heading)}.md`
}

const getHeading = (fileName, content) => {
  const title = content.find('title').text()
  if (fileName === 'index.html') {
    return title
  }
  const indexName = content.find('#breadcrumbs .first').text().trim()
  return title.replace(`${indexName} : `, '')
}

const buildNewPage = fullPath => {
  const fileName = getBasename(fullPath)
  const fileBaseName = getBasename(fullPath, '.html')
  const filePlainText = readFile(fullPath)
  const $ = load(filePlainText)
  const content = $.root()
  const heading = getHeading(fileName, content)
  const fileNameNew = getFileNameNew(fileName, heading)
  const space = getBasename(getDirname(fullPath))

  const spacePath = getSpacePath(space, fileNameNew)

  const getTextToConvert = (pages, contentIn) => {
    let pageContent = getRightContentByFileName(contentIn, fileName)
    pageContent = fixHeadline(pageContent)
    pageContent = fixIcon(pageContent)
    pageContent = fixEmptyLink(pageContent)
    pageContent = fixEmptyHeading(pageContent)
    pageContent = fixPreformattedText(pageContent)
    pageContent = fixImageWithinSpan(pageContent)
    pageContent = removeArbitraryElements(pageContent)
    pageContent = fixArbitraryClasses(pageContent)
    pageContent = fixAttachmentWrapper(pageContent)
    pageContent = fixPageLog(pageContent)
    pageContent = fixLocalLinks(pageContent, space, pages)
    pageContent = addPageHeading(pageContent, heading)

    return getHtml(pageContent)
  }

  return { spacePath, fileBaseName, getTextToConvert }
}

export default buildNewPage
