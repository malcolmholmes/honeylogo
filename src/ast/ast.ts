// Import the TurtleHandle interface from our Turtle component
import { TurtleHandle } from '../components/Turtle';

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
 * ForwardCommand moves the turtle forward
 */
export class ForwardCommand implements Command {
  distance: number;

  constructor(distance: number) {
    this.distance = distance;
  }

  execute(ctx: Context): void {
    ctx.turtle.forward(this.distance);
  }

  toString(): string {
    return `FORWARD ${this.distance.toFixed(2)}`;
  }
}

/**
 * BackwardCommand moves the turtle backward
 */
export class BackwardCommand implements Command {
  distance: number;

  constructor(distance: number) {
    this.distance = distance;
  }

  execute(ctx: Context): void {
    // Using forward with negative distance since our Turtle component
    // might not have a built-in backward method
    ctx.turtle.forward(-this.distance);
  }

  toString(): string {
    return `BACKWARD ${this.distance.toFixed(2)}`;
  }
}

/**
 * LeftCommand turns the turtle left
 */
export class LeftCommand implements Command {
  angle: number;

  constructor(angle: number) {
    this.angle = angle;
  }

  execute(ctx: Context): void {
    ctx.turtle.left(this.angle);
  }

  toString(): string {
    return `LEFT ${this.angle.toFixed(2)}`;
  }
}

/**
 * RightCommand turns the turtle right
 */
export class RightCommand implements Command {
  angle: number;

  constructor(angle: number) {
    this.angle = angle;
  }

  execute(ctx: Context): void {
    ctx.turtle.right(this.angle);
  }

  toString(): string {
    return `RIGHT ${this.angle.toFixed(2)}`;
  }
}

/**
 * PenUpCommand lifts the pen
 */
export class PenUpCommand implements Command {
  execute(ctx: Context): void {
    ctx.turtle.penUp();
  }

  toString(): string {
    return "PEN UP";
  }
}

/**
 * PenDownCommand lowers the pen
 */
export class PenDownCommand implements Command {
  execute(ctx: Context): void {
    ctx.turtle.penDown();
  }

  toString(): string {
    return "PEN DOWN";
  }
}

/**
 * SetColorCommand sets the turtle's pen color
 */
export class SetColorCommand implements Command {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  execute(ctx: Context): void {
    const colorHex = `#${this.r.toString(16).padStart(2, '0')}${this.g.toString(16).padStart(2, '0')}${this.b.toString(16).padStart(2, '0')}`;
    ctx.turtle.setColor(colorHex);
  }

  toString(): string {
    return `SETCOLOR (R:${this.r}, G:${this.g}, B:${this.b})`;
  }
}

/**
 * SetPenSizeCommand sets the turtle's pen size
 */
export class SetPenSizeCommand implements Command {
  size: number;

  constructor(size: number) {
    this.size = size;
  }

  execute(ctx: Context): void {
    // If your Turtle implementation has a setPenSize method
    ctx.turtle.setPenSize?.(this.size);
  }

  toString(): string {
    return `SETPENSIZE ${this.size.toFixed(2)}`;
  }
}

/**
 * SetPositionCommand moves the turtle to a specific position
 */
export class SetPositionCommand implements Command {
  x: number | null;
  y: number | null;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  execute(ctx: Context): void {
    ctx.turtle.setPosition?.(this.x ?? 0, this.y ?? 0);
  }

  toString(): string {
    return `SETPOSITION (${this.x ? this.x.toFixed(2) : "null"}, ${this.y ? this.y.toFixed(2) : "null"})`;
  }
}

/**
 * SetHeadingCommand sets the turtle's heading
 */
export class SetHeadingCommand implements Command {
  heading: number;

  constructor(heading: number) {
    this.heading = heading;
  }

  execute(ctx: Context): void {
    ctx.turtle.setHeading?.(this.heading);
  }

  toString(): string {
    return `SETHEADING ${this.heading.toFixed(2)}`;
  }
}

/**
 * HomeCommand moves the turtle to the center of the canvas
 */
export class HomeCommand implements Command {
  execute(ctx: Context): void {
    ctx.turtle.home?.();
  }

  toString(): string {
    return "HOME";
  }
}

export class ClearScreenCommand implements Command {
  execute(ctx: Context): void {
    ctx.turtle.clear();
  }

  toString(): string {
    return "CLEARSCREEN";
  }
}

/**
 * HideTurtleCommand hides the turtle during drawing
 */
export class HideTurtleCommand implements Command {
  execute(ctx: Context): void {
    ctx.turtle.hideTurtle();
  }

  toString(): string {
    return "HIDETURTLE";
  }
}

/**
 * ShowTurtleCommand shows the turtle during drawing
 */
export class ShowTurtleCommand implements Command {
  execute(ctx: Context): void {
    ctx.turtle.showTurtle();
  }

  toString(): string {
    return "SHOWTURTLE";
  }
}

/**
 * RepeatCommand represents a repeat block
 */
export class RepeatCommand implements Command {
  times: number;
  commands: Command[];

  constructor(times: number, commands: Command[]) {
    this.times = times;
    this.commands = commands;
  }

  execute(ctx: Context): void {
    for (let i = 0; i < this.times; i++) {
      for (const cmd of this.commands) {
        cmd.execute(ctx);
      }
    }
  }

  toString(): string {
    const commandsStr = this.commands
      .map(cmd => `  ${cmd.toString()}`)
      .join('\n');
    return `REPEAT ${this.times} [\n${commandsStr}\n]`;
  }
}

/**
 * ProcedureDefinition represents a user-defined procedure
 */
export class ProcedureDefinition implements Command {
  name: string;
  params: string[];
  body: Command[];

  constructor(name: string, params: string[], body: Command[]) {
    this.name = name;
    this.params = params;
    this.body = body;
  }

  execute(ctx: Context): void {
    // In a complete implementation, this would store the procedure
    // definition in a procedures map in the Context
  }

  toString(): string {
    const paramsStr = this.params.join(' ');
    const bodyStr = this.body.map(cmd => cmd.toString()).join('\n  ');
    return `TO ${this.name} ${paramsStr}\n  ${bodyStr}\nEND`;
  }
}

/**
 * Program represents a complete Logo program
 */
export class Program {
  commands: Command[];

  constructor(commands: Command[]) {
    this.commands = commands;
  }

  execute(ctx: Context): void {
    for (const cmd of this.commands) {
      cmd.execute(ctx);
    }
  }

  toString(): string {
    return this.commands.map(cmd => cmd.toString()).join('\n');
  }
}
