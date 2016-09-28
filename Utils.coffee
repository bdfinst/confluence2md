class Utils
  constructor: (@fs, @path) ->


  getPageTitle: (content) ->
    titleRegex = /<title>(.*)<\/title>/i;
    match = content.match titleRegex

    if match isnt null && match.length >= 1
    then match[1]
    else null


  uniq: (a) ->
    Array.from new Set a


  mkdirSync: (path) ->
    try
      @fs.mkdirSync path
    catch e
      throw e if e.code isnt 'EEXIST'


  mkdirpSync: (dirpath) ->
    console.log "Making : " + dirpath
    parts = dirpath.split @path.sep

    @mkdirSync @path.join.apply(
      null, parts.slice 0, i
    ) for el, i in parts


module.exports = Utils
