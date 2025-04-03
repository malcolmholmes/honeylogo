/**
 * Parser module for the Logo language
 * TypeScript equivalent of the Go implementation
 */

import { Token, TokenType, Lexer } from './lexer';
import {
  Command,
  ForwardCommand,
  BackwardCommand,
  LeftCommand,
  RightCommand,
  PenUpCommand,
  PenDownCommand,
  SetColorCommand,
  SetPenSizeCommand,
  SetPositionCommand,
  HomeCommand,
  RepeatCommand,
  Program
} from '../ast/ast';

// CommandDefinition describes how to parse and create a command
interface CommandDefinition {
  aliases: string[];
  requiresValue: boolean;
  createCommand: (val: number) => Command;
}

// Map of command definitions
const commandDefinitions: Record<string, CommandDefinition> = {
  'forward': {
    aliases: ['fd'],
    requiresValue: true,
    createCommand: (val: number) => new ForwardCommand(val)
  },
  'backward': {
    aliases: ['bk'],
    requiresValue: true,
    createCommand: (val: number) => new BackwardCommand(val)
  },
  'left': {
    aliases: ['lt'],
    requiresValue: true,
    createCommand: (val: number) => new LeftCommand(val)
  },
  'right': {
    aliases: ['rt'],
    requiresValue: true,
    createCommand: (val: number) => new RightCommand(val)
  },
  'setx': {
    aliases: [],
    requiresValue: true,
    createCommand: (val: number) => new SetPositionCommand(val, 0) // This is a placeholder 
  },
  'sety': {
    aliases: [],
    requiresValue: true,
    createCommand: (val: number) => new SetPositionCommand(0, val) // This is a placeholder
  },
  'setheading': {
    aliases: ['seth'],
    requiresValue: true,
    createCommand: (val: number) => ({ execute: () => {}, toString: () => `SETHEADING ${val}` }) // Placeholder implementation
  },
  'setpensize': {
    aliases: ['setps'],
    requiresValue: true,
    createCommand: (val: number) => new SetPenSizeCommand(val)
  },
  'penup': {
    aliases: ['pu'],
    requiresValue: false,
    createCommand: () => new PenUpCommand()
  },
  'pendown': {
    aliases: ['pd'],
    requiresValue: false,
    createCommand: () => new PenDownCommand()
  },
  'home': {
    aliases: [],
    requiresValue: false,
    createCommand: () => new HomeCommand()
  }
};

/**
 * Finds a command definition by its name or alias
 */
function findCommandDefinition(name: string): CommandDefinition | null {
  // Check direct match
  if (commandDefinitions[name]) {
    return commandDefinitions[name];
  }

  // Check aliases
  for (const [cmdName, def] of Object.entries(commandDefinitions)) {
    if (def.aliases.includes(name)) {
      return def;
    }
  }

  return null;
}

/**
 * Converts a string of Logo commands into an AST
 */
export function parseProgram(input: string): Program {
  // Tokenize the input
  const lexer = new Lexer(input);
  lexer.tokenize();
  const tokens = lexer.getTokens();

  // Convert tokens to AST
  return buildProgram(tokens);
}

/**
 * Builds the entire program's AST
 */
function buildProgram(tokens: Token[]): Program {
  const commands: Command[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const [cmd, consumed] = parseCommand(tokens, i);
    if (cmd) {
      commands.push(cmd);
    }
    
    // Skip consumed tokens
    i += consumed;
  }

  console.debug(`[Parser] parsed ${commands.length} commands`);

  // Log each parsed command
  commands.forEach(cmd => {
    console.debug(`[Parser] command: ${cmd.toString()}`);
  });

  return new Program(commands);
}

/**
 * Converts a token (or sequence of tokens) into a Command
 * Returns [command, tokensConsumed]
 */
function parseCommand(tokens: Token[], start: number): [Command | null, number] {
  if (start >= tokens.length) {
    return [null, 0];
  }

  switch (tokens[start].type) {
    case TokenType.COMMAND: {
      // Find the command definition
      const def = findCommandDefinition(tokens[start].value);
      if (!def) {
        console.error(`Unknown command: ${tokens[start].value}`);
        return [null, 0];
      }

      // Handle commands that require a value
      if (def.requiresValue) {
        if (start + 1 >= tokens.length || tokens[start + 1].type !== TokenType.NUMBER) {
          console.error(`${tokens[start].value} command requires a number argument`);
          return [null, 0];
        }
        const value = parseFloat(tokens[start + 1].value);
        return [def.createCommand(value), 1];
      }

      // Handle commands without a value
      return [def.createCommand(0), 0];
    }

    case TokenType.REPEAT: {
      // Expect a number argument and a block
      if (start + 1 >= tokens.length || tokens[start + 1].type !== TokenType.NUMBER) {
        console.error("Repeat command requires a number argument");
        return [null, 0];
      }
      
      const times = parseInt(tokens[start + 1].value);
      console.debug(`[Parser] repeat times: ${tokens[start + 1].value} (parsed as ${times})`);

      // Find the block
      if (start + 2 >= tokens.length || tokens[start + 2].type !== TokenType.OPEN_BRACKET) {
        console.error("Repeat command requires a block");
        return [null, 0];
      }

      // Parse the block
      const blockCommands: Command[] = [];
      let i = start + 3;
      while (i < tokens.length && tokens[i].type !== TokenType.CLOSE_BRACKET) {
        const [cmd, consumed] = parseCommand(tokens, i);
        if (cmd) {
          blockCommands.push(cmd);
        }
        i += consumed + 1;
      }

      if (i >= tokens.length || tokens[i].type !== TokenType.CLOSE_BRACKET) {
        console.error("Repeat block not closed");
        return [null, 0];
      }

      return [new RepeatCommand(times, blockCommands), i - start];
    }

    default:
      console.error(`Unknown token type: ${tokens[start].type}`);
      return [null, 0];
  }
}
