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
  ProcedureValue,
  ListValue,
  BooleanValue
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
  hasOutput: boolean;

  constructor(turtle: TurtleHandle, outputCallback: (message: string) => void = () => {}) {
    this.turtle = turtle;
    this.variables = new Map<string, ArgValue>();
    this.procedures = new Map<string, ProcedureValue>();
    this.lastResult = null;
    this.hasOutput = false;
    // Wrap the output callback to track if output has been generated
    this.output = (message: string) => {
      this.hasOutput = true;
      outputCallback(message);
    };
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
  TextProcessing = 'Text Processing',
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
      example: 'SETPENCOLOR "red',
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
      example: 'SETBACKGROUND "red',
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
        // List Processing Functions
        {
          name: 'WORD',
          aliases: [],
          description: 'Joins two or more inputs (words, numbers) to create a single word',
          example: 'WORD "HELLO "WORLD',
          argumentTypes: [ArgumentType.Any, ArgumentType.Any],
          returnTypes: [ArgumentType.String],
          createCommand: (word1: ArgValue, word2: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedWord1 = evaluateArgValue(ctx, word1);
                const evaluatedWord2 = evaluateArgValue(ctx, word2);
                
                // Convert both values to strings (without quotes for string values)
                let str1 = evaluatedWord1.type === ArgumentType.String 
                  ? (evaluatedWord1 as StringValue).value 
                  : evaluatedWord1.toString();
                
                let str2 = evaluatedWord2.type === ArgumentType.String 
                  ? (evaluatedWord2 as StringValue).value 
                  : evaluatedWord2.toString();
                  
                // Remove quotes from representation in toString if present
                if (str1.startsWith('"')) str1 = str1.substring(1);
                if (str2.startsWith('"')) str2 = str2.substring(1);
                
                return new StringValue(str1 + str2);
              },
              toString(): string {
                return `WORD ${word1.toString()} ${word2.toString()}`;
              }
            };
          },
          category: CommandCategory.TextProcessing
        },
        {
          name: 'LIST',
          aliases: [],
          description: 'Creates a list containing the given items',
          example: 'LIST "apple "orange',
          argumentTypes: [ArgumentType.Any, ArgumentType.Any],
          returnTypes: [ArgumentType.List],
          createCommand: (item1: ArgValue, item2: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedItem1 = evaluateArgValue(ctx, item1);
                const evaluatedItem2 = evaluateArgValue(ctx, item2);
                
                return new ListValue([evaluatedItem1, evaluatedItem2]);
              },
              toString(): string {
                return `LIST ${item1.toString()} ${item2.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'SENTENCE',
          aliases: ['SE'],
          description: 'Creates a list by combining items. If an input is a list, its items are used rather than the list itself',
          example: 'SENTENCE "apple [orange banana]',
          argumentTypes: [ArgumentType.Any, ArgumentType.Any],
          returnTypes: [ArgumentType.List],
          createCommand: (thing1: ArgValue, thing2: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing1 = evaluateArgValue(ctx, thing1);
                const evaluatedThing2 = evaluateArgValue(ctx, thing2);
                
                const result: ArgValue[] = [];
                
                // Handle thing1
                if (evaluatedThing1.type === ArgumentType.List) {
                  result.push(...(evaluatedThing1 as ListValue).items);
                } else {
                  result.push(evaluatedThing1);
                }
                
                // Handle thing2
                if (evaluatedThing2.type === ArgumentType.List) {
                  result.push(...(evaluatedThing2 as ListValue).items);
                } else {
                  result.push(evaluatedThing2);
                }
                
                return new ListValue(result);
              },
              toString(): string {
                return `SENTENCE ${thing1.toString()} ${thing2.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'FIRST',
          aliases: [],
          description: 'Returns the first item of a list or the first character of a word',
          example: 'FIRST [a b c]',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [ArgumentType.Any],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                
                if (evaluatedThing.type === ArgumentType.List) {
                  const list = evaluatedThing as ListValue;
                  if (list.items.length === 0) {
                    throw new Error('Cannot take FIRST of an empty list');
                  }
                  return list.items[0];
                } else if (evaluatedThing.type === ArgumentType.String) {
                  const str = (evaluatedThing as StringValue).value;
                  if (str.length === 0) {
                    throw new Error('Cannot take FIRST of an empty word');
                  }
                  return new StringValue(str.charAt(0));
                }
                
                throw new Error('FIRST requires a list or word');
              },
              toString(): string {
                return `FIRST ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'LAST',
          aliases: [],
          description: 'Returns the last item of a list or the last character of a word',
          example: 'LAST [a b c]',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [ArgumentType.Any],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                
                if (evaluatedThing.type === ArgumentType.List) {
                  const list = evaluatedThing as ListValue;
                  if (list.items.length === 0) {
                    throw new Error('Cannot take LAST of an empty list');
                  }
                  return list.items[list.items.length - 1];
                } else if (evaluatedThing.type === ArgumentType.String) {
                  const str = (evaluatedThing as StringValue).value;
                  if (str.length === 0) {
                    throw new Error('Cannot take LAST of an empty word');
                  }
                  return new StringValue(str.charAt(str.length - 1));
                }
                
                throw new Error('LAST requires a list or word');
              },
              toString(): string {
                return `LAST ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'BUTFIRST',
          aliases: ['BF'],
          description: 'Returns a list containing all but the first item of the input list, or a word containing all but the first character',
          example: 'BUTFIRST [a b c]',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [ArgumentType.Any],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                
                if (evaluatedThing.type === ArgumentType.List) {
                  const list = evaluatedThing as ListValue;
                  if (list.items.length === 0) {
                    throw new Error('Cannot take BUTFIRST of an empty list');
                  }
                  return new ListValue(list.items.slice(1));
                } else if (evaluatedThing.type === ArgumentType.String) {
                  const str = (evaluatedThing as StringValue).value;
                  if (str.length === 0) {
                    throw new Error('Cannot take BUTFIRST of an empty word');
                  }
                  return new StringValue(str.substring(1));
                }
                
                throw new Error('BUTFIRST requires a list or word');
              },
              toString(): string {
                return `BUTFIRST ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'BUTLAST',
          aliases: ['BL'],
          description: 'Returns a list containing all but the last item of the input list, or a word containing all but the last character',
          example: 'BUTLAST [a b c]',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [ArgumentType.Any],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                
                if (evaluatedThing.type === ArgumentType.List) {
                  const list = evaluatedThing as ListValue;
                  if (list.items.length === 0) {
                    throw new Error('Cannot take BUTLAST of an empty list');
                  }
                  return new ListValue(list.items.slice(0, -1));
                } else if (evaluatedThing.type === ArgumentType.String) {
                  const str = (evaluatedThing as StringValue).value;
                  if (str.length === 0) {
                    throw new Error('Cannot take BUTLAST of an empty word');
                  }
                  return new StringValue(str.substring(0, str.length - 1));
                }
                
                throw new Error('BUTLAST requires a list or word');
              },
              toString(): string {
                return `BUTLAST ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'ITEM',
          aliases: [],
          description: 'Returns the item at the specified index (1-based) in a list or word',
          example: 'ITEM 2 [a b c]',
          argumentTypes: [ArgumentType.Number, ArgumentType.Any],
          returnTypes: [ArgumentType.Any],
          createCommand: (index: ArgValue, thing: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedIndex = evaluateArgValue(ctx, index);
                const evaluatedThing = evaluateArgValue(ctx, thing);
                
                if (evaluatedIndex.type !== ArgumentType.Number) {
                  throw new Error('ITEM requires a number as the first argument');
                }
                
                const idx = Math.floor((evaluatedIndex as NumberValue).value);
                
                // Logo uses 1-based indexing
                if (idx < 1) {
                  throw new Error('ITEM index must be greater than or equal to 1');
                }
                
                if (evaluatedThing.type === ArgumentType.List) {
                  const list = evaluatedThing as ListValue;
                  if (idx > list.items.length) {
                    throw new Error(`ITEM index ${idx} out of bounds for list of length ${list.items.length}`);
                  }
                  return list.items[idx - 1];
                } else if (evaluatedThing.type === ArgumentType.String) {
                  const str = (evaluatedThing as StringValue).value;
                  if (idx > str.length) {
                    throw new Error(`ITEM index ${idx} out of bounds for word of length ${str.length}`);
                  }
                  return new StringValue(str.charAt(idx - 1));
                }
                
                throw new Error('ITEM requires a list or word as the second argument');
              },
              toString(): string {
                return `ITEM ${index.toString()} ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'COUNT',
          aliases: [],
          description: 'Returns the number of items in a list or the number of characters in a word',
          example: 'COUNT [a b c]',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [ArgumentType.Number],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                
                if (evaluatedThing.type === ArgumentType.List) {
                  return new NumberValue((evaluatedThing as ListValue).items.length);
                } else if (evaluatedThing.type === ArgumentType.String) {
                  return new NumberValue((evaluatedThing as StringValue).value.length);
                }
                
                throw new Error('COUNT requires a list or word');
              },
              toString(): string {
                return `COUNT ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'FPUT',
          aliases: [],
          description: 'Adds an item to the front of a list and returns the new list',
          example: 'FPUT "apple [orange banana]',
          argumentTypes: [ArgumentType.Any, ArgumentType.List],
          returnTypes: [ArgumentType.List],
          createCommand: (thing: ArgValue, list: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                const evaluatedList = evaluateArgValue(ctx, list);
                
                if (evaluatedList.type !== ArgumentType.List) {
                  throw new Error('FPUT requires a list as the second argument');
                }
                
                const listItems = [...(evaluatedList as ListValue).items];
                listItems.unshift(evaluatedThing);
                
                return new ListValue(listItems);
              },
              toString(): string {
                return `FPUT ${thing.toString()} ${list.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'LPUT',
          aliases: [],
          description: 'Adds an item to the end of a list and returns the new list',
          example: 'LPUT "banana [apple orange]',
          argumentTypes: [ArgumentType.Any, ArgumentType.List],
          returnTypes: [ArgumentType.List],
          createCommand: (thing: ArgValue, list: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                const evaluatedList = evaluateArgValue(ctx, list);
                
                if (evaluatedList.type !== ArgumentType.List) {
                  throw new Error('LPUT requires a list as the second argument');
                }
                
                const listItems = [...(evaluatedList as ListValue).items];
                listItems.push(evaluatedThing);
                
                return new ListValue(listItems);
              },
              toString(): string {
                return `LPUT ${thing.toString()} ${list.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'PRINT',
          aliases: ['PR'],
          description: 'Outputs the given value to the console, followed by a newline',
          example: 'PRINT "hello',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): void {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                let output = '';
                
                // Format the output differently based on the type
                if (evaluatedThing.type === ArgumentType.String) {
                  output = (evaluatedThing as StringValue).value;
                } else if (evaluatedThing.type === ArgumentType.List) {
                  // Format lists without the brackets for output
                  output = (evaluatedThing as ListValue).items
                    .map((item: ArgValue) => item.toString())
                    .join(' ');
                } else {
                  output = evaluatedThing.toString();
                }
                
                // Send to the output callback
                ctx.output(output);
              },
              toString(): string {
                return `PRINT ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.IOOperations
        },
        {
          name: 'SHOW',
          aliases: [],
          description: 'Outputs the given value to the console, including data type information',
          example: 'SHOW [a b c]',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): void {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                
                // For SHOW, we include the original representation with quotes, brackets, etc.
                ctx.output(evaluatedThing.toString());
              },
              toString(): string {
                return `SHOW ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.IOOperations
        },
        {
          name: 'UPPERCASE',
          aliases: [],
          description: 'Converts a word to uppercase',
          example: 'UPPERCASE "hello',
          argumentTypes: [ArgumentType.String],
          returnTypes: [ArgumentType.String],
          createCommand: (word: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedWord = evaluateArgValue(ctx, word);
                
                if (evaluatedWord.type !== ArgumentType.String) {
                  throw new Error('UPPERCASE requires a word');
                }
                
                return new StringValue((evaluatedWord as StringValue).value.toUpperCase());
              },
              toString(): string {
                return `UPPERCASE ${word.toString()}`;
              }
            };
          },
          category: CommandCategory.TextProcessing
        },
        {
          name: 'LOWERCASE',
          aliases: [],
          description: 'Converts a word to lowercase',
          example: 'LOWERCASE "HELLO',
          argumentTypes: [ArgumentType.String],
          returnTypes: [ArgumentType.String],
          createCommand: (word: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedWord = evaluateArgValue(ctx, word);
                
                if (evaluatedWord.type !== ArgumentType.String) {
                  throw new Error('LOWERCASE requires a word');
                }
                
                return new StringValue((evaluatedWord as StringValue).value.toLowerCase());
              },
              toString(): string {
                return `LOWERCASE ${word.toString()}`;
              }
            };
          },
          category: CommandCategory.TextProcessing
        },
        {
          name: 'WORDP',
          aliases: ['WORD?'],
          description: 'Returns true if the input is a word, false otherwise',
          example: 'WORDP "hello',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [ArgumentType.Boolean],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                return new BooleanValue(evaluatedThing.type === ArgumentType.String);
              },
              toString(): string {
                return `WORDP ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.TextProcessing
        },
        {
          name: 'LISTP',
          aliases: ['LIST?'],
          description: 'Returns true if the input is a list, false otherwise',
          example: 'LISTP [a b c]',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [ArgumentType.Boolean],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                return new BooleanValue(evaluatedThing.type === ArgumentType.List);
              },
              toString(): string {
                return `LISTP ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'EMPTYP',
          aliases: ['EMPTY?'],
          description: 'Returns true if the input is an empty word or list, false otherwise',
          example: 'EMPTYP []',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [ArgumentType.Boolean],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                
                if (evaluatedThing.type === ArgumentType.String) {
                  return new BooleanValue((evaluatedThing as StringValue).value.length === 0);
                } else if (evaluatedThing.type === ArgumentType.List) {
                  return new BooleanValue((evaluatedThing as ListValue).items.length === 0);
                }
                
                return new BooleanValue(false); // Non-words and non-lists are never empty
              },
              toString(): string {
                return `EMPTYP ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'MEMBERP',
          aliases: ['MEMBER?'],
          description: 'Returns true if the first input is a member of the second input (list)',
          example: 'MEMBERP "apple [banana apple orange]',
          argumentTypes: [ArgumentType.Any, ArgumentType.List],
          returnTypes: [ArgumentType.Boolean],
          createCommand: (thing: ArgValue, list: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                const evaluatedList = evaluateArgValue(ctx, list);
                
                if (evaluatedList.type !== ArgumentType.List) {
                  throw new Error('MEMBERP requires a list as the second argument');
                }
                
                const items = (evaluatedList as ListValue).items;
                
                // Check if the thing is in the list
                for (const item of items) {
                  if (item.type === evaluatedThing.type) {
                    if (item.type === ArgumentType.String && evaluatedThing.type === ArgumentType.String) {
                      if ((item as StringValue).value === (evaluatedThing as StringValue).value) {
                        return new BooleanValue(true);
                      }
                    } else if (item.type === ArgumentType.Number && evaluatedThing.type === ArgumentType.Number) {
                      if ((item as NumberValue).value === (evaluatedThing as NumberValue).value) {
                        return new BooleanValue(true);
                      }
                    }
                  }
                }
                
                return new BooleanValue(false);
              },
              toString(): string {
                return `MEMBERP ${thing.toString()} ${list.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'REVERSE',
          aliases: [],
          description: 'Reverses the items in a list or the characters in a word',
          example: 'REVERSE [a b c]',
          argumentTypes: [ArgumentType.Any],
          returnTypes: [ArgumentType.Any],
          createCommand: (thing: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                
                if (evaluatedThing.type === ArgumentType.List) {
                  const list = evaluatedThing as ListValue;
                  // Create a new array with the items in reverse order
                  const reversedItems = [...list.items].reverse();
                  return new ListValue(reversedItems);
                } else if (evaluatedThing.type === ArgumentType.String) {
                  const str = (evaluatedThing as StringValue).value;
                  // Reverse the string
                  const reversedStr = str.split('').reverse().join('');
                  return new StringValue(reversedStr);
                }
                
                throw new Error('REVERSE requires a list or word');
              },
              toString(): string {
                return `REVERSE ${thing.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'MEMBER',
          aliases: [],
          description: 'Finds the first occurrence of the item in the list and returns the list starting from that point',
          example: 'MEMBER "b [a b c d]',
          argumentTypes: [ArgumentType.Any, ArgumentType.List],
          returnTypes: [ArgumentType.List],
          createCommand: (thing: ArgValue, list: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                const evaluatedList = evaluateArgValue(ctx, list);
                
                if (evaluatedList.type !== ArgumentType.List) {
                  throw new Error('MEMBER requires a list as the second argument');
                }
                
                const items = (evaluatedList as ListValue).items;
                
                // Find the first occurrence and return the sublist
                for (let i = 0; i < items.length; i++) {
                  const item = items[i];
                  if (item.type === evaluatedThing.type) {
                    if (item.type === ArgumentType.String && evaluatedThing.type === ArgumentType.String) {
                      if ((item as StringValue).value === (evaluatedThing as StringValue).value) {
                        return new ListValue(items.slice(i));
                      }
                    } else if (item.type === ArgumentType.Number && evaluatedThing.type === ArgumentType.Number) {
                      if ((item as NumberValue).value === (evaluatedThing as NumberValue).value) {
                        return new ListValue(items.slice(i));
                      }
                    }
                  }
                }
                
                // If not found, return an empty list
                return new ListValue([]);
              },
              toString(): string {
                return `MEMBER ${thing.toString()} ${list.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'REMOVE',
          aliases: [],
          description: 'Removes all occurrences of the first input from the second input (list)',
          example: 'REMOVE "a [a b a c]',
          argumentTypes: [ArgumentType.Any, ArgumentType.List],
          returnTypes: [ArgumentType.List],
          createCommand: (thing: ArgValue, list: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedThing = evaluateArgValue(ctx, thing);
                const evaluatedList = evaluateArgValue(ctx, list);
                
                if (evaluatedList.type !== ArgumentType.List) {
                  throw new Error('REMOVE requires a list as the second argument');
                }
                
                const items = (evaluatedList as ListValue).items;
                const result: ArgValue[] = [];
                
                // Filter out the items that match the first input
                for (const item of items) {
                  let shouldKeep = true;
                  
                  if (item.type === evaluatedThing.type) {
                    if (item.type === ArgumentType.String && evaluatedThing.type === ArgumentType.String) {
                      if ((item as StringValue).value === (evaluatedThing as StringValue).value) {
                        shouldKeep = false;
                      }
                    } else if (item.type === ArgumentType.Number && evaluatedThing.type === ArgumentType.Number) {
                      if ((item as NumberValue).value === (evaluatedThing as NumberValue).value) {
                        shouldKeep = false;
                      }
                    }
                  }
                  
                  if (shouldKeep) {
                    result.push(item);
                  }
                }
                
                return new ListValue(result);
              },
              toString(): string {
                return `REMOVE ${thing.toString()} ${list.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'REMDUP',
          aliases: [],
          description: 'Removes duplicate items from a list',
          example: 'REMDUP [a b a c b]',
          argumentTypes: [ArgumentType.List],
          returnTypes: [ArgumentType.List],
          createCommand: (list: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedList = evaluateArgValue(ctx, list);
                
                if (evaluatedList.type !== ArgumentType.List) {
                  throw new Error('REMDUP requires a list');
                }
                
                const items = (evaluatedList as ListValue).items;
                const result: ArgValue[] = [];
                const seen = new Set<string>(); // Use string representations for comparison
                
                // Only add items that haven't been seen before
                for (const item of items) {
                  const itemStr = JSON.stringify({
                    type: item.type,
                    value: item.type === ArgumentType.String ? (item as StringValue).value :
                           item.type === ArgumentType.Number ? (item as NumberValue).value :
                           item.toString()
                  });
                  
                  if (!seen.has(itemStr)) {
                    seen.add(itemStr);
                    result.push(item);
                  }
                }
                
                return new ListValue(result);
              },
              toString(): string {
                return `REMDUP ${list.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'FIRSTS',
          aliases: [],
          description: 'Returns a list containing the first item of each sublist',
          example: 'FIRSTS [[a b] [c d] [e f]]',
          argumentTypes: [ArgumentType.List],
          returnTypes: [ArgumentType.List],
          createCommand: (list: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedList = evaluateArgValue(ctx, list);
                
                if (evaluatedList.type !== ArgumentType.List) {
                  throw new Error('FIRSTS requires a list of lists');
                }
                
                const items = (evaluatedList as ListValue).items;
                const result: ArgValue[] = [];
                
                for (const item of items) {
                  if (item.type !== ArgumentType.List) {
                    throw new Error('FIRSTS requires a list of lists');
                  }
                  
                  const sublist = item as ListValue;
                  if (sublist.items.length === 0) {
                    throw new Error('Cannot take FIRST of an empty list');
                  }
                  
                  result.push(sublist.items[0]);
                }
                
                return new ListValue(result);
              },
              toString(): string {
                return `FIRSTS ${list.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
        },
        {
          name: 'BUTFIRSTS',
          aliases: ['BFS'],
          description: 'Returns a list containing all but the first item of each sublist',
          example: 'BUTFIRSTS [[a b c] [d e f]]',
          argumentTypes: [ArgumentType.List],
          returnTypes: [ArgumentType.List],
          createCommand: (list: ArgValue) => {
            return {
              execute(ctx: Context): ArgValue {
                const evaluatedList = evaluateArgValue(ctx, list);
                
                if (evaluatedList.type !== ArgumentType.List) {
                  throw new Error('BUTFIRSTS requires a list of lists');
                }
                
                const items = (evaluatedList as ListValue).items;
                const result: ArgValue[] = [];
                
                for (const item of items) {
                  if (item.type !== ArgumentType.List) {
                    throw new Error('BUTFIRSTS requires a list of lists');
                  }
                  
                  const sublist = item as ListValue;
                  if (sublist.items.length === 0) {
                    throw new Error('Cannot take BUTFIRST of an empty list');
                  }
                  
                  result.push(new ListValue(sublist.items.slice(1)));
                }
                
                return new ListValue(result);
              },
              toString(): string {
                return `BUTFIRSTS ${list.toString()}`;
              }
            };
          },
          category: CommandCategory.ListProcessing
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