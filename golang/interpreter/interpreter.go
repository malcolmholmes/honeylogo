package interpreter

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/honeylogo/logo/ast"
	"github.com/honeylogo/logo/parser"
	"github.com/honeylogo/logo/turtle"
	"github.com/honeylogo/logo/drawing"
)

// Interpreter represents the Logo language interpreter
type Interpreter struct {
	turtle     *turtle.Turtle
	procedures map[string][]parser.Token
	callStack  []string
	context    *ast.Context
}

// New creates a new interpreter
func New() *Interpreter {
	t := turtle.New()
	return &Interpreter{
		turtle:     t,
		procedures: make(map[string][]parser.Token),
		context:    ast.NewContext(),
	}
}

// Execute runs a Logo command string
func (i *Interpreter) Execute(cmdStr string) (*drawing.Drawing, error) {
	// Parse the input into an AST program
	program, err := parser.ParseProgram(cmdStr)
	if err != nil {
		return nil, err
	}

	// Execute the program
	return program.Execute(i.context)
}

// parseColor parses a color string into RGB values
func parseColor(colorStr string) (uint8, uint8, uint8, error) {
	// Remove brackets and split
	colorStr = strings.Trim(colorStr, "()")
	parts := strings.Split(colorStr, ",")
	if len(parts) != 3 {
		return 0, 0, 0, fmt.Errorf("invalid color format: %s", colorStr)
	}

	// Parse each color component
	r, err := strconv.Atoi(strings.TrimSpace(parts[0]))
	if err != nil {
		return 0, 0, 0, fmt.Errorf("invalid red value: %s", parts[0])
	}
	g, err := strconv.Atoi(strings.TrimSpace(parts[1]))
	if err != nil {
		return 0, 0, 0, fmt.Errorf("invalid green value: %s", parts[1])
	}
	b, err := strconv.Atoi(strings.TrimSpace(parts[2]))
	if err != nil {
		return 0, 0, 0, fmt.Errorf("invalid blue value: %s", parts[2])
	}

	// Validate range
	if r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 {
		return 0, 0, 0, fmt.Errorf("color values must be between 0 and 255")
	}

	return uint8(r), uint8(g), uint8(b), nil
}

// ExecuteCommand runs a single command
func (i *Interpreter) ExecuteCommand(cmd ast.Command) error {
	return cmd.Execute(i.context)
}

// GetTurtle returns the interpreter's turtle
func (i *Interpreter) GetTurtle() *turtle.Turtle {
	return i.turtle
}
