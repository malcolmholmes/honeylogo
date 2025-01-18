package rendering

import (
	"fmt"
	"image"
	"image/color"

	"math"

	"github.com/rs/zerolog/log"

	"github.com/honeylogo/logo/drawing"
)

const (
	CanvasWidth   = 800
	CanvasHeight  = 600
	CanvasCentreX = CanvasWidth / 2
	CanvasCentreY = CanvasHeight / 2
)

// drawLine draws a line between two points on an image
func DrawLine(img *image.RGBA, x0, y0, x1, y1 int, lineColor color.Color) {
	log.Debug().Msgf("phase=render line: from=(%d, %d) to=(%d, %d)", x0, y0, x1, y1)
	dx := abs(x1 - x0)
	dy := abs(y1 - y0)
	sx, sy := 1, 1
	if x0 >= x1 {
		sx = -1
	}
	if y0 >= y1 {
		sy = -1
	}
	err := dx - dy

	for {
		img.Set(x0, y0, lineColor)
		if x0 == x1 && y0 == y1 {
			return
		}
		e2 := 2 * err
		if e2 > -dy {
			err -= dy
			x0 += sx
		}
		if e2 < dx {
			err += dx
			y0 += sy
		}
	}
}

// drawTurtle draws a simple turtle representation on the image
func DrawTurtle(img *image.RGBA, x, y int, angle float64) {
	// Turtle size
	size := 10

	angle = angle - 90
	// Calculate turtle triangle points
	radians := (angle - 90) * math.Pi / 180
	x1 := x + int(float64(size)*math.Cos(radians))
	y1 := y + int(float64(size)*math.Sin(radians))

	// Side points of the triangle
	angle1 := radians + math.Pi*2/3
	angle2 := radians - math.Pi*2/3

	x2 := x + int(float64(size/2)*math.Cos(angle1))
	y2 := y + int(float64(size/2)*math.Sin(angle1))

	x3 := x + int(float64(size/2)*math.Cos(angle2))
	y3 := y + int(float64(size/2)*math.Sin(angle2))

	// Draw triangle
	DrawLine(img, x1, y1, x2, y2, color.Black)
	DrawLine(img, x2, y2, x3, y3, color.Black)
	DrawLine(img, x3, y3, x1, y1, color.Black)
}

// abs returns the absolute value of an integer
func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

// UpdateCanvasFunc is a function type for updating the canvas
type UpdateCanvasFunc func(img *image.RGBA)

// UpdateCanvas draws the turtle's path on the given image
func UpdateCanvas(img *image.RGBA, turtle TurtleInterface) {
	// Draw path
	drawing := turtle.GetPath()
	if len(drawing.Points()) > 0 {
		currentX, currentY := turtle.GetPosition()
		x0, y0 := int(currentX+CanvasCentreX), int(CanvasCentreY-currentY)
		for _, point := range drawing.Points() {
			// Draw line between points
			x1, y1 := int(point.X+CanvasCentreX), int(CanvasCentreY-point.Y)
			log.Debug().Msgf("phase=render Drawing line from (%d, %d) to (%d, %d)", x0, y0, x1, y1)

			DrawLine(img, x0, y0, x1, y1, color.Black)
			x0, y0 = x1, y1
		}

		// Draw turtle at the end of the last drawn line
		currentX, currentY = float64(x0), float64(y0)
		currentAngle := turtle.GetAngle()
		DrawTurtle(img, x0, y0, currentAngle)
	} else {
		// If no path, draw turtle at its current position
		currentX, currentY := turtle.GetPosition()
		currentAngle := turtle.GetAngle()
		DrawTurtle(img, int(currentX+CanvasCentreX), int(CanvasCentreY-currentY), currentAngle)
	}
}

// GetTurtleStatus returns a formatted string with turtle status
func GetTurtleStatus(turtle TurtleInterface) string {
	x, y := turtle.GetPosition()
	penState := "Down"
	if !turtle.IsPenDown() {
		penState = "Up"
	}
	return fmt.Sprintf(
		"X:%.2f Y:%.2f deg:%.2f Pen:%s Color:%v",
		x,
		y,
		turtle.GetAngle(),
		penState,
		turtle.GetColor(),
	)
}

// TurtleInterface defines the methods required for rendering
type TurtleInterface interface {
	GetPosition() (float64, float64)
	GetAngle() float64
	GetPath() *drawing.Drawing
	IsPenDown() bool
	GetColor() color.Color
}

// TurtleAdapter adapts a turtle to the TurtleInterface
type TurtleAdapter struct {
	Turtle TurtleInterface
}

// GetPosition returns the turtle's current position
func (ta *TurtleAdapter) GetPosition() (float64, float64) {
	return ta.Turtle.GetPosition()
}

// GetAngle returns the turtle's current angle
func (ta *TurtleAdapter) GetAngle() float64 {
	return ta.Turtle.GetAngle()
}

// GetPath converts the turtle's path
func (ta *TurtleAdapter) GetPath() *drawing.Drawing {
	return ta.Turtle.GetPath()
}

// IsPenDown returns whether the pen is down
func (ta *TurtleAdapter) IsPenDown() bool {
	return ta.Turtle.IsPenDown()
}

// GetColor returns the turtle's pen color
func (ta *TurtleAdapter) GetColor() color.Color {
	return ta.Turtle.GetColor()
}
