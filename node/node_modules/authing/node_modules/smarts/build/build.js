const fs = require('fs')
// const path = require('path')
// const zlib = require('zlib')
// const rollup = require('rollup')
// const uglify = require('uglify-js')

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

fs.createReadStream('src/index.js').pipe(fs.createWriteStream('dist/index.js'))
fs.createReadStream('src/smarts.js').pipe(fs.createWriteStream('dist/smarts.js'))