import convert from './convert'
import path from 'path'

const pathResource = process.argv[2] // can also be a file
const pathResult = process.argv[3] || ''

const fromPath = path.resolve(pathResource)
const toPath = path.resolve(pathResult)

console.log(`Using source: ${fromPath}`)
console.log(`Using destination: ${toPath}`)

convert(fromPath, toPath)
