const RESET_COLOR = '\x1b[0m';
const FG_WHITE = '\x1b[37m';
const BG_BLACK = '\x1b[40m';

/**
 * @param  {String} string      The error message
 * @return {Boolean}            Returns `true`
 */
function error(string) {
  console.error(`${FG_WHITE}${BG_BLACK}${string}${RESET_COLOR}`);
  return true;
}

/**
 * @param  {String} string      The info message
 * @return {Boolean}            Returns `true`
 */
function info(string) {
  console.info(`${FG_WHITE}${string}${RESET_COLOR}`);
  return true;
}

module.exports = {
  error,
  info,
  RESET_COLOR,
  FG_WHITE,
  BG_BLACK,
};
