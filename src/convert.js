import { exec } from 'child_process'
import { promises as fsPromises } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

import { createListFromArray, getHtml } from './Formatter'
import pageFactory from './pageFactory'
import { copyAssets, getDirname, isFile, readDirRecursive } from './utilities'

const execAsync = promisify(exec)

// @link http://hackage.haskell.org/package/pandoc For options description
const outputTypesAdd = [
  'markdown_github', // use GitHub markdown variant
  'blank_before_header', // insert blank line before header
  //    'mmd_link_attributes' # use MD syntax for images and links instead of HTML
  //    'link_attributes' # use MD syntax for images and links instead of HTML
]

const extraOptions = [
  '--markdown-headings=atx', // Setext-style headers (underlined) | ATX-style headers (prefixed with hashes)
]

/**
 * @param {string} text Markdown content of file
 * @param {string} fullOutFileName Absolute path to resulting file
 * @return {string} Absolute path to created MD file
 */
const writeMarkdownFile = async (text, fullOutFileName) => {
  const typesAdd = outputTypesAdd.join('+')
  let typesRemove = [].join('-')
  typesRemove = typesRemove ? `-${typesRemove}` : ''
  const types = typesAdd + typesRemove
  const pandocOptions = [
    types ? `-t ${types}` : '',
    extraOptions.join(' '),
  ].join(' ')

  const fullOutDirName = getDirname(fullOutFileName)

  try {
    await fsPromises.mkdir(fullOutDirName, { recursive: true })
  } catch (e) {
    console.error(e)
    throw new Error(`Unable to create directory ${fullOutDirName}\n${e}`)
  }

  const tempInputFile = `${fullOutFileName}~`
  await fsPromises.writeFile(tempInputFile, text, { flag: 'w' })
  const command =
    `pandoc -f html ${pandocOptions} -o "${fullOutFileName}"` +
    ` "${tempInputFile}"`
  const out = await execAsync(command, { cwd: fullOutDirName })
  if (out.status > 0) {
    console.error(out.stderr)
  }
  return fsPromises.unlink(tempInputFile)
}

/**
 * @param {array} indexHtmlFiles Relative paths of index.html files from all parsed Confluence spaces
 * @param {string} dirOut Absolute path to a directory where to place converted MD files
 */
const writeGlobalIndexFile = async (indexHtmlFiles, dirOut) => {
  const globalIndex = join(dirOut, 'index.md')
  const $content = createListFromArray(indexHtmlFiles)
  const text = getHtml($content)
  return writeMarkdownFile(text, globalIndex)
}

/**
 * Converts HTML file at given path to MD.
 * @param {Page} page Page entity of HTML file
 * @param {string} dirOut Directory where to place converted MD files
 */
const convertPage = async (page, dirIn, dirOut, pages) => {
  console.log(`Parsing ... ${page.path}`)
  const text = page.getTextToConvert(pages)
  const fullOutFileName = join(dirOut, page.space, page.fileNameNew)

  console.log(`Making Markdown ... ${fullOutFileName}`)
  await writeMarkdownFile(text, fullOutFileName)
  copyAssets(getDirname(page.path), getDirname(fullOutFileName))
  return console.log('Done\n')
}

/**
 * Converts HTML files to MD files.
 * @param {string} dirIn Directory to go through
 * @param {string} dirOut Directory where to place converted MD files
 */
const convert = async (dirIn, dirOut) => {
  const filePaths = readDirRecursive(dirIn)

  const pages = (() => {
    const result = []
    filePaths.forEach(filePath => {
      if (filePath.endsWith('.html')) {
        result.push(pageFactory.buildNewPage(filePath))
      }
    })
    return result
  })()

  const indexHtmlFiles = []
  pages.forEach(page => {
    if (page.fileName === 'index.html') {
      indexHtmlFiles.push(join(page.space, 'index')) //  requires link to pages without .md extension
    }
    return convertPage(page, dirIn, dirOut, pages)
  })

  if (!isFile(dirIn)) {
    await writeGlobalIndexFile(indexHtmlFiles, dirOut)
  }
  return console.log('Conversion done')
}

export default convert
