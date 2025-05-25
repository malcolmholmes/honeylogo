/**
 * Logo language parser types
 */
/**
 * Command is the interface for all Logo commands
 */
import { Command } from '../spec';

/**
 * Defines the possible types for Logo arguments
 */
export enum ArgumentType {
  Number,
  String,
  List,
  Boolean,
  Block,
  Condition,
  Any, // Used for functions that can accept any type
}

/**
 * Base class for all argument values
 */
export abstract class ArgValue {
  abstract get type(): ArgumentType;
  abstract toString(): string;
}

/**
 * Represents a numeric value
 */
export class NumberValue extends ArgValue {
  constructor(public value: number) { 
    super(); 
  }
  
  get type() { 
    return ArgumentType.Number; 
  }
  
  toString() { 
    return this.value.toString(); 
  }
}

/**
 * Represents a string value
 */
export class StringValue extends ArgValue {
  constructor(public value: string) { 
    super(); 
  }
  
  get type() { 
    return ArgumentType.String; 
  }
  
  toString() { 
    return `"${this.value}"`; 
  }
}

/**
 * Represents a boolean value
 */
export class BooleanValue extends ArgValue {
  constructor(public value: boolean) { 
    super(); 
  }
  
  get type() { 
    return ArgumentType.Boolean; 
  }
  
  toString() { 
    return this.value ? "true" : "false"; 
  }
}

/**
 * Represents a boolean condition value
 */
export class ConditionValue extends ArgValue {
  constructor(public value: boolean) { 
    super(); 
  }
  
  get type() { 
    return ArgumentType.Condition; 
  }
  
  toString() { 
    return this.value ? "true" : "false"; 
  }
}

/**
 * Represents a list of values
 */
export class ListValue extends ArgValue {
  constructor(public items: ArgValue[]) { 
    super(); 
  }
  
  get type() { 
    return ArgumentType.List; 
  }
  
  toString() { 
    return `[${this.items.map(item => item.toString()).join(' ')}]`; 
  }
}

/**
 * Represents a block of commands
 */
export class BlockValue extends ArgValue {
  constructor(public commands: Command[]) { 
    super(); 
  }
  
  get type() { 
    return ArgumentType.Block; 
  }
  
  toString() { 
    return `[ ${this.commands.map(cmd => cmd.toString()).join(' ')} ]`; 
  }
}

/**
 * Represents a command that returns a value
 */
export class CommandValue extends ArgValue {
  constructor(public command: Command) { 
    super(); 
  }
  
  get type() { 
    // Commands in expressions are assumed to return numbers
    return ArgumentType.Number; 
  }
  
  toString() { 
    return this.command.toString(); 
  }
}

/**
 * Represents an operation between two values
 * This is used for binary expressions that need to be evaluated at runtime
 */
export class OperationValue extends ArgValue {
  constructor(
    public operator: string, 
    public left: ArgValue, 
    public right: ArgValue
  ) { 
    super(); 
  }
  
  get type() {
    // Operations are assumed to return numbers
    return ArgumentType.Number; 
  }
  
  toString() { 
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`; 
  }
}

/**
 * Represents a variable reference that will be resolved at runtime
 */
export class VariableValue extends ArgValue {
  constructor(public name: string) { 
    super(); 
  }
  
  get type() {
    // Variables can't know their type until runtime resolution
    return ArgumentType.Number; // Default assumption, will be checked at runtime
  }
  
  toString() { 
    return `:${this.name}`; 
  }
}

/**
 * Represents a user-defined procedure
 */
export class ProcedureValue extends ArgValue {
  constructor(
    public name: string,
    public paramNames: string[],
    public commands: Command[]
  ) {
    super();
  }
  
  get type() {
    return ArgumentType.Block; // Procedures are similar to blocks
  }
  
  toString() {
    const params = this.paramNames.map(param => `:${param}`).join(' ');
    return `TO ${this.name} ${params}`;
  }
}
