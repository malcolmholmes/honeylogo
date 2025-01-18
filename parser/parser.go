package parser

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/honeylogo/logo/ast"
	"github.com/rs/zerolog/log"
)

// Token represents a parsed token in Logo
type Token struct {
	Type  TokenType
	Value string
}

// TokenType defines the type of tokens
type TokenType string

const (
	CommandToken   TokenType = "COMMAND"
	NumberToken    TokenType = "NUMBER"
	RepeatToken    TokenType = "REPEAT"
	OpenBracket    TokenType = "OPEN_BRACKET"
	CloseBracket   TokenType = "CLOSE_BRACKET"
	VariableToken  TokenType = "VARIABLE"
	ProcedureToken TokenType = "PROCEDURE"
	ToToken        TokenType = "TO"
	EndToken       TokenType = "END"
	MakeToken      TokenType = "MAKE"
	IfToken        TokenType = "IF"
	StringToken    TokenType = "STRING"
	OperatorToken  TokenType = "OPERATOR"
	CommentToken   TokenType = "COMMENT"
)

// Lexer breaks input into tokens
type Lexer struct {
	input  string
	tokens []Token
}

// NewLexer creates a new lexer
func NewLexer(input string) *Lexer {
	return &Lexer{
		input: strings.TrimSpace(input),
	}
}

// Tokenize breaks the input into tokens
func (l *Lexer) Tokenize() error {
	tokens := []Token{}
	words := strings.Fields(l.input)

	for i := 0; i < len(words); i++ {
		word := strings.ToLower(words[i])

		// Handle comments
		if strings.HasPrefix(word, ";") {
			// Skip rest of line
			for i < len(words) {
				i++
			}
			continue
		}

		switch word {
		// Movement commands
		case "forward", "fd":
			tokens = append(tokens, Token{Type: CommandToken, Value: "forward"})
		case "backward", "bk":
			tokens = append(tokens, Token{Type: CommandToken, Value: "backward"})
		case "left", "lt":
			tokens = append(tokens, Token{Type: CommandToken, Value: "left"})
		case "right", "rt":
			tokens = append(tokens, Token{Type: CommandToken, Value: "right"})
		case "setx":
			tokens = append(tokens, Token{Type: CommandToken, Value: "setx"})
		case "sety":
			tokens = append(tokens, Token{Type: CommandToken, Value: "sety"})
		case "setheading", "seth":
			tokens = append(tokens, Token{Type: CommandToken, Value: "setheading"})
		case "home":
			tokens = append(tokens, Token{Type: CommandToken, Value: "home"})

		// Pen commands
		case "penup", "pu":
			tokens = append(tokens, Token{Type: CommandToken, Value: "penup"})
		case "pendown", "pd":
			tokens = append(tokens, Token{Type: CommandToken, Value: "pendown"})
		case "setpencolor", "setpc":
			tokens = append(tokens, Token{Type: CommandToken, Value: "setpencolor"})
		case "setpensize", "setps":
			tokens = append(tokens, Token{Type: CommandToken, Value: "setpensize"})

		// Control structures
		case "repeat":
			tokens = append(tokens, Token{Type: RepeatToken, Value: "repeat"})
		case "to":
			tokens = append(tokens, Token{Type: ToToken, Value: "to"})
		case "end":
			tokens = append(tokens, Token{Type: EndToken, Value: "end"})
		case "if":
			tokens = append(tokens, Token{Type: IfToken, Value: "if"})
		case "make":
			tokens = append(tokens, Token{Type: MakeToken, Value: "make"})

		// Brackets and operators
		case "[":
			tokens = append(tokens, Token{Type: OpenBracket, Value: "["})
		case "]":
			tokens = append(tokens, Token{Type: CloseBracket, Value: "]"})
		case "+", "-", "*", "/", "<", ">", "=":
			tokens = append(tokens, Token{Type: OperatorToken, Value: word})

		default:
			// Check if it's a number
			if num, err := strconv.ParseFloat(word, 64); err == nil {
				tokens = append(tokens, Token{Type: NumberToken, Value: fmt.Sprintf("%f", num)})
				continue
			}

			// Check if it's a variable (starts with ":")
			if strings.HasPrefix(word, ":") {
				tokens = append(tokens, Token{Type: VariableToken, Value: word[1:]})
				continue
			}

			// Check if it's a string (starts with ")
			if strings.HasPrefix(word, "\"") {
				tokens = append(tokens, Token{Type: StringToken, Value: word[1:]})
				continue
			}

			// Assume it's a procedure name
			tokens = append(tokens, Token{Type: ProcedureToken, Value: word})
		}
	}

	l.tokens = tokens

	// Log the parsed tokens
	var tokenStrings []string
	for _, token := range tokens {
		tokenStrings = append(tokenStrings, fmt.Sprintf("%s:%s", token.Type, token.Value))
	}
	log.Debug().Msgf("phase=lex tokens: %s", strings.Join(tokenStrings, " "))

	return nil
}

// GetTokens returns the parsed tokens
func (l *Lexer) GetTokens() []Token {
	return l.tokens
}

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
	"home": {
		RequiresValue: false,
		CreateCommand: func(_ float64) ast.Command { return ast.NewHomeCommand() },
	},
	"penup": {
		Aliases:       []string{"pu"},
		RequiresValue: false,
		CreateCommand: func(_ float64) ast.Command { return ast.NewPenUpCommand() },
	},
	"pendown": {
		Aliases:       []string{"pd"},
		RequiresValue: false,
		CreateCommand: func(_ float64) ast.Command { return ast.NewPenDownCommand() },
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

	log.Debug().Str("phase", "parse").Msg("starting program parsing")

	for i := 0; i < len(tokens); i++ {
		cmd, consumed, err := parseCommand(tokens, i)
		if err != nil {
			log.Debug().Str("phase", "parse").Err(err).Msg("parsing error")
			return nil, err
		}
		if cmd != nil {
			program.Commands = append(program.Commands, cmd)
		}
		// Skip consumed tokens
		i += consumed
	}

	log.Debug().Str("phase", "parse").Msgf("parsed %d commands", len(program.Commands))
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
		times, _ := strconv.Atoi(tokens[start+1].Value)

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
