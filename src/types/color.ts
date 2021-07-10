type Hexadecimal = '\x1b[';

export type ColorCode = `${Hexadecimal}${number}m` | '';

export type Color = 'reset' | 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | '';
