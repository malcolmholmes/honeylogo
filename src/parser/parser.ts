/**
 * Parser for the Logo language
 */
import { Token, TokenType } from './lexer';
import { 
  Command,
  commandMap,
  Program
} from '../spec';
import {
  ArgValue,
  ArgumentType,
  NumberValue,
  StringValue,
  BlockValue,
  CommandValue,
  OperationValue,
  VariableValue
} from './types';

/**
 * Error collection for parser
 */
class ParserError extends Error {
  line: number;
  column: number;
  
  constructor(message: string, line: number = 0, column: number = 0) {
    super(message);
    this.line = line;
    this.column = column;
    this.name = 'ParserError';
  }
}

/**
 * Parse a Logo program
 */
export function parse(source: string, tokens: Token[]): Program {
  const commands: Command[] = [];
  let i = 0;
  const errors: ParserError[] = [];

  while (i < tokens.length) {
    try {
      const [command, consumed] = parseCommand(tokens, i);
      if (command) {
        commands.push(command);
        i += consumed; // No longer add +1, just use the exact token count
      } else {
        // If we couldn't parse a command, report an error and skip the token
        const token = tokens[i];
        errors.push(new ParserError(`Unexpected token: ${token.value}`));
        i++; // Skip the problematic token
      }
    } catch (e) {
      if (e instanceof ParserError) {
        errors.push(e);
      } else {
        errors.push(new ParserError(`Error: ${e}`));
      }
      i++; // Skip the problematic token
    }
  }

  // Create program with collected errors
  const program = new Program(commands, source);
  
  // If we have errors, add them to the program
  if (errors.length > 0) {
    program.errors = errors.map(err => err.message);
    console.error('Parser errors:', program.errors);
  }
  
  return program;
}

/**
 * Parse an expression that evaluates to an ArgValue
 * This function handles basic expressions, including basic mathematical operations
 */
function parseExpression(argType: ArgumentType, tokens: Token[], start: number): [ArgValue | null, number] {
  if (start >= tokens.length) {
    throw new ParserError('Unexpected end of input while parsing expression');
  }

  // Parse the primary expression first
  const [leftValue, leftConsumed] = parsePrimaryExpression(tokens, start);
  if (!leftValue) {
    return [null, 0];
  }

  // Check if there's an operator following the expression
  if (start + leftConsumed < tokens.length && 
      tokens[start + leftConsumed].type === TokenType.OPERATOR) {
    return parseBinaryExpression(argType, tokens, start, leftValue, leftConsumed);
  }

  return [leftValue, leftConsumed];
}

/**
 * Parse a primary expression like a number, string, variable or parenthesized expression
 */
function parsePrimaryExpression(tokens: Token[], start: number): [ArgValue | null, number] {
  if (start >= tokens.length) {
    throw new ParserError('Unexpected end of input while parsing primary expression');
  }

  const token = tokens[start];

  // Handle different token types
  switch (token.type) {
    case TokenType.NUMBER:
      return [new NumberValue(parseFloat(token.value)), 1];
      
    case TokenType.STRING:
      return [new StringValue(token.value), 1];

    case TokenType.VARIABLE:
      // Create a variable reference that will be resolved at runtime
      return [new VariableValue(token.value), 1];
    
    case TokenType.OPEN_BRACKET:
      return parseBlock(tokens, start);
    
    case TokenType.OPEN_PARENTHESIS:
      // Handle parenthesized expressions
      try {
        const [expr, consumed] = parseExpression(ArgumentType.Number, tokens, start + 1);
        if (!expr) {
          throw new ParserError(`Failed to parse expression in parentheses`);
        }
        
        // Make sure there's a closing parenthesis
        if (start + consumed + 1 >= tokens.length || 
            tokens[start + consumed + 1].type !== TokenType.CLOSE_PARENTHESIS) {
          throw new ParserError(`Missing closing parenthesis`);
        }
        
        return [expr, consumed + 2]; // +2 for both parentheses
      } catch (e) {
        throw new ParserError(`Error in parenthesized expression: ${e instanceof Error ? e.message : String(e)}`);
      }
      
    case TokenType.COMMAND:
      // Handle command execution in expressions
      try {
        // Check if this command returns a value
        const commandName = token.value.toLowerCase();
        const commandSpec = commandMap.get(commandName);
        
        if (!commandSpec) {
          throw new ParserError(`Unknown command: ${commandName}`);
        }
        
        // Only allow commands that have returnTypes specified
        if (!commandSpec.returnTypes || commandSpec.returnTypes.length === 0) {
          throw new ParserError(`Command ${commandName} cannot be used in an expression as it does not return a value`);
        }
        
        // Parse the command and its arguments
        const [command, consumed] = parseCommand(tokens, start);
        if (!command) {
          throw new ParserError(`Failed to parse command ${commandName} in expression`);
        }
        
        // Since the command will be evaluated during execution (not parsing),
        // we create a special wrapper value that represents a command to execute
        // when it's evaluated
        return [new CommandValue(command), consumed];
      } catch (e) {
        throw new ParserError(`Error parsing command in expression: ${e instanceof Error ? e.message : String(e)}`);
      }
      
    default:
      throw new ParserError(`Unexpected token in expression: ${token.value} (type: ${TokenType[token.type]})`);
  }
}

/**
 * Parse a binary expression, like 1 + 2
 */
function parseBinaryExpression(
  argType: ArgumentType, 
  tokens: Token[], 
  start: number, 
  leftValue: ArgValue, 
  leftConsumed: number
): [ArgValue | null, number] {
  const operatorToken = tokens[start + leftConsumed];
  const operator = operatorToken.value;
  
  // Parse the right side of the operator
  try {
    const [rightValue, rightConsumed] = parseExpression(argType, tokens, start + leftConsumed + 1);
    if (!rightValue) {
      throw new ParserError(`Failed to parse right side of operator ${operator}`);
    }
    
    // Make sure both sides are numbers or can be evaluated to numbers at runtime
    if ((leftValue.type !== ArgumentType.Number && !(leftValue instanceof CommandValue)) || 
        (rightValue.type !== ArgumentType.Number && !(rightValue instanceof CommandValue))) {
      throw new ParserError(`Operator ${operator} requires number operands, got ${ArgumentType[leftValue.type]} and ${ArgumentType[rightValue.type]}`);
    }
    
    // Create a command that performs the operation at runtime
    return [
      new OperationValue(operator, leftValue, rightValue),
      leftConsumed + 1 + rightConsumed // +1 for the operator
    ];
  } catch (e) {
    throw new ParserError(`Error in binary expression: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * Parse a block of commands enclosed in brackets
 */
function parseBlock(tokens: Token[], start: number): [BlockValue | null, number] {
  // Check for opening bracket
  if (tokens[start].type !== TokenType.OPEN_BRACKET) {
    throw new ParserError(`Expected opening bracket for block, got ${tokens[start].value}`);
  }
  
  const commands: Command[] = [];
  let i = start + 1; // Skip opening bracket
  
  // Parse commands until closing bracket
  while (i < tokens.length && tokens[i].type !== TokenType.CLOSE_BRACKET) {
    try {
      const [command, consumed] = parseCommand(tokens, i);
      if (command) {
        commands.push(command);
        i += consumed; // Changed from consumed + 1 to fix token consumption
      } else {
        throw new ParserError(`Invalid command in block: ${tokens[i].value}`);
      }
    } catch (e) {
      throw new ParserError(`Error in block: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  
  // Check if we found a closing bracket
  if (i >= tokens.length || tokens[i].type !== TokenType.CLOSE_BRACKET) {
    throw new ParserError(`Missing closing bracket for block`);
  }
  
  // Include the closing bracket in the consumed count
  return [new BlockValue(commands), i - start + 1]; // +1 to include the closing bracket
}

/**
 * Parse a command with its arguments
 */
function parseCommand(tokens: Token[], start: number): [Command | null, number] {
  if (start >= tokens.length) {
    return [null, 0];
  }

  const token = tokens[start];

  if (token.type === TokenType.COMMAND) {
    const commandName = token.value.toLowerCase();
    const commandSpec = commandMap.get(commandName);
    
    if (!commandSpec) {
      throw new ParserError(`Unknown command: ${commandName}`);
    }
    
    // Collect arguments based on the command's argument types
    const args: ArgValue[] = [];
    let consumed = 1; // Start with the command token itself
    
    for (const argType of commandSpec.argumentTypes) {
      if (start + consumed >= tokens.length) {
        throw new ParserError(`Not enough arguments for ${commandName}, expected ${commandSpec.argumentTypes.length}`);
      }
      
      // Parse expression based on the expected argument type
      let arg: ArgValue | null;
      let argConsumed: number;
      
      // Special handling for block arguments
      if (argType === ArgumentType.Block) {
        // If this argument is a block, use parseBlock directly
        const blockStart = start + consumed;
        if (blockStart >= tokens.length) {
          throw new ParserError(`Missing block for ${commandName}`);
        }
        
        if (tokens[blockStart].type !== TokenType.OPEN_BRACKET) {
          throw new ParserError(`Expected block for ${commandName}, got ${tokens[blockStart].value}`);
        }
        
        const [blockArg, blockConsumed] = parseBlock(tokens, blockStart);
        if (!blockArg) {
          throw new ParserError(`Failed to parse block for ${commandName}`);
        }
        
        arg = blockArg;
        argConsumed = blockConsumed;
      } else {
        // For non-block arguments, use parseExpression
        [arg, argConsumed] = parseExpression(argType, tokens, start + consumed);
        
        if (!arg) {
          throw new ParserError(`Failed to parse argument for ${commandName}`);
        }
      }
      
      // Check if argument type matches expected type (except for blocks which we handled above)
      if (argType !== ArgumentType.Block && arg.type !== argType) {
        throw new ParserError(`Type mismatch for ${commandName}: expected ${ArgumentType[argType]}, got ${ArgumentType[arg.type]}`);
      }
      
      args.push(arg);
      consumed += argConsumed;
    }
    
    // Create the command with its arguments
    try {
      const command = commandSpec.createCommand(...args);
      return [command, consumed];
    } catch (e) {
      throw new ParserError(`Error creating command ${commandName}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  
  // For procedure calls and other non-standard commands
  if (token.type === TokenType.PROCEDURE) {
    // Handle procedure calls here
    throw new ParserError(`Procedure calls not yet implemented: ${token.value}`);
  }
  
  throw new ParserError(`Unexpected token: ${token.value} (type: ${TokenType[token.type]})`);
}
