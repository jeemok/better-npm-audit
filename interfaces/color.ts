type Octal = '\\033';
type Hexadecimal = '\\x1b';

export type ColorCode = `${Octal | Hexadecimal}[${number}m` | '';

export type Color = 'reset' | 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | '';