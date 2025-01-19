package turtle

import (
	"image/color"
	"math"

	"github.com/honeylogo/logo/drawing"
)

// Turtle represents the state and behavior of a Logo turtle
type Turtle struct {
	x        float64
	y        float64
	angle    float64
	penDown  bool
	penColor color.Color
	penSize  float64
	path     *drawing.Drawing
}

// New creates a new Turtle
func New() *Turtle {
	return &Turtle{
		x:        0, // Start at origin
		y:        0,
		angle:    0, // Start facing up
		penDown:  true,
		penColor: color.Black,
		penSize:  1.0, // Default pen size
		path:     drawing.NewDrawing(),
	}
}

// Forward moves the turtle forward in its current direction
func (t *Turtle) Forward(distance float64) {
	radians := (90 - t.angle) * math.Pi / 180
	newX := t.x + distance*math.Cos(radians)
	newY := t.y + distance*math.Sin(radians)

	if t.penDown {
		t.path.Add(newX, newY)
	}

	t.x = newX
	t.y = newY
}

// Backward moves the turtle backward in its current direction
func (t *Turtle) Backward(distance float64) {
	t.Forward(-distance)
}

// Left turns the turtle left by the given angle
func (t *Turtle) Left(angle float64) {
	t.angle = math.Mod(t.angle-angle+360, 360)
}

// Right turns the turtle right by the given angle
func (t *Turtle) Right(angle float64) {
	t.angle = math.Mod(t.angle+angle, 360)
}

// PenUp lifts the pen up
func (t *Turtle) PenUp() {
	t.penDown = false
}

// PenDown puts the pen down
func (t *Turtle) PenDown() {
	t.penDown = true
}

// SetColor sets the pen color
func (t *Turtle) SetColor(c color.Color) {
	t.penColor = c
}

// GetPosition returns the current position of the turtle
func (t *Turtle) GetPosition() (float64, float64) {
	return t.x, t.y
}

// GetAngle returns the current angle of the turtle
func (t *Turtle) GetAngle() float64 {
	return t.angle
}

// GetPath returns the path drawn by the turtle
func (t *Turtle) GetPath() *drawing.Drawing {
	return t.path
}

// SetPosition updates the turtle's position and adds to path if pen is down
func (t *Turtle) SetPosition(newX, newY float64) {
	if t.penDown {
		t.path.Add(newX, newY)
	}

	t.x = newX
	t.y = newY
}

// SetAngle allows manually setting the turtle's angle
func (t *Turtle) SetAngle(angle float64) {
	t.angle = math.Mod(angle, 360)
}

// IsPenDown returns whether the pen is down
func (t *Turtle) IsPenDown() bool {
	return t.penDown
}

// GetColor returns the current pen color
func (t *Turtle) GetColor() color.Color {
	return t.penColor
}

// GetX returns the current x-coordinate of the turtle
func (t *Turtle) GetX() float64 {
	return t.x
}

// GetY returns the current y-coordinate of the turtle
func (t *Turtle) GetY() float64 {
	return t.y
}

// SetPenSize sets the pen size
func (t *Turtle) SetPenSize(size float64) {
	t.penSize = size
}

// GetPenSize returns the current pen size
func (t *Turtle) GetPenSize() float64 {
	return t.penSize
}
