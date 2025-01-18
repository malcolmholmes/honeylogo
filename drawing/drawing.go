package drawing

import (
	"fmt"
	"image/color"
	"strings"

	"github.com/rs/zerolog/log"
)

// Point represents a 2D point with complete rendering information
type Point struct {
	X        float64
	Y        float64
	PenDown  bool
	PenColor color.Color
	Angle    float64  // Turtle direction at this point
	PenSize  float64  // Pen size at this point
}

// GetX returns the X coordinate of the point
func (p Point) GetX() float64 {
	return p.X
}

// GetY returns the Y coordinate of the point
func (p Point) GetY() float64 {
	return p.Y
}

// Drawing represents a complete drawing with all rendering details
type Drawing struct {
	// Sequence of points with rendering instructions
	points []Point
	
	// Current drawing state
	currentPenDown bool
	currentPenColor color.Color
	currentAngle float64
	currentPenSize float64
}

// NewDrawing creates a new Drawing starting at the origin
func NewDrawing() *Drawing {
	return &Drawing{
		points: []Point{
			{
				X:        0, 
				Y:        0, 
				PenDown:  true, 
				PenColor: color.Black,
				Angle:    0,  // Start facing up
				PenSize:  1.0, // Default pen size
			},
		},
		currentPenDown:  true,
		currentPenColor: color.Black,
		currentAngle:    0, // Start facing up
		currentPenSize:  1.0, // Default pen size
	}
}

// Len returns the number of points in the drawing
func (d *Drawing) Len() int {
	return len(d.points)
}

// Get returns a point at the given index
func (d *Drawing) Get(i int) Point {
	return d.points[i]
}

// Add adds a point to the drawing with current state
func (d *Drawing) Add(x, y float64) {
	log.Debug().Msgf("phase=draw point: (%.2f, %.2f)", x, y)
	point := Point{
		X:        x,
		Y:        y,
		PenDown:  d.currentPenDown,
		PenColor: d.currentPenColor,
		Angle:    d.currentAngle,
		PenSize:  d.currentPenSize,
	}
	d.points = append(d.points, point)
}

// SetPenState updates the current pen state
func (d *Drawing) SetPenState(down bool) {
	d.currentPenDown = down
}

// SetPenColor updates the current pen color
func (d *Drawing) SetPenColor(c color.Color) {
	d.currentPenColor = c
}

// SetAngle updates the current drawing angle
func (d *Drawing) SetAngle(angle float64) {
	d.currentAngle = angle
}

// SetPenSize updates the current pen size
func (d *Drawing) SetPenSize(size float64) {
	d.currentPenSize = size
}

// Points returns the underlying slice of points
func (d *Drawing) Points() []Point {
	return d.points
}

// GetCurrentPenState returns the current pen state
func (d *Drawing) GetCurrentPenState() bool {
	return d.currentPenDown
}

// GetCurrentPenColor returns the current pen color
func (d *Drawing) GetCurrentPenColor() color.Color {
	return d.currentPenColor
}

// GetCurrentAngle returns the current drawing angle
func (d *Drawing) GetCurrentAngle() float64 {
	return d.currentAngle
}

// GetCurrentPenSize returns the current pen size
func (d *Drawing) GetCurrentPenSize() float64 {
	return d.currentPenSize
}

// String provides a string representation of the drawing
func (d *Drawing) String() string {
	if len(d.points) == 0 {
		return "[]"
	}
	
	var sb strings.Builder
	sb.WriteString("Drawing [\n")
	for i, pt := range d.points {
		penState := "Down"
		if !pt.PenDown {
			penState = "Up"
		}
		sb.WriteString(fmt.Sprintf(
			"  Point %d: (%.2f, %.2f) Pen:%s Color:%v Angle:%.2f PenSize:%.2f\n", 
			i, pt.X, pt.Y, penState, pt.PenColor, pt.Angle, pt.PenSize,
		))
	}
	sb.WriteString(fmt.Sprintf(
		"Current State: Angle=%.2f, PenDown=%v, PenColor=%v, PenSize=%.2f\n]", 
		d.currentAngle, d.currentPenDown, d.currentPenColor, d.currentPenSize,
	))
	return sb.String()
}
