const fs = require('fs');
const { isJsonString } = require('./common');

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
