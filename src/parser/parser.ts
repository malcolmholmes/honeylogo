/**
 * Parser for the Logo language
 */
import { Token, TokenType } from './lexer';
import { StopError, OutputError, NoProcedureOutputError } from '../errors';
import { 
  Command,
  commandMap,
  Program,
  Context,
  evaluateArgValue
} from '../spec';
import { 
  ArgValue, 
  NumberValue, 
  StringValue, 
  VariableValue, 
  CommandValue,
  OperationValue,
  BlockValue,
  ProcedureValue,
  ListValue,
  ArgumentType
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
      // First, try to parse a procedure definition (TO...END)
      const [procCommand, procConsumed] = parseProcedureDefinition(tokens, i);
      if (procCommand) {
        commands.push(procCommand);
        i += procConsumed;
        continue;
      }
      
      // Then, try to parse a regular command or procedure call
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
    } catch (error) {
      console.error(error);
      errors.push(error instanceof ParserError 
        ? error 
        : new ParserError(error instanceof Error ? error.message : String(error))
      );
      i++; // Skip the problematic token on error
    }
  }

  const program = new Program(commands, source);
  program.errors = errors.map(e => e.message);
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

  // Handle unary operators (especially minus)
  if (token.type === TokenType.OPERATOR && (token.value === '-' || token.value === '+')) {
    // Get the operand that follows the unary operator
    const [operand, consumed] = parsePrimaryExpression(tokens, start + 1);
    
    if (!operand) {
      throw new ParserError(`Expected expression after ${token.value} operator`);
    }
    
    // For unary minus, negate the value if it's a number
    if (token.value === '-') {
      if (operand instanceof NumberValue) {
        // Create a new number with the negated value
        return [new NumberValue(-operand.value), consumed + 1];
      } else {
        // For other types, create an operation with appropriate handling at runtime
        return [new OperationValue(
          token.value, 
          new NumberValue(0), 
          operand
        ), consumed + 1];
      }
    }
    
    // For unary plus, just return the operand as it is
    return [operand, consumed + 1];
  }

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
      // Determine if this is a list literal or a code block
      // In the context of expressions, treat it as a list literal
      return parseList(tokens, start);
    
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
    case TokenType.PROCEDURE:
      try {
        const procedureName = token.value.toLowerCase();
        
        // Use the same argument parsing approach as in the parseProcedureCall function
        const args: ArgValue[] = [];
        let consumed = 1; // Start with 1 for the procedure name token
        
        // Parse arguments just like in parseProcedureCall
        while (start + consumed < tokens.length) {
          try {
            const [arg, argConsumed] = parseExpression(ArgumentType.Any, tokens, start + consumed);
            if (!arg) break;
            
            args.push(arg);
            consumed += argConsumed;
          } catch (e) {
            // If parsing fails, we've reached the end of arguments
            break;
          }
        }
        
        // Create a wrapper that will execute the procedure and handle its output
        return [new CommandValue({
          execute(ctx: Context): ArgValue | void {
            const proc = ctx.getProcedure(procedureName);
            if (!proc) {
              throw new Error(`Undefined procedure: ${procedureName}`);
            }
            
            // Create a procedure context and execute it with proper error handling
            try {
              // Evaluate all arguments before passing them to the procedure
              const evaluatedArgs = args.map(arg => evaluateArgValue(ctx, arg));
              
              // Create a new context with parameters
              const procContext = ctx.createProcedureContext(proc.paramNames, evaluatedArgs);
              
              // Execute the procedure commands with OutputError handling
              let lastResult: ArgValue | void = undefined;
              for (const cmd of proc.commands) {
                try {
                  const result = cmd.execute(procContext);
                  if (result !== undefined) {
                    procContext.setLastResult(result);
                    lastResult = result;
                  }
                } catch (error) {
                  if (error instanceof OutputError) {
                    // Return the output value from the procedure
                    return error.value;
                  }
                  throw error; // Rethrow other errors
                }
              }
              
              // If we get here and no output was produced, throw an error
              if (lastResult === undefined) {
                throw new NoProcedureOutputError(procedureName);
              }
              
              return lastResult;
            } catch (error) {
              if (error instanceof OutputError) {
                return error.value;
              }
              throw error;
            }
          },
          toString(): string {
            return `${procedureName}${args.length > 0 ? ' ' + args.map((a) => a.toString()).join(' ') : ''}`;
          }
        }), consumed];
      } catch (e) {
        throw new ParserError(`Error parsing procedure in expression: ${e instanceof Error ? e.message : String(e)}`);
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
 * Parse a list literal [item1 item2 ...]
 */
function parseList(tokens: Token[], start: number): [ListValue | null, number] {
  // Check for opening bracket
  if (tokens[start].type !== TokenType.OPEN_BRACKET) {
    throw new ParserError(`Expected opening bracket for list, got ${tokens[start].value}`);
  }
  
  const items: ArgValue[] = [];
  let i = start + 1; // Skip opening bracket
  
  // Parse items until closing bracket
  while (i < tokens.length && tokens[i].type !== TokenType.CLOSE_BRACKET) {
    try {
      // Parse each item as a primary expression
      const [item, consumed] = parsePrimaryExpression(tokens, i);
      if (item) {
        items.push(item);
        i += consumed;
      } else {
        throw new ParserError(`Invalid item in list: ${tokens[i].value}`);
      }
    } catch (e) {
      throw new ParserError(`Error in list: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  
  // Check if we found a closing bracket
  if (i >= tokens.length || tokens[i].type !== TokenType.CLOSE_BRACKET) {
    throw new ParserError(`Missing closing bracket for list`);
  }
  
  // Include the closing bracket in the consumed count
  return [new ListValue(items), i - start + 1]; // +1 to include the closing bracket
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
      
      // Special handling for block and list arguments
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
      } else if (argType === ArgumentType.List) {
        // If this argument is a list, use parseList directly
        const listStart = start + consumed;
        if (listStart >= tokens.length) {
          throw new ParserError(`Missing list for ${commandName}`);
        }
        
        // For list arguments, check if we have an open bracket
        if (tokens[listStart].type === TokenType.OPEN_BRACKET) {
          const [listArg, listConsumed] = parseList(tokens, listStart);
          if (!listArg) {
            throw new ParserError(`Failed to parse list for ${commandName}`);
          }
          
          arg = listArg;
          argConsumed = listConsumed;
        } else {
          // If not a literal list, it might be a variable or expression that returns a list
          [arg, argConsumed] = parseExpression(argType, tokens, start + consumed);
          if (!arg) {
            throw new ParserError(`Failed to parse list argument for ${commandName}`);
          }
        }
      } else {
        // For other arguments, use parseExpression
        [arg, argConsumed] = parseExpression(argType, tokens, start + consumed);
        
        if (!arg) {
          throw new ParserError(`Failed to parse argument for ${commandName}`);
        }
      }
      
      // Check if argument type matches expected type (except for blocks which we handled above)
      // ArgumentType.Any is a special case that accepts any type
      if (argType !== ArgumentType.Block && argType !== ArgumentType.Any && arg.type !== argType) {
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
    return parseProcedureCall(tokens, start);
  }
  
  if (token.type === TokenType.TO) {
    return parseProcedureDefinition(tokens, start);
  }
  
  throw new ParserError(`Unexpected token: ${token.value} (type: ${TokenType[token.type]})`);
}

/**
 * Parse a procedure definition (TO...END)
 */
function parseProcedureDefinition(tokens: Token[], start: number): [Command | null, number] {
  if (start >= tokens.length || tokens[start].type !== TokenType.TO) {
    return [null, 0];
  }
  
  // Skip the TO token
  let currentPos = start + 1;
  
  // Expect procedure name
  if (currentPos >= tokens.length) {
    throw new ParserError('Unexpected end of input while parsing procedure definition');
  }
  
  const nameToken = tokens[currentPos++];
  if (nameToken.type !== TokenType.COMMAND && nameToken.type !== TokenType.PROCEDURE) {
    throw new ParserError(`Expected procedure name after TO, got ${nameToken.value}`);
  }
  
  const procedureName = nameToken.value;
  
  // Parse parameter names (all :VARIABLE tokens before the first command)
  const paramNames: string[] = [];
  while (currentPos < tokens.length && tokens[currentPos].type === TokenType.VARIABLE) {
    const paramName = tokens[currentPos].value;
    paramNames.push(paramName);
    currentPos++;
  }
  
  // Parse the procedure body (all commands until END)
  const procedureCommands: Command[] = [];
  let foundEnd = false;
  
  while (currentPos < tokens.length) {
    if (tokens[currentPos].type === TokenType.END) {
      foundEnd = true;
      currentPos++;
      break;
    }
    
    const [command, consumed] = parseCommand(tokens, currentPos);
    if (command) {
      procedureCommands.push(command);
      currentPos += consumed;
    } else {
      // If we couldn't parse a command, skip it
      currentPos++;
    }
  }
  
  if (!foundEnd) {
    throw new ParserError(`Missing END for procedure ${procedureName}`);
  }
  
  // Create a command that defines a procedure
  return [
    {
      execute(ctx: Context): void {
        const proc = new ProcedureValue(procedureName, paramNames, procedureCommands);
        ctx.setProcedure(procedureName, proc);
      },
      toString(): string {
        const paramsStr = paramNames.map(p => `:${p}`).join(' ');
        const bodyStr = procedureCommands.map(cmd => `  ${cmd.toString()}`).join('\n');
        return `TO ${procedureName} ${paramsStr}\n${bodyStr}\nEND`;
      }
    },
    currentPos - start
  ];
}

/**
 * Parse a procedure call
 */
function parseProcedureCall(tokens: Token[], start: number): [Command | null, number] {
  if (start >= tokens.length || tokens[start].type !== TokenType.PROCEDURE) {
    return [null, 0];
  }
  
  const procedureName = tokens[start].value;
  let consumed = 1;
  
  // Parse arguments
  const args: ArgValue[] = [];
  while (start + consumed < tokens.length) {
    // Try to parse an argument
    try {
      const [arg, argConsumed] = parseExpression(ArgumentType.Number, tokens, start + consumed);
      if (!arg) {
        break;
      }
      
      args.push(arg);
      consumed += argConsumed;
    } catch (e) {
      // If parsing fails, we've reached the end of arguments
      break;
    }
  }
  
  // Create a command that calls the procedure
  return [
    {
      execute(ctx: Context): ArgValue | void {
        const proc = ctx.getProcedure(procedureName);
        if (!proc) {
          throw new Error(`Undefined procedure: ${procedureName}`);
        }
        
        // Evaluate all arguments before passing them to the procedure
        const evaluatedArgs = args.map(arg => evaluateArgValue(ctx, arg));
        
        // Create a new context with parameters
        const procContext = ctx.createProcedureContext(proc.paramNames, evaluatedArgs);
        
        // Execute the procedure commands
        let lastResult: ArgValue | void = undefined;
        for (const cmd of proc.commands) {
          try {
            const result = cmd.execute(procContext);
            if (result !== undefined) {
              procContext.setLastResult(result);
              lastResult = result;
            }
          } catch (error) {
            if (error instanceof StopError) {
              return lastResult;
            } else if (error instanceof OutputError) {
              return (error as OutputError).value;
            }
            throw error;
          }
        }
        
        // Return the last result from the procedure (if any)
        return lastResult;
      },
      toString(): string {
        return `${procedureName} ${args.map(arg => arg.toString()).join(' ')}`;
      }
    },
    consumed
  ];
}
