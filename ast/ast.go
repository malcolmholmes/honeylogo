package ast

import (
	"fmt"
	"image/color"
	"strings"

	"github.com/honeylogo/logo/drawing"
	"github.com/honeylogo/logo/turtle"
	"github.com/rs/zerolog/log"
)

// Context represents the execution environment
type Context struct {
	Turtle  *turtle.Turtle
	Drawing *drawing.Drawing
}

// NewContext creates a new execution context
func NewContext() *Context {
	t := turtle.New()
	return &Context{
		Turtle:  t,
		Drawing: drawing.NewDrawing(),
	}
}

// Command is the interface for all Logo commands
type Command interface {
	Execute(ctx *Context) error
	String() string
}

// ForwardCommand moves the turtle forward
type ForwardCommand struct {
	Distance float64
}

// NewForwardCommand creates a new ForwardCommand
func NewForwardCommand(distance float64) *ForwardCommand {
	return &ForwardCommand{Distance: distance}
}

// Execute moves the turtle forward and updates the drawing
func (fc *ForwardCommand) Execute(ctx *Context) error {
	ctx.Turtle.Forward(fc.Distance)
	currentX, currentY := ctx.Turtle.GetPosition()
	ctx.Drawing.Add(currentX, currentY)
	return nil
}

func (fc *ForwardCommand) String() string {
	return fmt.Sprintf("FORWARD %.2f", fc.Distance)
}

// BackwardCommand moves the turtle backward
type BackwardCommand struct {
	Distance float64
}

// NewBackwardCommand creates a new BackwardCommand
func NewBackwardCommand(distance float64) *BackwardCommand {
	return &BackwardCommand{Distance: distance}
}

// Execute moves the turtle backward and updates the drawing
func (bc *BackwardCommand) Execute(ctx *Context) error {
	ctx.Turtle.Backward(bc.Distance)
	currentX, currentY := ctx.Turtle.GetPosition()
	ctx.Drawing.Add(currentX, currentY)
	return nil
}

func (bc *BackwardCommand) String() string {
	return fmt.Sprintf("BACKWARD %.2f", bc.Distance)
}

// LeftCommand turns the turtle left
type LeftCommand struct {
	Angle float64
}

// NewLeftCommand creates a new LeftCommand
func NewLeftCommand(angle float64) *LeftCommand {
	return &LeftCommand{Angle: angle}
}

// Execute turns the turtle left and updates the drawing
func (lc *LeftCommand) Execute(ctx *Context) error {
	ctx.Turtle.Left(lc.Angle)
	ctx.Drawing.SetAngle(ctx.Turtle.GetAngle())
	return nil
}

func (lc *LeftCommand) String() string {
	return fmt.Sprintf("LEFT %.2f", lc.Angle)
}

// RightCommand turns the turtle right
type RightCommand struct {
	Angle float64
}

// NewRightCommand creates a new RightCommand
func NewRightCommand(angle float64) *RightCommand {
	return &RightCommand{Angle: angle}
}

// Execute turns the turtle right and updates the drawing
func (rc *RightCommand) Execute(ctx *Context) error {
	ctx.Turtle.Right(rc.Angle)
	ctx.Drawing.SetAngle(ctx.Turtle.GetAngle())
	return nil
}

func (rc *RightCommand) String() string {
	return fmt.Sprintf("RIGHT %.2f", rc.Angle)
}

// PenUpCommand lifts the pen
type PenUpCommand struct{}

// NewPenUpCommand creates a new PenUpCommand
func NewPenUpCommand() *PenUpCommand {
	return &PenUpCommand{}
}

// Execute lifts the pen and updates the drawing
func (puc *PenUpCommand) Execute(ctx *Context) error {
	ctx.Turtle.PenUp()
	ctx.Drawing.SetPenState(false)
	return nil
}

func (puc *PenUpCommand) String() string {
	return "PEN UP"
}

// PenDownCommand lowers the pen
type PenDownCommand struct{}

// NewPenDownCommand creates a new PenDownCommand
func NewPenDownCommand() *PenDownCommand {
	return &PenDownCommand{}
}

// Execute lowers the pen and updates the drawing
func (pdc *PenDownCommand) Execute(ctx *Context) error {
	ctx.Turtle.PenDown()
	ctx.Drawing.SetPenState(true)
	return nil
}

func (pdc *PenDownCommand) String() string {
	return "PEN DOWN"
}

// SetColorCommand sets the turtle's pen color
type SetColorCommand struct {
	R, G, B uint8
}

// NewSetColorCommand creates a new SetColorCommand
func NewSetColorCommand(r, g, b uint8) *SetColorCommand {
	return &SetColorCommand{R: r, G: g, B: b}
}

// Execute sets the turtle's pen color and updates the drawing
func (scc *SetColorCommand) Execute(ctx *Context) error {
	penColor := color.RGBA{R: scc.R, G: scc.G, B: scc.B, A: 255}
	ctx.Turtle.SetColor(penColor)
	ctx.Drawing.SetPenColor(penColor)
	return nil
}

func (scc *SetColorCommand) String() string {
	return fmt.Sprintf("SETCOLOR (R:%d, G:%d, B:%d)", scc.R, scc.G, scc.B)
}

// SetPenSizeCommand sets the turtle's pen size
type SetPenSizeCommand struct {
	Size float64
}

// NewSetPenSizeCommand creates a new SetPenSizeCommand
func NewSetPenSizeCommand(size float64) *SetPenSizeCommand {
	return &SetPenSizeCommand{Size: size}
}

// Execute sets the turtle's pen size
func (spsc *SetPenSizeCommand) Execute(ctx *Context) error {
	ctx.Turtle.SetPenSize(spsc.Size)
	ctx.Drawing.SetPenSize(spsc.Size)
	return nil
}

func (spsc *SetPenSizeCommand) String() string {
	return fmt.Sprintf("SETPENSIZE %.2f", spsc.Size)
}

// SetXCommand sets the x-coordinate of the turtle
type SetXCommand struct {
	X float64
}

// NewSetXCommand creates a new SetXCommand
func NewSetXCommand(x float64) *SetXCommand {
	return &SetXCommand{X: x}
}

// Execute sets the x-coordinate and updates the drawing
func (sxc *SetXCommand) Execute(ctx *Context) error {
	_, currentY := ctx.Turtle.GetPosition()
	ctx.Turtle.SetPosition(sxc.X, currentY)
	ctx.Drawing.Add(sxc.X, currentY)
	return nil
}

func (sxc *SetXCommand) String() string {
	return fmt.Sprintf("SETX %.2f", sxc.X)
}

// SetYCommand sets the y-coordinate of the turtle
type SetYCommand struct {
	Y float64
}

// NewSetYCommand creates a new SetYCommand
func NewSetYCommand(y float64) *SetYCommand {
	return &SetYCommand{Y: y}
}

// Execute sets the y-coordinate and updates the drawing
func (syc *SetYCommand) Execute(ctx *Context) error {
	currentX, _ := ctx.Turtle.GetPosition()
	ctx.Turtle.SetPosition(currentX, syc.Y)
	ctx.Drawing.Add(currentX, syc.Y)
	return nil
}

func (syc *SetYCommand) String() string {
	return fmt.Sprintf("SETY %.2f", syc.Y)
}

// SetPositionCommand moves the turtle to a specific position
type SetPositionCommand struct {
	X, Y float64
}

// NewSetPositionCommand creates a new SetPositionCommand
func NewSetPositionCommand(x, y float64) *SetPositionCommand {
	return &SetPositionCommand{X: x, Y: y}
}

// Execute moves the turtle to a specific position and updates the drawing
func (spc *SetPositionCommand) Execute(ctx *Context) error {
	ctx.Turtle.SetPosition(spc.X, spc.Y)
	ctx.Drawing.Add(spc.X, spc.Y)
	return nil
}

func (spc *SetPositionCommand) String() string {
	return fmt.Sprintf("SETPOSITION (%.2f, %.2f)", spc.X, spc.Y)
}

// SetHeadingCommand sets the turtle's heading
type SetHeadingCommand struct {
	Angle float64
}

// NewSetHeadingCommand creates a new SetHeadingCommand
func NewSetHeadingCommand(angle float64) *SetHeadingCommand {
	return &SetHeadingCommand{Angle: angle}
}

// Execute sets the turtle's heading and updates the drawing
func (shc *SetHeadingCommand) Execute(ctx *Context) error {
	ctx.Turtle.SetAngle(shc.Angle)
	ctx.Drawing.SetAngle(shc.Angle)
	return nil
}

func (shc *SetHeadingCommand) String() string {
	return fmt.Sprintf("SETHEADING %.2f", shc.Angle)
}

// HomeCommand moves the turtle to the center of the canvas
type HomeCommand struct{}

// NewHomeCommand creates a new HomeCommand
func NewHomeCommand() *HomeCommand {
	return &HomeCommand{}
}

// Execute moves the turtle to the center of the canvas
func (hc *HomeCommand) Execute(ctx *Context) error {
	// Reset turtle to the origin (0, 0) and default heading
	ctx.Turtle.SetPosition(0, 0)
	ctx.Turtle.SetAngle(0)
	ctx.Drawing.Add(0, 0)
	ctx.Drawing.SetAngle(0)
	return nil
}

func (hc *HomeCommand) String() string {
	return "HOME"
}

// RepeatCommand represents a repeat block
type RepeatCommand struct {
	Times    int
	Commands []Command
}

// NewRepeatCommand creates a new RepeatCommand
func NewRepeatCommand(times int, commands []Command) *RepeatCommand {
	return &RepeatCommand{
		Times:    times,
		Commands: commands,
	}
}

// Execute runs the commands multiple times
func (rc *RepeatCommand) Execute(ctx *Context) error {
	for i := 0; i < rc.Times; i++ {
		for _, cmd := range rc.Commands {
			if err := cmd.Execute(ctx); err != nil {
				return err
			}
		}
	}
	return nil
}

func (rc *RepeatCommand) String() string {
	cmds := make([]string, len(rc.Commands))
	for i, cmd := range rc.Commands {
		cmds[i] = cmd.String()
	}
	return fmt.Sprintf("REPEAT %d {\n%s\n}", rc.Times, strings.Join(cmds, "\n"))
}

// ProcedureDefinition represents a user-defined procedure
type ProcedureDefinition struct {
	Name   string
	Params []string
	Body   []Command
}

// NewProcedureDefinition creates a new ProcedureDefinition
func NewProcedureDefinition(name string, params []string, body []Command) *ProcedureDefinition {
	return &ProcedureDefinition{
		Name:   name,
		Params: params,
		Body:   body,
	}
}

// Execute stores the procedure definition for later use
func (pd *ProcedureDefinition) Execute(ctx *Context) error {
	// This is a no-op as procedure definitions are handled separately
	return nil
}

func (pd *ProcedureDefinition) String() string {
	cmds := make([]string, len(pd.Body))
	for i, cmd := range pd.Body {
		cmds[i] = cmd.String()
	}
	return fmt.Sprintf("PROCEDURE %s (%s) {\n%s\n}",
		pd.Name, strings.Join(pd.Params, ", "), strings.Join(cmds, "\n"))
}

// Program represents a complete Logo program
type Program struct {
	Commands []Command
}

// NewProgram creates a new Program
func NewProgram(commands []Command) *Program {
	return &Program{
		Commands: commands,
	}
}

// Execute runs the entire program and returns the resulting Drawing
func (p *Program) Execute(ctx *Context) (*drawing.Drawing, error) {
	for _, cmd := range p.Commands {
		if err := cmd.Execute(ctx); err != nil {
			return nil, err
		}
	}

	// Log each point individually
	for i, point := range ctx.Drawing.Points() {
		log.Debug().Msgf("phase=execute point %d: (%.2f, %.2f) penDown=%v penColor=%v angle=%.2f penSize=%.2f",
			i, point.X, point.Y, point.PenDown, point.PenColor, point.Angle, point.PenSize)
	}

	return ctx.Drawing, nil
}

func (p *Program) String() string {
	cmds := make([]string, len(p.Commands))
	for i, cmd := range p.Commands {
		cmds[i] = cmd.String()
	}
	return strings.Join(cmds, "\n")
}
