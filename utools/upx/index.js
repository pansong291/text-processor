const fs = require('node:fs')

function writeTo(str, path) {
  fs.writeFileSync(path, str, 'utf8')
}

function readFrom(path) {
  return fs.readFileSync(path, 'utf8')
}

window._preload = {
  writeTo,
  readFrom
}
