Bootstrap = require './Bootstrap'

pathResource = process.argv[2]
pathResult = process.argv[3]

bootstrap = new Bootstrap
bootstrap.run pathResource, pathResult
