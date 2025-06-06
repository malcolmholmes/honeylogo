import { ArgValue } from "./parser/types";

/**
 * Base error class for custom errors in the application
 */
export class LogoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when BYE command is encountered
 * This should cause the program to terminate
 */
export class ByeError extends LogoError {
  constructor() {
    super('Program terminated by BYE command');
  }
}

/**
 * Error thrown when STOP command is encountered
 * This should exit the current procedure or terminate the program if not in a procedure
 */
export class StopError extends LogoError {
  constructor() {
    super('STOP command encountered');
  }
}

export class OutputError extends LogoError {
  value: ArgValue;
  constructor(value: ArgValue) {
    super(`OUTPUT command encountered: ${value.toString()}`);
    this.value = value;
  }
}

/**
 * Error thrown when a procedure is called in an expression context but doesn't output a value
 */
export class NoProcedureOutputError extends LogoError {
  constructor(procedureName: string) {
    super(`Procedure '${procedureName}' does not output a value`);
  }
}