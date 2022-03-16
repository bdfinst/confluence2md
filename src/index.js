'use strict'

const Bootstrap = require('./Bootstrap')

const pathResource = process.argv[2] // can also be a file
const pathResult = process.argv[3]

const bootstrap = new Bootstrap()
bootstrap.run(pathResource, pathResult)
