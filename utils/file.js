const fs = require('fs');
const { isJsonString } = require('./common');

/**
 * @param  {String} path        The file path
 * @return {(Object|Boolean)}   Returns the parsed data if found, or else returns `false`
 */
function readFile(path) {
  try {
    const data = fs.readFileSync(path, 'utf8');
    if (!isJsonString(data)) {
      return false;
    }
    return JSON.parse(data);
  } catch (err) {
    return false;
  }
}

module.exports = {
  readFile,
};
