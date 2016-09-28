#!/usr/bin/env node

const REQUIRED = {
  fs: require('fs'),
  path: require('path'),
  exec: require('sync-exec'),
  path: require('path'),
  cheerio: require('cheerio')
}

/* htmlFileList list of files with .html extension (original files) */
const HTML_FILE_LIST = []

var paths = {
  divePath: process.cwd(),
  attachmentsExportPath: "/public/assets/images/",
  markdownImageReference: "assets/images/"
}

var options = {
  pandocOutputType: "markdown_github+blank_before_header",
  pandocOptions: "--atx-headers"
}

// print process.argv
process.argv.forEach(function (val, index, array) {
  if (index === 2) {
    paths.divePath = process.cwd() + "/" + val;
  } else if (index === 3) {
    paths.attachmentsExportPath = val
  } else if(index === 4) {
    paths.markdownImageReference = val
  }
});


getAllHtmlFileNames(paths.divePath)
dive(paths.divePath)


/**
 * fills the HTML_FILE_LIST constant
 */
function getAllHtmlFileNames(dir) {
  var list = [];
  list = REQUIRED.fs.readdirSync(dir);
  list.forEach(function (file) {
    var fullPath = dir + "/" + file;
    var fileStat = REQUIRED.fs.statSync(fullPath);

    if (fileStat && fileStat.isDirectory()) {
      getAllHtmlFileNames(fullPath);
    } else {
      if (file.endsWith('.html')) {
        HTML_FILE_LIST.push(file)
      }
    }
  })
}


function dive(dir) {
  var list = [];
  console.log("Reading the directory: " + dir);
  list = REQUIRED.fs.readdirSync(dir);
  list.forEach(function (file) {
    var fullPath = dir + "/" + file;
    var fileStat = REQUIRED.fs.statSync(fullPath);

    if (fileStat && fileStat.isDirectory()) {
      dive(fullPath);
    } else {
      if (!file.endsWith('.html')) {
        console.log('Skipping non-html file: ' + file);
        return;
      }
      parseFile(fullPath);
    }
  })
}


function parseFile(fullPath) {
  console.log('Parsing file: ' + fullPath);
  var text = prepareContent(fullPath);
  var extName = REQUIRED.path.extname(fullPath);
  var markdownFileName = REQUIRED.path.basename(fullPath, extName) + '.md';

  console.log("Making Markdown ...");
  var outputFile = writeMarkdownFile(text, markdownFileName);
  console.log("done")
}


function writeMarkdownFile(text, markdownFileName) {
  mkdirpSync("/Markdown");
  var outputFileName = "Markdown/" + markdownFileName;
  var inputFile = outputFileName + "~";
  REQUIRED.fs.writeFileSync(inputFile, text);
  var out = REQUIRED.exec("pandoc -f html -t "
    + options.pandocOutputType + " "
    + options.pandocOptions
    + " -o " + outputFileName
    + " " + inputFile,
    {cwd: process.cwd()}
  );
  REQUIRED.fs.unlink(inputFile);

  return outputFileName
}


/**
 *
 * @param fullPath
 */
function prepareContent(fullPath) {
  var fileText = REQUIRED.fs.readFileSync(fullPath, 'utf8');
  var $ = REQUIRED.cheerio.load(fileText);
  var $content = (REQUIRED.path.basename(fullPath) == 'index.html')
    ? $('#content')
    : $('#main-content');
  var content = $content
    .find('span.mw-headline').each(function (i, el) {
      $(this).replaceWith(
        $(this).text()
      );
    }).end()
    .find('span.aui-icon').each(function (i, el) {
      $(this).replaceWith(
        $(this).text()
      );
    }).end()
    .html();
  content = fixLinks(content);

  console.log("Relinking images ...");
  relinkImagesInFile(outputFile);
  console.log("done");

  return content
}


function fixLinks(content) {
  var $ = REQUIRED.cheerio.load(content);
  var text = $('a')
    .each(function (i, el) {
      var oldLink = $(this).attr('href');
      if (HTML_FILE_LIST.indexOf(oldLink) > -1) {
        var newLink = REQUIRED.path.basename(oldLink, '.html') + '.md';
        $(this).attr('href', newLink);
      }
    }).end()
    .html();

  return text
}


function relinkImagesInFile(outputFile) {
  var text = REQUIRED.fs.readFileSync(outputFile, 'utf8');
  var matches = uniq(text.match(/(<img src=")([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)/ig));
  var dir = ''; // TODO parent directory of outputFile
  matches.forEach(function (imgTag) {
    imgTag = imgTag.replace('<img src="', '');
    var attachments = imgTag.replace("attachments/", "");
    if (attachments == imgTag) {
      return;
    }
    var fileName = paths.attachmentsExportPath + attachments;
    console.log("Creating image dir: " + fileName.substr(0, fileName.lastIndexOf('/')));
    mkdirpSync(fileName.substr(0, fileName.lastIndexOf('/')));
    console.log("Creating filename: " + fileName);
//        REQUIRED.fs.createReadStream(imgTag).pipe(REQUIRED.fs.createWriteStream(fileName));
    try {
//        var img_content = REQUIRED.fs.readFileSync(dir + "/" + imgTag);
//        REQUIRED.fs.writeFileSync(fileName, imgTag);
      REQUIRED.fs.accessSync(dir + "/" + imgTag, REQUIRED.fs.F_OK);
      REQUIRED.fs.createReadStream(dir + "/" + imgTag)
        .pipe(
          REQUIRED.fs.createWriteStream(
            process.cwd() + "/" + fileName
          )
        );
      console.log("Wrote: " + dir + "/" + imgTag + "\n To: " + process.cwd() + "/" + fileName)
    } catch (e) {
      console.log("Can't read: " + dir + "/" + imgTag)
    }
  });
  var lines = text.replace(
    /(<img src=")([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)/ig,
    "$1" + paths.markdownImageReference + "$3/$4"
  );

  REQUIRED.fs.writeFileSync(outputFile, lines)
}


function uniq(a) {
  return Array.from(new Set(a));
}


function mkdirSync(path) {
  try {
    REQUIRED.fs.mkdirSync(path);
  } catch (e) {
    if (e.code != 'EEXIST') throw e;
  }
}


function mkdirpSync(dirpath) {
  console.log("Making : " + dirpath);
  var parts = dirpath.split(REQUIRED.path.sep);
  for (var i = 1; i <= parts.length; i++) {
    mkdirSync(REQUIRED.path.join.apply(null, parts.slice(0, i)));
  }
}


function getPageTitle(content) {
  var titleRegex = /<title>(.*)<\/title>/i;
  var match = content.match(titleRegex);

  return (match != null && match.length >= 1)
    ? match[1]
    : null
}
