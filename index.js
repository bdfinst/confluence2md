import path from 'path'

import { program } from 'commander'

import convert from './src/convert.js'

program
  .name('confluence-to-markdown')
  .description('CLI to convert Confluence HTML to mardown for static sites')
  .argument('<sourcePath>', 'Path to exported Confluence HTML')
  .argument('<outputPath>', 'Path to write markdown')
  .option('-f, --frontmatter', 'Add frontmatter for static site generators')

program.parse()

const options = program.opts()

const pathResource = program.args[0]
const pathResult = program.args[1]
const frontmatter = !!options.frontmatter

const fromPath = path.resolve(pathResource)
const toPath = path.resolve(pathResult)

const frontmatterUsed = frontmatter ? '\nAdding frontmatter' : ''
console.log(`Converting ${fromPath}\nDestination: ${toPath} ${frontmatterUsed}`)

convert(fromPath, toPath, frontmatter)
