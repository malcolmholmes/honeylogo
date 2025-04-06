/**
 * Logo language parser types
 */
import { Command } from '../ast/ast';

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
