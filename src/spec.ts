/**
 * HoneyLogo Specification
 * 
 * This file defines the command specifications for the HoneyLogo language,
 * including argument types and command creation functions.
 */
import { TurtleHandle } from './components/Turtle';
import { 
  ArgumentType,
  ArgValue, 
  NumberValue, 
  StringValue,
  BlockValue,
  CommandValue,
  OperationValue,
  VariableValue,
  ProcedureValue
} from './parser/types';

/**
 * Context represents the execution environment
 */
export class Context {
  turtle: TurtleHandle;
  variables: Map<string, ArgValue>;
  procedures: Map<string, ProcedureValue>;
  lastResult: ArgValue | null;
  output: (message: string) => void;

  constructor(turtle: TurtleHandle, outputCallback: (message: string) => void = () => {}) {
    this.turtle = turtle;
    this.variables = new Map<string, ArgValue>();
    this.procedures = new Map<string, ProcedureValue>();
    this.lastResult = null;
    this.output = outputCallback;
  }
  
  setVariable(name: string, value: ArgValue): void {
    this.variables.set(name.toLowerCase(), value);
  }
  
  getVariable(name: string): ArgValue | undefined {
    return this.variables.get(name.toLowerCase());
  }
  
  setProcedure(name: string, proc: ProcedureValue): void {
    this.procedures.set(name.toLowerCase(), proc);
  }
  
  getProcedure(name: string): ProcedureValue | undefined {
    return this.procedures.get(name.toLowerCase());
  }
  
  setLastResult(value: ArgValue | null): void {
    this.lastResult = value;
  }
  
  // Create a new context for procedure execution with local variables
  createProcedureContext(params: string[], args: ArgValue[]): Context {
    const procContext = new Context(this.turtle, this.output);
    
    // Copy all procedures from the parent context
    this.procedures.forEach((value, key) => {
      procContext.procedures.set(key, value);
    });
    
    // Set parameter values as local variables
    for (let i = 0; i < Math.min(params.length, args.length); i++) {
      procContext.setVariable(params[i], args[i]);
    }
    
    return procContext;
  }
}

/**
 * Command is the interface for all Logo commands
 */
export interface Command {
  execute(ctx: Context): ArgValue | void;
  toString(): string;
}

/**
 * Program represents a complete Logo program
 */
export class Program implements Iterable<Command> {
  source: string;
  commands: Command[];
  errors: string[] = [];

  constructor(commands: Command[], source: string = '') {
    this.commands = commands;
    this.source = source;
  }

  execute(ctx: Context): void {
    for (const cmd of this.commands) {
      const result = cmd.execute(ctx);
      if (result !== undefined) {
        ctx.setLastResult(result);
      }
    }
  }
  
  // Execute a specific command by index
  executeCommand(ctx: Context, index: number): ArgValue | void {
    if (index >= 0 && index < this.commands.length) {
      const result = this.commands[index].execute(ctx);
      if (result !== undefined) {
        ctx.setLastResult(result);
      }
      return result;
    }
    return undefined;
  }

  toString(): string {
    // If there are errors, include them in the output
    if (this.errors.length > 0) {
      const errorMessages = this.errors.map(err => `Error: ${err}`).join('\n');
      return `${errorMessages}\n\nProgram:\n${this.commands.map(cmd => cmd.toString()).join('\n')}`;
    }
    return this.commands.map(cmd => cmd.toString()).join('\n');
  }

  // Array-like interface for backward compatibility
  [Symbol.iterator](): Iterator<Command> {
    return this.commands[Symbol.iterator]();
  }

  // Add common array methods
  map<T>(callbackfn: (value: Command, index: number, array: Command[]) => T): T[] {
    return this.commands.map(callbackfn);
  }

  forEach(callbackfn: (value: Command, index: number, array: Command[]) => void): void {
    this.commands.forEach(callbackfn);
  }

  get length(): number {
    return this.commands.length;
  }
}

/**
 * Command specification interface
 */
export interface CommandSpec {
  name: string;
  aliases: string[];
  description: string;
  example?: string;
  argumentTypes: ArgumentType[];
  returnTypes?: ArgumentType[];
  createCommand: (...args: ArgValue[]) => Command;
  category: CommandCategory;
}

/**
 * Command categories for organization
 */
export enum CommandCategory {
  TurtleGraphics = 'Turtle Graphics',
  Graphics = 'Graphics',
  ListProcessing = 'List Processing',
  ControlStructures = 'Control Structures',
  Variables = 'Variables',
  IOOperations = 'Input/Output Operations',
  MathsFunctions = 'Mathematical Functions',
}

/**
 * Complete specification of all HoneyLogo commands
 */
export const LOGO_COMMANDS: CommandSpec[] = [
    {
      name: 'FORWARD',
      aliases: ['FD'],
      description: 'Move the turtle forward by the specified distance',
      example: 'FORWARD 100',
      argumentTypes: [ArgumentType.Number],
      createCommand: (distance: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedDistance = evaluateArgValue(ctx, distance);
            if (evaluatedDistance.type !== ArgumentType.Number) {
              throw new Error('FORWARD command requires a number');
            }
            const distanceValue = (evaluatedDistance as NumberValue).value;
            ctx.turtle.forward(distanceValue);
          },
          toString(): string {
            return `FORWARD ${distance.toString()}`;
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'BACK',
      aliases: ['BK'],
      description: 'Move turtle backward',
      argumentTypes: [ArgumentType.Number],
      createCommand: (distance: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedDistance = evaluateArgValue(ctx, distance);
            if (evaluatedDistance.type !== ArgumentType.Number) {
              throw new Error('BACK command requires a number');
            }
            const distanceValue = (evaluatedDistance as NumberValue).value;
            ctx.turtle.forward(-distanceValue);
          },
          toString(): string {
            return `BACK ${distance.toString()}`;
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'LEFT',
      aliases: ['LT'],
      description: 'Turn the turtle left by the specified angle in degrees',
      example: 'LEFT 90',
      argumentTypes: [ArgumentType.Number],
      createCommand: (angle: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedAngle = evaluateArgValue(ctx, angle);
            if (evaluatedAngle.type !== ArgumentType.Number) {
              throw new Error('LEFT command requires a number');
            }
            const angleValue = (evaluatedAngle as NumberValue).value;
            ctx.turtle.left(angleValue);
          },
          toString(): string {
            return `LEFT ${angle.toString()}`;
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'RIGHT',
      aliases: ['RT'],
      description: 'Turn the turtle right by the specified angle in degrees',
      example: 'RIGHT 90',
      argumentTypes: [ArgumentType.Number],
      createCommand: (angle: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedAngle = evaluateArgValue(ctx, angle);
            if (evaluatedAngle.type !== ArgumentType.Number) {
              throw new Error('RIGHT command requires a number');
            }
            const angleValue = (evaluatedAngle as NumberValue).value;
            ctx.turtle.right(angleValue);
          },
          toString(): string {
            return `RIGHT ${angle.toString()}`;
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'PENDOWN',
      aliases: ['PD'],
      description: 'Lower the pen, so the turtle draws when it moves',
      example: 'PENDOWN',
      argumentTypes: [],
      createCommand: () => {
        return {
          execute(ctx: Context): void {
            ctx.turtle.penDown();
          },
          toString(): string {
            return "PENDOWN";
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'PENUP',
      aliases: ['PU'],
      description: 'Lift the pen, so the turtle does not draw when it moves',
      example: 'PENUP',
      argumentTypes: [],
      createCommand: () => {
        return {
          execute(ctx: Context): void {
            ctx.turtle.penUp();
          },
          toString(): string {
            return "PENUP";
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'PENPAINT',
      aliases: ['PPT'],
      description: 'Draw in the foreground colour',
      example: 'PENPAINT',
      argumentTypes: [],
      createCommand: () => {
        return {
          execute(ctx: Context): void {
            ctx.turtle.penPaint();
          },
          toString(): string {
            return "PENPAINT";
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'PENERASE',
      aliases: ['PE'],
      description: 'Draw in the background colour',
      example: 'PENERASE',
      argumentTypes: [],
      createCommand: () => {
        return {
          execute(ctx: Context): void {
            ctx.turtle.penErase();
          },
          toString(): string {
            return "PENERASE";
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'PENREVERSE',
      aliases: ['PX'],
      description: 'Invert the background colour',
      example: 'PENREVERSE',
      argumentTypes: [],
      createCommand: () => {
        return {
          execute(ctx: Context): void {
            ctx.turtle.penReverse();
          },
          toString(): string {
            return "PENREVERSE";
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'HIDETURTLE',
      aliases: ['HT'],
      description: 'Hide the turtle',
      example: 'HIDETURTLE',
      argumentTypes: [],
      createCommand: () => {
        return {
          execute(ctx: Context): void {
            ctx.turtle.hideTurtle();
          },
          toString(): string {
            return "HIDETURTLE";
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'SHOWTURTLE',
      aliases: ['ST'],
      description: 'Show the turtle',
      example: 'SHOWTURTLE',
      argumentTypes: [],
      createCommand: () => {
        return {
          execute(ctx: Context): void {
            ctx.turtle.showTurtle();
          },
          toString(): string {
            return "SHOWTURTLE";
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'CLEARSCREEN',
      aliases: ['CS'],
      description: 'Clear the graphics screen',
      argumentTypes: [],
      createCommand: () => {
        return {
          execute(ctx: Context): void {
            ctx.turtle.clear();
          },
          toString(): string {
            return "CLEARSCREEN";
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'SETHEADING',
      aliases: ['SETH'],
      description: 'Set turtle heading',
      argumentTypes: [ArgumentType.Number],
      createCommand: (angle: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedAngle = evaluateArgValue(ctx, angle);
            if (evaluatedAngle.type !== ArgumentType.Number) {
              throw new Error('SETHEADING command requires a number');
            }
            const angleValue = (evaluatedAngle as NumberValue).value;
            ctx.turtle.setHeading?.(angleValue);
          },
          toString(): string {
            return `SETHEADING ${angle.toString()}`;
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'SETPOSITION',
      aliases: ['SETPOS', 'SETXY', 'SXY'],
      description: 'Set turtle X and Y coordinates',
      example: 'SETPOSITION 100 100',
      argumentTypes: [ArgumentType.Number, ArgumentType.Number],
      createCommand: (x: ArgValue, y: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the arguments to handle nested commands
            const evaluatedX = evaluateArgValue(ctx, x);
            const evaluatedY = evaluateArgValue(ctx, y);
            if (evaluatedX.type !== ArgumentType.Number || evaluatedY.type !== ArgumentType.Number) {
              throw new Error('SETPOSITION command requires two numbers');
            }
            const xValue = (evaluatedX as NumberValue).value;
            const yValue = (evaluatedY as NumberValue).value;
            ctx.turtle.setPosition?.(xValue, yValue);
          },
          toString(): string {
            return `SETPOSITION ${x.toString()} ${y.toString()}`;
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'SETX',
      aliases: [],
      description: 'Set the X coordinate of the turtle',
      argumentTypes: [ArgumentType.Number],
      createCommand: (x: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedX = evaluateArgValue(ctx, x);
            if (evaluatedX.type !== ArgumentType.Number) {
              throw new Error('SETX command requires a number');
            }
            const xValue = (evaluatedX as NumberValue).value;
            ctx.turtle.setPosition?.(xValue, null);
          },
          toString(): string {
            return `SETX ${x.toString()}`;
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'SETY',
      aliases: [],
      description: 'Set the Y coordinate of the turtle',
      argumentTypes: [ArgumentType.Number],
      createCommand: (y: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedY = evaluateArgValue(ctx, y);
            if (evaluatedY.type !== ArgumentType.Number) {
              throw new Error('SETY command requires a number');
            }
            const yValue = (evaluatedY as NumberValue).value;
            ctx.turtle.setPosition?.(null, yValue);
          },
          toString(): string {
            return `SETY ${y.toString()}`;
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'HOME',
      aliases: [],
      description: 'Move the turtle to the center of the canvas, facing up',
      example: 'HOME',
      argumentTypes: [],
      createCommand: () => {
        return {
          execute(ctx: Context): void {
            ctx.turtle.home?.();
          },
          toString(): string {
            return "HOME";
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
    {
      name: 'SETPENCOLOR',
      aliases: ['SPC', 'SETPENCOLOUR'],
      description: 'Set the pen color',
      example: 'SETPENCOLOR "red"',
      argumentTypes: [ArgumentType.String],
      createCommand: (colorValue: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedColor = evaluateArgValue(ctx, colorValue);
            if (evaluatedColor.type !== ArgumentType.String) {
              throw new Error('SETCOLOR command requires a string');
            }
            const color = (evaluatedColor as StringValue).value;
            // Convert to CSS color format
            //const cssColor = `rgb(${color}, 0, 0)`;
            ctx.turtle.setColor(color);
          },
          toString(): string {
            return `SETCOLOR ${colorValue.toString()}`;
          }
        };
      },
      category: CommandCategory.Graphics
    },
    {
      name: 'SETBACKGROUND',
      aliases: ['SETSCREENCOLOR', 'SETSCREENCOLOUR', 'SETBG', 'SETSC'],
      description: 'Set the background color',
      example: 'SETBACKGROUND "red"',
      argumentTypes: [ArgumentType.String],
      createCommand: (colorValue: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedColor = evaluateArgValue(ctx, colorValue);
            if (evaluatedColor.type !== ArgumentType.String) {
              throw new Error('SETCOLOR command requires a string');
            }
            const color = (evaluatedColor as StringValue).value;
            // Convert to CSS color format
            //const cssColor = `rgb(${color}, 0, 0)`;
            ctx.turtle.setBackgroundColor(color);
          },
          toString(): string {
            return `SETCOLOR ${colorValue.toString()}`;
          }
        };
      },
      category: CommandCategory.Graphics
    },
    {
      name: 'SETPENSIZE',
      aliases: ['SETPS'],
      description: 'Set pen size',
      argumentTypes: [ArgumentType.Number],
      createCommand: (size: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedSize = evaluateArgValue(ctx, size);
            if (evaluatedSize.type !== ArgumentType.Number) {
              throw new Error('SETPENSIZE command requires a number');
            }
            const penSize = (evaluatedSize as NumberValue).value;
            ctx.turtle.setPenSize?.(penSize);
          },
          toString(): string {
            return `SETPENSIZE ${size.toString()}`;
          }
        };
      },
      category: CommandCategory.Graphics
    },
    {
      name: 'REPEAT',
      aliases: ['RP'],
      description: 'Repeat a block of commands a specified number of times',
      example: 'REPEAT 4 [ FORWARD 100 RIGHT 90 ]',
      argumentTypes: [ArgumentType.Number, ArgumentType.Block],
      createCommand: (count: ArgValue, block: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedCount = evaluateArgValue(ctx, count);
            if (evaluatedCount.type !== ArgumentType.Number) {
              throw new Error('REPEAT command requires a number');
            }
            const times = (evaluatedCount as NumberValue).value;
            const commandsToRepeat = (block as BlockValue).commands;
            for (let i = 0; i < times; i++) {
              for (const cmd of commandsToRepeat) {
                cmd.execute(ctx);
              }
            }
          },
          toString(): string {
            const commandsToRepeat = (block as BlockValue).commands;
            return `REPEAT ${count.toString()} [ ${commandsToRepeat.map((cmd: Command) => cmd.toString()).join(' ')} ]`;
          }
        };
      },
      category: CommandCategory.ControlStructures
    },
    {
      name: 'IF',
      aliases: [],
      description: 'conditional commands',
      example: 'IF 1 == 1 [ FORWARD 100 ]',
      argumentTypes: [ArgumentType.Number, ArgumentType.Block],
      createCommand: (condition: ArgValue, block: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedCondition = evaluateArgValue(ctx, condition);
            if (evaluatedCondition.type !== ArgumentType.Number) {
              throw new Error('IF command requires a number');
            }
            const cond = (evaluatedCondition as NumberValue).value;
            const commandsToExecute = (block as BlockValue).commands;
            if (cond) {
              for (const cmd of commandsToExecute) {
                cmd.execute(ctx);
              }
            }
          },
          toString(): string {
            const commandsToExecute = (block as BlockValue).commands;
            return `IF ${condition.toString()} [ ${commandsToExecute.map((cmd: Command) => cmd.toString()).join(' ')} ]`;
          }
        };
      },
      category: CommandCategory.ControlStructures
    },
    {
      name: 'IFELSE',
      aliases: [],
      description: 'conditional commands',
      example: 'IFELSE 1 == 1 [ FORWARD 100 ] [ RIGHT 90 ]',
      argumentTypes: [ArgumentType.Number, ArgumentType.Block, ArgumentType.Block],
      createCommand: (condition: ArgValue, block: ArgValue, elseBlock: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedCondition = evaluateArgValue(ctx, condition);
            if (evaluatedCondition.type !== ArgumentType.Number) {
              throw new Error('IFELSE command requires a number');
            }
            const cond = (evaluatedCondition as NumberValue).value;
            const commandsToExecute = (block as BlockValue).commands;
            const elseCommandsToExecute = (elseBlock as BlockValue).commands;
            if (cond) {
              for (const cmd of commandsToExecute) {
                cmd.execute(ctx);
              }
            } else {
              for (const cmd of elseCommandsToExecute) {
                cmd.execute(ctx);
              }
            }
          },
          toString(): string {
            const commandsToExecute = (block as BlockValue).commands;
            const elseCommandsToExecute = (elseBlock as BlockValue).commands;
            return `IFELSE ${condition.toString()} [ ${commandsToExecute.map((cmd: Command) => cmd.toString()).join(' ')} ] [ ${elseCommandsToExecute.map((cmd: Command) => cmd.toString()).join(' ')} ]`;
          }
        };
      },
      category: CommandCategory.ControlStructures
    },
    {
      name: 'RANDOM',
      aliases: ['RND'],
      description: 'Generate a random integer between 0 and the specified maximum value',
      example: 'RANDOM 100',
      argumentTypes: [ArgumentType.Number],
      returnTypes: [ArgumentType.Number],
      createCommand: (number: ArgValue) => {
        return {
          execute(ctx: Context): ArgValue {
            // Evaluate the argument to handle nested commands
            const evaluatedNumber = evaluateArgValue(ctx, number);
            if (evaluatedNumber.type !== ArgumentType.Number) {
              throw new Error('RANDOM command requires a number');
            }
            const max = (evaluatedNumber as NumberValue).value;
            const randomInt = Math.floor(Math.random() * (max + 1));
            ctx.output(`Random value: ${randomInt}`);
            return new NumberValue(randomInt);
          },
          toString(): string {
            return `RANDOM ${number.toString()}`;
          }
        };
      },
      category: CommandCategory.MathsFunctions
    },
    {
      name: 'WAIT',
      aliases: ['WT'],
      description: 'Pause for a specified duration in milliseconds',
      example: 'WAIT 1000',
      argumentTypes: [ArgumentType.Number],
      createCommand: (duration: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the argument to handle nested commands
            const evaluatedDuration = evaluateArgValue(ctx, duration);
            if (evaluatedDuration.type !== ArgumentType.Number) {
              throw new Error('WAIT command requires a number');
            }
            const ms = (evaluatedDuration as NumberValue).value;
            
            // Use the turtle's wait method to add to the animation queue
            ctx.output(`Waiting for ${ms}ms...`);
            ctx.turtle.wait?.(ms);
          },
          toString(): string {
            return `WAIT ${duration.toString()}`;
          }
        };
      },
      category: CommandCategory.IOOperations
    },
    {
      name: 'MAKE',
      aliases: ['SET'],
      description: 'Assign a value to a variable',
      example: 'MAKE "var 100',
      argumentTypes: [ArgumentType.String, ArgumentType.Number],
      createCommand: (varName: ArgValue, value: ArgValue) => {
        return {
          execute(ctx: Context): void {
            // Evaluate the arguments to handle nested commands
            const evaluatedVarName = evaluateArgValue(ctx, varName);
            const evaluatedValue = evaluateArgValue(ctx, value);
            if (evaluatedVarName.type !== ArgumentType.String || evaluatedValue.type !== ArgumentType.Number) {
              throw new Error('MAKE command requires a string and a number');
            }
            const name = (evaluatedVarName as StringValue).value;
            ctx.setVariable(name, evaluatedValue);
            ctx.output(`Set variable ${name} to ${evaluatedValue.toString()}`);
          },
          toString(): string {
            return `MAKE "${varName.toString()} ${value.toString()}`;
          }
        };
      },
      category: CommandCategory.Variables
    },
    {
      name: 'FILL',
      aliases: ['FLOODFILL'],
      description: 'Fill area with current pen color',
      example: 'FILL',
      argumentTypes: [],
      createCommand: () => {
        return {
          execute(ctx: Context): void {
            ctx.turtle.fill?.();
          },
          toString(): string {
            return "FILL";
          }
        };
      },
      category: CommandCategory.TurtleGraphics
    },
  ];

export const commandList = LOGO_COMMANDS;

/**
 * A list of all available Logo commands
 */
export const commandDefinitions: CommandSpec[] = LOGO_COMMANDS;

/**
 * Create a map of commands for faster lookup
 */
const makeMap = (commands: CommandSpec[]) => {
  const map = new Map<string, CommandSpec>();
  for (const cmd of commands) {
    map.set(cmd.name.toLowerCase(), cmd);
    for (const alias of cmd.aliases) {
      map.set(alias.toLowerCase(), cmd);
    }
  }
  return map;
};

export const commandMap = makeMap(LOGO_COMMANDS);

/**
 * Evaluates an ArgValue to handle runtime values, such as executing commands inside expressions
 */
export function evaluateArgValue(ctx: Context, value: ArgValue): ArgValue {
  if (value instanceof CommandValue) {
    // If it's a wrapped command, execute it and return its result
    const result = value.command.execute(ctx);
    if (result === undefined) {
      throw new Error(`Command ${value.command.toString()} did not return a value when expected to`);
    }
    return result;
  } else if (value instanceof OperationValue) {
    // Evaluate both sides of the operation
    const leftValue = evaluateArgValue(ctx, value.left);
    const rightValue = evaluateArgValue(ctx, value.right);
    
    // Ensure both values are numbers
    if (leftValue.type !== ArgumentType.Number || rightValue.type !== ArgumentType.Number) {
      throw new Error(`Operator ${value.operator} requires number operands, got ${ArgumentType[leftValue.type]} and ${ArgumentType[rightValue.type]}`);
    }
    
    const leftNum = (leftValue as NumberValue).value;
    const rightNum = (rightValue as NumberValue).value;
    let result: number;
    
    // Perform the operation
    switch (value.operator) {
      case '+':
        result = leftNum + rightNum;
        break;
      case '-':
        result = leftNum - rightNum;
        break;
      case '*':
        result = leftNum * rightNum;
        break;
      case '/':
        if (rightNum === 0) {
          throw new Error(`Division by zero`);
        }
        result = leftNum / rightNum;
        break;
      case '<':
        result = leftNum < rightNum ? 1 : 0;
        break;
      case '>':
        result = leftNum > rightNum ? 1 : 0;
        break;
      case '<=':
        result = leftNum <= rightNum ? 1 : 0;
        break;
      case '>=':
        result = leftNum >= rightNum ? 1 : 0;
        break;
      case '==':
        result = leftNum === rightNum ? 1 : 0;
        break;
      case '!=':
        result = leftNum !== rightNum ? 1 : 0;
        break;
      default:
        throw new Error(`Unknown operator: ${value.operator}`);
    }
    
    return new NumberValue(result);
  } else if (value instanceof VariableValue) {
    // Look up variable in the context
    const varValue = ctx.getVariable(value.name);
    if (varValue === undefined) {
      throw new Error(`Undefined variable: ${value.name}`);
    }
    return varValue;
  }
  return value;
}