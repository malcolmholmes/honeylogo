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
  ConditionValue
} from './parser/types';

/**
 * Context represents the execution environment
 */
export class Context {
  turtle: TurtleHandle;

  constructor(turtle: TurtleHandle) {
    this.turtle = turtle;
  }
}

/**
 * Command is the interface for all Logo commands
 */
export interface Command {
  execute(ctx: Context): void;
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
      cmd.execute(ctx);
    }
  }
  
  // Execute a specific command by index
  executeCommand(ctx: Context, index: number): void {
    if (index >= 0 && index < this.commands.length) {
      this.commands[index].execute(ctx);
    }
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
  IOOperations = 'Input/Output Operations'
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
        const dist = (distance as NumberValue).value;
        return {
          execute(ctx: Context): void {
            ctx.turtle.forward(dist);
          },
          toString(): string {
            return `FORWARD ${dist}`;
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
        const dist = (distance as NumberValue).value;
        return {
          execute(ctx: Context): void {
            ctx.turtle.forward(-dist);
          },
          toString(): string {
            return `BACK ${dist}`;
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
        const ang = (angle as NumberValue).value;
        return {
          execute(ctx: Context): void {
            ctx.turtle.left(ang);
          },
          toString(): string {
            return `LEFT ${ang}`;
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
        const ang = (angle as NumberValue).value;
        return {
          execute(ctx: Context): void {
            ctx.turtle.right(ang);
          },
          toString(): string {
            return `RIGHT ${ang}`;
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
        const heading = (angle as NumberValue).value;
        return {
          execute(ctx: Context): void {
            ctx.turtle.setHeading?.(heading);
          },
          toString(): string {
            return `SETHEADING ${heading}`;
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
        const xPos = (x as NumberValue).value;
        const yPos = (y as NumberValue).value;
        return {
          execute(ctx: Context): void {
            ctx.turtle.setPosition?.(xPos, yPos);
          },
          toString(): string {
            return `SETPOSITION ${xPos} ${yPos}`;
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
        const xPos = (x as NumberValue).value;
        return {
          execute(ctx: Context): void {
            ctx.turtle.setPosition?.(xPos, null);
          },
          toString(): string {
            return `SETX ${xPos}`;
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
        const yPos = (y as NumberValue).value;
        return {
          execute(ctx: Context): void {
            ctx.turtle.setPosition?.(null, yPos);
          },
          toString(): string {
            return `SETY ${yPos}`;
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
      name: 'SETCOLOR',
      aliases: ['SC'],
      description: 'Set the pen color',
      example: 'SETCOLOR "red"',
      argumentTypes: [ArgumentType.String],
      createCommand: (colorValue: ArgValue) => {
        const color = (colorValue as StringValue).value;
        return {
          execute(ctx: Context): void {
            // Convert to CSS color format
            const cssColor = `rgb(${color}, 0, 0)`;
            ctx.turtle.setColor(cssColor);
          },
          toString(): string {
            return `SETCOLOR ${color}`;
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
        const penSize = (size as NumberValue).value;
        return {
          execute(ctx: Context): void {
            ctx.turtle.setPenSize?.(penSize);
          },
          toString(): string {
            return `SETPENSIZE ${penSize}`;
          }
        };
      },
      category: CommandCategory.Graphics
    },
    {
      name: 'REPEAT',
      aliases: [],
      description: 'Repeat a block of commands a specified number of times',
      example: 'REPEAT 4 [ FORWARD 100 RIGHT 90 ]',
      argumentTypes: [ArgumentType.Number, ArgumentType.Block],
      createCommand: (count: ArgValue, block: ArgValue) => {
        const times = (count as NumberValue).value;
        const commands = (block as BlockValue).commands;
        return {
          execute(ctx: Context): void {
            for (let i = 0; i < times; i++) {
              for (const cmd of commands) {
                cmd.execute(ctx);
              }
            }
          },
          toString(): string {
            return `REPEAT ${times} [ ${commands.map(cmd => cmd.toString()).join(' ')} ]`;
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
        const cond = (condition as NumberValue).value;
        const commands = (block as BlockValue).commands;
        return {
          execute(ctx: Context): void {
            if (cond) {
              for (const cmd of commands) {
                cmd.execute(ctx);
              }
            }
          },
          toString(): string {
            return `IF ${cond} [ ${commands.map(cmd => cmd.toString()).join(' ')} ]`;
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
        const cond = (condition as NumberValue).value;
        const commands = (block as BlockValue).commands;
        const elseCommands = (elseBlock as BlockValue).commands;
        return {
          execute(ctx: Context): void {
            if (cond) {
              for (const cmd of commands) {
                cmd.execute(ctx);
              }
            } else {
              for (const cmd of elseCommands) {
                cmd.execute(ctx);
              }
            }
          },
          toString(): string {
            return `IFELSE ${cond} [ ${commands.map(cmd => cmd.toString()).join(' ')} ] [ ${elseCommands.map(cmd => cmd.toString()).join(' ')} ]`;
          }
        };
      },
      category: CommandCategory.ControlStructures
    }
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