package parser

import (
	"fmt"
	"strconv"

	"github.com/honeylogo/logo/ast"
	"github.com/rs/zerolog/log"
)

// CommandDefinition describes how to parse and create a command
type CommandDefinition struct {
	Aliases       []string
	RequiresValue bool
	CreateCommand func(float64) ast.Command
}

// Command definitions mapping
var commandDefinitions = map[string]CommandDefinition{
	"forward": {
		Aliases:       []string{"fd"},
		RequiresValue: true,
		CreateCommand: func(val float64) ast.Command { return ast.NewForwardCommand(val) },
	},
	"backward": {
		Aliases:       []string{"bk"},
		RequiresValue: true,
		CreateCommand: func(val float64) ast.Command { return ast.NewBackwardCommand(val) },
	},
	"left": {
		Aliases:       []string{"lt"},
		RequiresValue: true,
		CreateCommand: func(val float64) ast.Command { return ast.NewLeftCommand(val) },
	},
	"right": {
		Aliases:       []string{"rt"},
		RequiresValue: true,
		CreateCommand: func(val float64) ast.Command { return ast.NewRightCommand(val) },
	},
	"setx": {
		RequiresValue: true,
		CreateCommand: func(val float64) ast.Command { return ast.NewSetXCommand(val) },
	},
	"sety": {
		RequiresValue: true,
		CreateCommand: func(val float64) ast.Command { return ast.NewSetYCommand(val) },
	},
	"setheading": {
		Aliases:       []string{"seth"},
		RequiresValue: true,
		CreateCommand: func(val float64) ast.Command { return ast.NewSetHeadingCommand(val) },
	},
	"setpensize": {
		Aliases:       []string{"setps"},
		RequiresValue: true,
		CreateCommand: func(val float64) ast.Command { return ast.NewSetPenSizeCommand(val) },
	},
	"penup": {
		Aliases:       []string{"pu"},
		CreateCommand: func(_ float64) ast.Command { return ast.NewPenUpCommand() },
	},
	"pendown": {
		Aliases:       []string{"pd"},
		CreateCommand: func(_ float64) ast.Command { return ast.NewPenDownCommand() },
	},
	"home": {
		CreateCommand: func(_ float64) ast.Command { return ast.NewHomeCommand() },
	},
}

// findCommandDefinition finds a command definition by its name or alias
func findCommandDefinition(name string) (CommandDefinition, bool) {
	// Check direct match
	if def, exists := commandDefinitions[name]; exists {
		return def, true
	}

	// Check aliases
	for _, def := range commandDefinitions {
		for _, alias := range def.Aliases {
			if name == alias {
				return def, true
			}
		}
	}

	return CommandDefinition{}, false
}

// ParseProgram converts a string of Logo commands into an AST
func ParseProgram(input string) (*ast.Program, error) {
	// Tokenize the input
	lexer := NewLexer(input)
	if err := lexer.Tokenize(); err != nil {
		return nil, err
	}
	tokens := lexer.GetTokens()

	// Convert tokens to AST
	return buildProgram(tokens)
}

// buildProgram builds the entire program's AST
func buildProgram(tokens []Token) (*ast.Program, error) {
	program := &ast.Program{
		Commands: []ast.Command{},
	}

	for i := 0; i < len(tokens); i++ {
		cmd, consumed, err := parseCommand(tokens, i)
		if err != nil {
			log.Debug().Msgf("phase=parse parsing error: %v", err)
			return nil, err
		}
		if cmd != nil {
			program.Commands = append(program.Commands, cmd)
		}
		// Skip consumed tokens
		i += consumed
	}

	log.Debug().Msgf("phase=parse parsed %d commands", len(program.Commands))

	// Log each parsed command
	for _, cmd := range program.Commands {
		log.Debug().Msgf("phase=parse command: %s", cmd.String())
	}

	return program, nil
}

// parseCommand converts a token (or sequence of tokens) into a Command
func parseCommand(tokens []Token, start int) (ast.Command, int, error) {
	if start >= len(tokens) {
		return nil, 0, nil
	}

	switch tokens[start].Type {
	case CommandToken:
		// Find the command definition
		def, exists := findCommandDefinition(tokens[start].Value)
		if !exists {
			return nil, 0, fmt.Errorf("unknown command: %s", tokens[start].Value)
		}

		// Handle commands that require a value
		if def.RequiresValue {
			if start+1 >= len(tokens) || tokens[start+1].Type != NumberToken {
				return nil, 0, fmt.Errorf("%s command requires a number argument", tokens[start].Value)
			}
			value, _ := strconv.ParseFloat(tokens[start+1].Value, 64)
			return def.CreateCommand(value), 1, nil
		}

		// Handle commands without a value
		return def.CreateCommand(0), 0, nil

	case RepeatToken:
		// Expect a number argument and a block
		if start+1 >= len(tokens) || tokens[start+1].Type != NumberToken {
			return nil, 0, fmt.Errorf("repeat command requires a number argument")
		}
		times, err := strconv.Atoi(tokens[start+1].Value)
		if err != nil {
			// If Atoi fails, try ParseFloat and convert
			timesFloat, err := strconv.ParseFloat(tokens[start+1].Value, 64)
			if err != nil {
				return nil, 0, fmt.Errorf("invalid repeat count: %s", tokens[start+1].Value)
			}
			times = int(timesFloat)
		}
		log.Debug().Msgf("phase=parse repeat times: %s (parsed as %d)", tokens[start+1].Value, times)

		// Find the block
		if start+2 >= len(tokens) || tokens[start+2].Type != OpenBracket {
			return nil, 0, fmt.Errorf("repeat command requires a block")
		}

		// Parse the block
		blockCommands := []ast.Command{}
		i := start + 3
		for i < len(tokens) && tokens[i].Type != CloseBracket {
			cmd, consumed, err := parseCommand(tokens, i)
			if err != nil {
				return nil, 0, err
			}
			if cmd != nil {
				blockCommands = append(blockCommands, cmd)
			}
			i += consumed + 1
		}

		if i >= len(tokens) || tokens[i].Type != CloseBracket {
			return nil, 0, fmt.Errorf("repeat block not closed")
		}

		return ast.NewRepeatCommand(times, blockCommands), i - start, nil
	}

	return nil, 0, fmt.Errorf("unknown token type: %v", tokens[start].Type)
}
