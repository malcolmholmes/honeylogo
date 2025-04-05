/**
 * Lexer module for the Logo language
 * TypeScript equivalent of the Go implementation
 */

// Define token types
export enum TokenType {
  COMMAND = 'COMMAND',
  NUMBER = 'NUMBER',
  REPEAT = 'REPEAT',
  OPEN_BRACKET = 'OPEN_BRACKET',
  CLOSE_BRACKET = 'CLOSE_BRACKET',
  VARIABLE = 'VARIABLE',
  PROCEDURE = 'PROCEDURE',
  TO = 'TO',
  END = 'END',
  MAKE = 'MAKE',
  IF = 'IF',
  STRING = 'STRING',
  OPERATOR = 'OPERATOR',
  COMMENT = 'COMMENT'
}

// Token represents a parsed token in Logo
export interface Token {
  type: TokenType;
  value: string;
}

// Lexer breaks input into tokens
export class Lexer {
  private input: string;
  private tokens: Token[] = [];

  constructor(input: string) {
    this.input = input.trim();
  }

  // Tokenize breaks the input into tokens
  public tokenize(): void {
    const tokens: Token[] = [];
    
    // Use a more flexible tokenization method
    let input = this.input;
    input = input.replace(/\[/g, ' [ ');
    input = input.replace(/\]/g, ' ] ');
    const words = input.split(/\s+/).filter(word => word !== '');

    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      let num: number;

      // Handle comments
      if (word.startsWith(';')) {
        // Skip rest of line - in this simplified version, we just break
        break;
      }

      switch (word) {
        // Movement commands
        case 'forward':
        case 'fd':
          tokens.push({ type: TokenType.COMMAND, value: 'forward' });
          break;
        case 'backward':
        case 'bk':
          tokens.push({ type: TokenType.COMMAND, value: 'backward' });
          break;
        case 'left':
        case 'lt':
          tokens.push({ type: TokenType.COMMAND, value: 'left' });
          break;
        case 'right':
        case 'rt':
          tokens.push({ type: TokenType.COMMAND, value: 'right' });
          break;
        case 'setx':
          tokens.push({ type: TokenType.COMMAND, value: 'setx' });
          break;
        case 'sety':
          tokens.push({ type: TokenType.COMMAND, value: 'sety' });
          break;
        case 'setheading':
        case 'seth':
          tokens.push({ type: TokenType.COMMAND, value: 'setheading' });
          break;
        case 'home':
          tokens.push({ type: TokenType.COMMAND, value: 'home' });
          break;
        case 'clearscreen':
        case 'cs':
          tokens.push({ type: TokenType.COMMAND, value: 'clearscreen' });
          break;

        // Pen commands
        case 'penup':
        case 'pu':
          tokens.push({ type: TokenType.COMMAND, value: 'penup' });
          break;
        case 'pendown':
        case 'pd':
          tokens.push({ type: TokenType.COMMAND, value: 'pendown' });
          break;
        case 'hideturtle':
        case 'ht':
          tokens.push({ type: TokenType.COMMAND, value: 'hideturtle' });
          break;
        case 'showturtle':
        case 'st':
          tokens.push({ type: TokenType.COMMAND, value: 'showturtle' });
          break;
        case 'setpencolor':
        case 'setpc':
          tokens.push({ type: TokenType.COMMAND, value: 'setpencolor' });
          break;
        case 'setpensize':
        case 'setps':
          tokens.push({ type: TokenType.COMMAND, value: 'setpensize' });
          break;

        // Control structures
        case 'repeat':
        case 'rp':
          tokens.push({ type: TokenType.REPEAT, value: 'repeat' });
          break;
        case 'to':
          tokens.push({ type: TokenType.TO, value: 'to' });
          break;
        case 'end':
          tokens.push({ type: TokenType.END, value: 'end' });
          break;
        case 'if':
          tokens.push({ type: TokenType.IF, value: 'if' });
          break;
        case 'make':
          tokens.push({ type: TokenType.MAKE, value: 'make' });
          break;

        // Brackets and operators
        case '[':
          tokens.push({ type: TokenType.OPEN_BRACKET, value: '[' });
          break;
        case ']':
          tokens.push({ type: TokenType.CLOSE_BRACKET, value: ']' });
          break;
        case '+':
        case '-':
        case '*':
        case '/':
        case '<':
        case '>':
        case '=':
          tokens.push({ type: TokenType.OPERATOR, value: word });
          break;

        default:
          // Check if it's a number
          num = parseFloat(word);
          if (!isNaN(num)) {
            tokens.push({ type: TokenType.NUMBER, value: num.toString() });
            continue;
          }

          // Check if it's a variable (starts with ":")
          if (word.startsWith(':')) {
            tokens.push({ type: TokenType.VARIABLE, value: word.substring(1) });
            continue;
          }

          // Check if it's a string (starts with ")
          if (word.startsWith('"')) {
            tokens.push({ type: TokenType.STRING, value: word.substring(1) });
            continue;
          }

          // Assume it's a procedure name
          tokens.push({ type: TokenType.PROCEDURE, value: word });
      }
    }

    this.tokens = tokens;

    // Log the parsed tokens (using console.log for browser environment)
    tokens.forEach(token => {
      console.debug(`[Lexer] token: ${token.type}:${token.value}`);
    });
  }

  // getTokens returns the parsed tokens
  public getTokens(): Token[] {
    return this.tokens;
  }
}
