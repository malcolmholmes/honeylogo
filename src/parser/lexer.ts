/**
 * Lexer for the Logo language
 * Breaks input text into tokens for parsing
 */
import { commandMap } from '../spec';

export enum TokenType {
  COMMAND,
  NUMBER,
  STRING,
  VARIABLE,
  REPEAT,
  TO,
  END,
  OPEN_PARENTHESIS,
  CLOSE_PARENTHESIS,
  OPEN_BRACKET,
  CLOSE_BRACKET,
  OPERATOR, // New: for expressions like +, -, *, /
  PROCEDURE,
  MAKE,
  IF,
  COMMENT
}

export interface Token {
  type: TokenType;
  value: string;
}

export class Lexer {
  private input: string;
  private tokens: Token[] = [];

  constructor(input: string) {
    this.input = input.trim();
  }

  /**
   * Tokenize the input string into an array of tokens
   */
  tokenize(): void {
    // Split the input by whitespace and filter out empty strings
    const words = this.input
      .replace(/\[/g, ' [ ')
      .replace(/\]/g, ' ] ')
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .replace(/([+\-*/])/g, ' $1 ') // Add spaces around basic operators
      .replace(/([<>]=?|==|!=)/g, ' $1 ') // Add spaces around comparison operators
      .split(/\s+/)
      .filter(word => word.length > 0);

    // Process each word
    for (const word of words) {
      // Check if the word is a number
      if (/^-?\d+(\.\d+)?$/.test(word)) {
        this.tokens.push({ type: TokenType.NUMBER, value: word });
        continue;
      }

      // Check if the word is a string (starts with ")
      if (word.startsWith('"')) {
        this.tokens.push({ type: TokenType.STRING, value: word.substring(1) });
        continue;
      }

      // Check if the word is a variable (starts with :)
      if (word.startsWith(':')) {
        this.tokens.push({ type: TokenType.VARIABLE, value: word.substring(1) });
        continue;
      }

      // Check if the word is an operator
      if (['+', '-', '*', '/', '<', '>', '<=', '>=', '==', '!='].includes(word)) {
        this.tokens.push({ type: TokenType.OPERATOR, value: word });
        continue;
      }

      if (word === '(') {
        this.tokens.push({ type: TokenType.OPEN_PARENTHESIS, value: '(' });
        continue;
      }

      if (word === ')') {
        this.tokens.push({ type: TokenType.CLOSE_PARENTHESIS, value: ')' });
        continue;
      }
      // Check for brackets
      if (word === '[') {
        this.tokens.push({ type: TokenType.OPEN_BRACKET, value: '[' });
        continue;
      }

      if (word === ']') {
        this.tokens.push({ type: TokenType.CLOSE_BRACKET, value: ']' });
        continue;
      }

      // Handle reserved control keywords first
      const lowerWord = word.toLowerCase();

      // Check for reserved words for procedure handling
      if (lowerWord === 'to') {
        this.tokens.push({ type: TokenType.TO, value: 'TO' });
        continue;
      }
      
      if (lowerWord === 'end') {
        this.tokens.push({ type: TokenType.END, value: 'END' });
        continue;
      }

      // Check if it's a defined command in our spec
      if (commandMap.has(lowerWord)) {
        const commandSpec = commandMap.get(lowerWord)!;
        // Use the official name from the command spec
        this.tokens.push({ type: TokenType.COMMAND, value: commandSpec.name.toLowerCase() });
        continue;
      }

      this.tokens.push({ type: TokenType.PROCEDURE, value: lowerWord });
    }

    // Log the parsed tokens (using console.log for browser environment)
    this.tokens.forEach(token => {
      console.debug(`[Lexer] token: ${TokenType[token.type]}:${token.value}`);
    });
  }

  /**
   * Returns the array of tokens
   */
  getTokens(): Token[] {
    return this.tokens;
  }
}
