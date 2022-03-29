/* eslint-disable no-useless-escape */
/* eslint-disable consistent-return */
import fs from 'fs'
import path from 'path'

import ncp from 'ncp'

/**
 * Checks if given file exists and is a file.
 * @param {string} filePath Absolute/relative path to a file
 * @param {string|void} cwd Current working directory against which the path is built.
 * @return {bool}
 */
export const isFile = (filePath, cwd = '') => {
  const pathFull = path.resolve(cwd, filePath)
  const stat = fs.existsSync(pathFull) ? fs.statSync(pathFull) : undefined
  return stat && stat.isFile()
}

/**
 * Checks if given directory exists and is a directory.
 * @param {string} dirPath Absolute/relative path to a directory
 * @param {string|void} cwd Current working directory against which the path is built.
 * @return {bool}
 */
export const isDir = (dirPath, cwd = '') => {
  const pathFull = path.resolve(cwd, dirPath)
  const stat = fs.existsSync(pathFull) ? fs.statSync(pathFull) : undefined
  return stat && stat.isDirectory()
}

/**
 * Return list of files (and directories) in a given directory.
 * @param {string} path Absolute path to a directory.
 * @param {bool|void} filesOnly Whether to return only files.
 * @return {array}
 */
export const readDirRecursive = (fromPath, filesOnly = true) => {
  const fullPaths = []
  let files

  if (isFile(fromPath)) {
    return [fromPath]
  }

  try {
    files = fs.readdirSync(fromPath)
  } catch (err) {
    let msg
    if (err.code === 'ENOENT') {
      msg = `Path not found: ${fromPath}`
    }
    throw new Error(msg)
  }

  files.forEach(fileName => {
    const fullPath = path.join(fromPath, fileName)
    if (isFile(fullPath)) {
      fullPaths.push(fullPath)
    } else {
      if (!filesOnly) {
        fullPaths.push(fullPath)
      }
      fullPaths.push(...Array.from(readDirRecursive(fullPath, filesOnly) || []))
    }
  })
  return fullPaths
}

/**
 * Sanitize a filename, replacing invalid characters with an underscore
 * @param (string) filename Filename and extension, but not directory component
 * @return (string)
 */
export const sanitizeFilename = name =>
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
  name
    .replace(/[\s<>()\[\]{}:;'`"\/\\|?\*~!@#$%^&,]/g, '_')
    .replace(/__+/g, '_')

export const getBasename = (fromPath, extension) =>
  path.basename(fromPath, extension)

export const getDirname = fromPath => path.dirname(fromPath)

export const readFile = fromPath => fs.readFileSync(fromPath, 'utf8')

export const getLinkToNewPageFile = (href, pages, space) => {
  const fileName = getBasename(href)
  const pageRegex = /.*pageId=(\d+).*/
  const matches = href.match(pageRegex)

  // relative link to file
  if (fileName.endsWith('.html')) {
    const baseName = fileName.replace('.html', '') //  requires link to pages without .md extension

    pages.forEach(page => {
      if (baseName === page.fileBaseName) {
        if (space === page.space) {
          return page.fileNameNew.replace('.md', '') //  requires link to pages without .md extension
        }
        return page.spacePath.replace('.md', '') //  requires link to pages without .md extension
      }
    })

    // link to confluence pageId
  } else if (matches) {
    const pageId = matches[1]
    pages.forEach(page => {
      if (pageId === page.fileBaseName) {
        return page.spacePath.replace('.md', '') //  requires link to pages without .md extension
      }
    })

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
export const copyAssets = (pathWithHtmlFiles, dirOut) => {
  const result = []
  const assets = ['images', 'attachments']
  assets.forEach(asset => {
    const assetsDirIn = path.join(pathWithHtmlFiles, asset)
    const assetsDirOut = path.join(dirOut, asset)
    if (isDir(assetsDirIn)) {
      result.push(ncp(assetsDirIn, assetsDirOut))
    } else {
      result.push(undefined)
    }
  })
  return result
}

export const buildFrontmatter = h1Title => {
  const title = h1Title ? h1Title.split('# ')[1] : undefined

  return title ? `---\ntitle: "${title}"\ntype: docs\n---\n` : ''
}
