/* eslint-disable no-console */

'use strict'

const fs = require('fs')
const exec = require('sync-exec')
const path = require('path')
const mkdirp = require('mkdirp')
const Utils = require('./Utils')
const Formatter = require('./Formatter')
const PageFactory = require('./PageFactory')

let formatter
let utils
let pageFactory

class App {
  static initClass() {
    // @link http://hackage.haskell.org/package/pandoc For options description
    this.outputTypesAdd = [
      'markdown_github', // use GitHub markdown variant
      'blank_before_header', // insert blank line before header
      //    'mmd_link_attributes' # use MD syntax for images and links instead of HTML
      //    'link_attributes' # use MD syntax for images and links instead of HTML
    ]

    this.outputTypesRemove = []

    this.extraOptions = [
      '--markdown-headings=atx', // Setext-style headers (underlined) | ATX-style headers (prefixed with hashes)
    ]
  }

  constructor() {
    formatter = new Formatter()
    utils = new Utils()
    pageFactory = new PageFactory()

    const typesAdd = App.outputTypesAdd.join('+')
    let typesRemove = App.outputTypesRemove.join('-')
    typesRemove = typesRemove ? `-${typesRemove}` : ''
    const types = typesAdd + typesRemove
    this.pandocOptions = [
      types ? `-t ${types}` : '',
      App.extraOptions.join(' '),
    ].join(' ')
  }

  /**
   * Converts HTML files to MD files.
   * @param {string} dirIn Directory to go through
   * @param {string} dirOut Directory where to place converted MD files
   */
  convert(dirIn, dirOut) {
    const filePaths = utils.readDirRecursive(dirIn)

    const pages = (() => {
      const result = []
      for (const filePath of Array.from(filePaths)) {
        if (filePath.endsWith('.html')) {
          result.push(pageFactory.create(filePath))
        }
      }
      return result
    })()

    const indexHtmlFiles = []
    for (const page of Array.from(pages)) {
      ;(page => {
        if (page.fileName === 'index.html') {
          indexHtmlFiles.push(path.join(page.space, 'index')) //  requires link to pages without .md extension
        }
        return this.convertPage(page, dirIn, dirOut, pages)
      })(page)
    }

    if (!utils.isFile(dirIn)) {
      this.writeGlobalIndexFile(indexHtmlFiles, dirOut)
    }
    return console.log('Conversion done')
  }

  /**
   * Converts HTML file at given path to MD.
   * @param {Page} page Page entity of HTML file
   * @param {string} dirOut Directory where to place converted MD files
   */
  convertPage(page, dirIn, dirOut, pages) {
    console.log(`Parsing ... ${page.path}`)
    const text = page.getTextToConvert(pages)
    const fullOutFileName = path.join(dirOut, page.space, page.fileNameNew)

    console.log(`Making Markdown ... ${fullOutFileName}`)
    this.writeMarkdownFile(text, fullOutFileName)
    utils.copyAssets(
      utils.getDirname(page.path),
      utils.getDirname(fullOutFileName),
    )
    return console.log('Done\n')
  }

  /**
   * @param {string} text Markdown content of file
   * @param {string} fullOutFileName Absolute path to resulting file
   * @return {string} Absolute path to created MD file
   */
  writeMarkdownFile(text, fullOutFileName) {
    const fullOutDirName = utils.getDirname(fullOutFileName)
    mkdirp.sync(fullOutDirName, error => {
      if (error) {
        return console.error('Unable to create directory #{fullOutDirName}')
      }
    })

    const tempInputFile = `${fullOutFileName}~`
    fs.writeFileSync(tempInputFile, text, { flag: 'w' })
    const command =
      `pandoc -f html ${this.pandocOptions} -o "${fullOutFileName}"` +
      ` "${tempInputFile}"`
    const out = exec(command, { cwd: fullOutDirName })
    if (out.status > 0) {
      console.error(out.stderr)
    }
    return fs.unlinkSync(tempInputFile)
  }

  /**
   * @param {array} indexHtmlFiles Relative paths of index.html files from all parsed Confluence spaces
   * @param {string} dirOut Absolute path to a directory where to place converted MD files
   */
  writeGlobalIndexFile(indexHtmlFiles, dirOut) {
    const globalIndex = path.join(dirOut, 'index.md')
    const $content = formatter.createListFromArray(indexHtmlFiles)
    const text = formatter.getHtml($content)
    return this.writeMarkdownFile(text, globalIndex)
  }
}
App.initClass()

module.exports = App
