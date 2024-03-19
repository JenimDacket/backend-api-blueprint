export type ArgInput = {
  key: number;
  repl: string;
};

const createRegexPattern = (i: number): RegExp => {
  const exp = new RegExp(`\\{\\{${i}\\}\\}`, 'g');
  return exp;
};

/**
 * The ...args borrows from the ArgInput structure:
 *
 * type ArgInput = {
 *  key: number;
 *  repl: string;
 * };
 */
export const promptReplacer = (p: string, ...args: ArgInput[]): string => {
  for (const arg of args) {
    p = p.replaceAll(createRegexPattern(arg.key), arg.repl);
  }
  return p;
};
