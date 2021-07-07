import get from 'lodash.get';
import { Severity } from 'interfaces/level';
import { Color, ColorCode } from 'interfaces/color';

const RESET = '\\x1b[0m' as const;
const COLORS = <const>{
  reset: {
    fg: '\\x1b[0m',
    bg: '\\x1b[0m',
  },
  black: {
    fg: '\\033[30m',
    bg: '\\033[40m',
  },
  red: {
    fg: '\\033[31m',
    bg: '\\033[41m',
  },
  green: {
    fg: '\\033[32m',
    bg: '\\033[42m',
  },
  yellow: {
    fg: '\\033[33m',
    bg: '\\033[43m',
  },
  blue: {
    fg: '\\033[34m',
    bg: '\\033[44m',
  },
  magenta: {
    fg: '\\033[35m',
    bg: '\\033[45m',
  },
  cyan: {
    fg: '\\033[36m',
    bg: '\\033[46m',
  },
  white: {
    fg: '\\033[37m',
    bg: '\\033[47m',
  },
};

/**
 * Color a console message's foreground and background
 * @param  {String} message     Message
 * @param  {String} fgColor     Foreground color
 * @param  {String} bgColor     Background color
 * @return {String}             Message
 */
export function color(message: string, fgColor?: Color, bgColor?: Color): string {
  return [
    <ColorCode>get(COLORS, `${fgColor}.fg`, ''),
    <ColorCode>get(COLORS, `${bgColor}.bg`, ''),
    message,
    <ColorCode>RESET, // Reset the color at the end
  ].join('');
}

/**
 * Get background color based on severity
 * @param {String} severity           Vulnerability's severity
 * @return {(String | undefined)}     Background color or undefined
 */
export function getSeverityBgColor(severity: Severity): 'red' | undefined {
  switch (severity) {
    case 'info':
      return undefined;
    case 'low':
      return undefined;
    case 'moderate':
      return undefined;
    case 'high':
      return 'red';
    case 'critical':
      return 'red';
    default:
      const exhaustiveCheck: never = severity;
      return exhaustiveCheck;
  }
}