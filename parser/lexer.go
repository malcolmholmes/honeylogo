package parser

import (
	"fmt"
	"strconv"
	"strings"

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
	// Use a more flexible tokenization method
	input := l.input
	input = strings.ReplaceAll(input, "[", " [ ")
	input = strings.ReplaceAll(input, "]", " ] ")
	words := strings.Fields(input)

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
	for _, token := range tokens {
		log.Debug().Msgf("phase=lex token: %s:%s", token.Type, token.Value)
	}

	return nil
}

// GetTokens returns the parsed tokens
func (l *Lexer) GetTokens() []Token {
	return l.tokens
}
