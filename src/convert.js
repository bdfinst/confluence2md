import { exec } from 'child_process'
import { promises as fsPromises } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

import { createListFromArray, getHtml } from './mdFormatter.js'
import pageBuilder from './pageBuilder.js'
import {
  copyAssets,
  formatMarkdown,
  getDirname,
  isFile,
  readDirRecursive,
} from './utilities.js'

const execAsync = promisify(exec)

/**
 * @param {string} text Markdown content of file
 * @param {string} fullOutFileName Absolute path to resulting file
 * @return {string} Absolute path to created MD file
 */
const writeMarkdownFile = async (text, fullOutFileName, addFrontmatter) => {
  const fullOutDirName = getDirname(fullOutFileName)

  try {
    await fsPromises.mkdir(fullOutDirName, { recursive: true })
  } catch (e) {
    console.error(e)
    throw new Error(`Unable to create directory ${fullOutDirName}\n${e}`)
  }

  const tempInputFile = `${fullOutFileName}~`
  await fsPromises.writeFile(tempInputFile, text, { flag: 'w' })

  /*
   *  @link http://hackage.haskell.org/package/pandoc For options description
   * 'gfm': use GitHub markdown variant
   * '--markdown-headings=atx': Setext-style headers (underlined) | ATX-style headers (prefixed with hashes)
   */
  const command = `pandoc -f html -t gfm --markdown-headings=atx "${tempInputFile}"`
  const { stdout, stderr } = await execAsync(command, { cwd: fullOutDirName })

  fsPromises.unlink(tempInputFile)

  if (stderr.length > 0) {
    console.error(stderr)
  } else {
    fsPromises.writeFile(
      fullOutFileName,
      formatMarkdown(stdout, addFrontmatter),
      { flag: 'w' },
    )
  }
}

/**
 * @param {array} indexHtmlFiles Relative paths of index.html files from all parsed Confluence spaces
 * @param {string} dirOut Absolute path to a directory where to place converted MD files
 */
const writeGlobalIndexFile = async (
  indexHtmlFiles,
  dirOut,
  addFrontmatter = true,
) => {
  const globalIndex = join(dirOut, 'index.md')
  const $content = createListFromArray(indexHtmlFiles)
  const text = getHtml($content)
  return writeMarkdownFile(text, globalIndex, addFrontmatter)
}

/**
 * Converts HTML file at given path to MD.
 * @param {Page} page Page entity of HTML file
 * @param {string} dirOut Directory where to place converted MD files
 */
const convertPage = async (page, dirOut, pages, addFrontmatter) => {
  console.log(`Parsing ... ${page.path}`)
  const text = page.getTextToConvert(pages)
  const fullOutFileName = join(dirOut, page.space, page.fileNameNew)

  console.log(`Making Markdown ... ${fullOutFileName}`)
  await writeMarkdownFile(text, fullOutFileName, addFrontmatter)
  copyAssets(getDirname(page.path), getDirname(fullOutFileName))
  console.log('Done\n')
}

/**
 * Converts HTML files to MD files.
 * @param {string} dirIn Directory to go through
 * @param {string} dirOut Directory where to place converted MD files
 */
const convert = async (dirIn, dirOut, addFrontmatter) => {
  const filePaths = readDirRecursive(dirIn)

  const pages = filePaths
    .filter(filePath => filePath.endsWith('.html'))
    .map(filePath => pageBuilder(filePath))

  const indexHtmlFiles = []
  pages.forEach(page => {
    if (page.fileName === 'index.html') {
      indexHtmlFiles.push(join(page.space, 'index'))
    }

    return convertPage(page, dirOut, pages, addFrontmatter)
  })

  if (!isFile(dirIn)) {
    await writeGlobalIndexFile(indexHtmlFiles, dirOut, addFrontmatter)
  }
  return console.log('Conversion done')
}

export default convert
