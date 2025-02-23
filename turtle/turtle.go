// Package turtle provides a Go implementation of the Python turtle graphics library
package turtle

import (
	"image/color"
	"math"
	"sync"
	"time"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
)

// Turtle represents a turtle graphics cursor
type Turtle struct {
	pos         fyne.Position
	home        fyne.Position
	heading     float32 // Current heading in degrees
	homeHeading float32 // Heading when created
	penDown     bool    // Whether the pen is down
	penColor    color.Color
	fillColor   color.Color
	penSize     float32
	isVisible   bool
	speed       int
	drawing     *fyne.Container
	mutex       sync.Mutex
	sprite      *TurtleSprite
}

// NewTurtle creates a new turtle with default settings and a provided Fyne canvas
func NewTurtle(drawing *fyne.Container, width, height float32) *Turtle {
	home := fyne.NewPos(width/2, height/2)
	homeHeading := float32(-90)
	sprite := NewTurtleSprite()
	sprite.Move(home)
	sprite.SetAngle(homeHeading)
	drawing.Add(sprite.Image())
	return &Turtle{
		pos:         home,
		home:        home,
		heading:     homeHeading,
		homeHeading: homeHeading,
		penDown:     true,
		penColor:    color.Black,
		fillColor:   color.White,
		penSize:     1,
		isVisible:   true,
		speed:       3,
		drawing:     drawing,
		sprite:      sprite,
	}
}

// Forward moves the turtle forward by the specified distance
func (t *Turtle) Forward(distance float32) {
	t.mutex.Lock()
	defer t.mutex.Unlock()

	rad := float64(t.heading * math.Pi / 180)
	newX := t.pos.X + distance*float32(math.Cos(rad))
	newY := t.pos.Y + distance*float32(math.Sin(rad))
	newPos := fyne.NewPos(float32(newX), float32(newY))

	if t.penDown {
		t.drawLine(t.pos, newPos)
		t.pos = fyne.NewPos(float32(newX), float32(newY))
	}

	t.sprite.Move(newPos)
	t.delay()
}

// Backward moves the turtle backward by the specified distance
func (t *Turtle) Backward(distance float32) {
	t.Forward(-distance)
}

// Right turns the turtle right by the specified angle in degrees
func (t *Turtle) Right(angle float32) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.heading = float32(math.Mod(float64(t.heading+angle), 360))
	t.sprite.SetAngle(t.heading)
	t.delay()
}

// Left turns the turtle left by the specified angle in degrees
func (t *Turtle) Left(angle float32) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.heading = float32(math.Mod(float64(t.heading-angle), 360))
	t.sprite.SetAngle(t.heading)
	t.delay()
}

// PenUp lifts the pen up (no drawing)
func (t *Turtle) PenUp() {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.penDown = false
}

// PenDown puts the pen down (drawing)
func (t *Turtle) PenDown() {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.penDown = true
}

// SetPenColor sets the color of the pen
func (t *Turtle) SetPenColor(c color.Color) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.penColor = c
}

// SetFillColor sets the fill color
func (t *Turtle) SetFillColor(c color.Color) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.fillColor = c
}

// SetPenSize sets the size of the pen
func (t *Turtle) SetPenSize(size float32) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.penSize = size
}

// Home moves the turtle to the origin (0,0) and sets heading to 0
func (t *Turtle) Home() {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	if t.penDown {
		t.drawLine(t.pos, t.home)
		t.pos = t.home
	}
	t.sprite.Move(t.home)
	t.heading = t.homeHeading
	t.sprite.SetAngle(t.homeHeading)
	t.delay()
}

// Goto moves the turtle to the specified coordinates
func (t *Turtle) Goto(x, y float32) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	newPos := fyne.NewPos(t.home.X+x, t.home.Y+y)
	if t.penDown {
		t.drawLine(t.pos, newPos)
	}
	t.pos = newPos
	t.sprite.Move(newPos)
	t.delay()
}

// SetHeading sets the turtle's heading to the specified angle
func (t *Turtle) SetHeading(angle float32) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.heading = float32(math.Mod(float64(angle), 360))
	t.sprite.SetAngle(t.heading)
	t.delay()
}

// Position returns the current position of the turtle
func (t *Turtle) Position() (float32, float32) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	return t.pos.X, t.pos.Y
}

// Heading returns the current heading of the turtle
func (t *Turtle) Heading() float32 {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	return t.heading
}

// IsDown returns whether the pen is down
func (t *Turtle) IsDown() bool {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	return t.penDown
}

// Speed sets the turtle's speed (0=fastest, 1-10 for incrementing speeds)
func (t *Turtle) Speed(speed int) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	if speed < 0 {
		speed = 0
	} else if speed > 10 {
		speed = 0
	}
	t.speed = speed
}

func (t *Turtle) delay() {
	// Add delay based on speed
	if t.speed > 0 {
		delay := time.Duration(11-t.speed) * 50 * time.Millisecond
		time.Sleep(delay)
	}
}

func (t *Turtle) drawLine(start, end fyne.Position) {
	line := canvas.NewLine(t.penColor)
	line.StrokeWidth = float32(t.penSize)
	line.Position1 = start
	line.Position2 = end
	t.drawing.Add(line)
}
