package rendering

import (
	"fmt"
	"image"
	"image/color"
	"time"

	"math"

	"fyne.io/fyne/v2/canvas"
	"github.com/rs/zerolog/log"

	"github.com/honeylogo/logo/drawing"
	"github.com/honeylogo/logo/turtle"
)

const (
	CanvasWidth   = 800
	CanvasHeight  = 600
	CanvasCentreX = CanvasWidth / 2
	CanvasCentreY = CanvasHeight / 2
)

// Global variable to control rendering delay
var renderDelay time.Duration = 300 * time.Millisecond

// SetRenderDelay allows external control of rendering delay
func SetRenderDelay(delay time.Duration) {
	renderDelay = delay
}

// drawLine draws a line between two points on an image
func DrawLine(img *image.RGBA, x0, y0, x1, y1 int, lineColor color.Color) {
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
	log.Debug().Msgf("phase=render turtle: at=(%d, %d) angle=%f", x, y, angle)
	// Turtle size
	size := 10

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
	GetColor() color.Color
	IsPenDown() bool
}

// TurtleAdapter adapts a turtle to the TurtleInterface
type TurtleAdapter struct {
	Turtle *turtle.Turtle
}

// GetPosition returns the turtle's current position
func (ta *TurtleAdapter) GetPosition() (float64, float64) {
	return ta.Turtle.GetX(), ta.Turtle.GetY()
}

// GetAngle returns the turtle's current angle
func (ta *TurtleAdapter) GetAngle() float64 {
	return ta.Turtle.GetAngle()
}

// GetColor returns the turtle's pen color
func (ta *TurtleAdapter) GetColor() color.Color {
	return ta.Turtle.GetColor()
}

// IsPenDown returns whether the pen is down
func (ta *TurtleAdapter) IsPenDown() bool {
	return ta.Turtle.IsPenDown()
}

// Renderer interface for rendering drawings
type Renderer interface {
	RenderDrawing(drawing *drawing.Drawing)
	SetCanvas(canvas *canvas.Image)
}

// DefaultRenderer implements the Renderer interface
type DefaultRenderer struct {
	canvas *canvas.Image
	image  *image.RGBA
	width  int
	height int
}

// NewRenderer creates a new DefaultRenderer
func NewRenderer() *DefaultRenderer {
	return &DefaultRenderer{}
}

// SetImage sets the canvas for rendering
func (r *DefaultRenderer) SetCanvas(canvas *canvas.Image) {
	if canvas != nil {
		r.canvas = canvas
		r.image = canvas.Image.(*image.RGBA)
		r.width = r.image.Bounds().Dx()
		r.height = r.image.Bounds().Dy()
	}
}

// saveTurtleBackground saves the area where the turtle will be drawn
func saveTurtleBackground(img *image.RGBA, x, y, size int) []color.Color {
	// Calculate the total area to save
	totalSize := (2*size + 1) * (2*size + 1)
	background := make([]color.Color, totalSize)

	// Track actual saved pixels
	savedPixels := 0

	// Save background pixels within image bounds
	for dx := -size; dx <= size; dx++ {
		for dy := -size; dy <= size; dy++ {
			newX := x + dx
			newY := y + dy

			// Check if pixel is within image bounds
			if newX >= 0 && newX < img.Bounds().Dx() &&
				newY >= 0 && newY < img.Bounds().Dy() {
				// Safely index into background slice
				if savedPixels < totalSize {
					background[savedPixels] = img.At(newX, newY)
					savedPixels++
				}
			}
		}
	}

	// Trim background to actual saved pixels
	return background[:savedPixels]
}

// restoreTurtleBackground restores the background after drawing the turtle
func restoreTurtleBackground(img *image.RGBA, x, y, size int, background []color.Color) {
	// Track restored pixels
	savedPixels := 0

	// Restore background pixels within image bounds
	for dx := -size; dx <= size; dx++ {
		for dy := -size; dy <= size; dy++ {
			newX := x + dx
			newY := y + dy

			// Check if pixel is within image bounds
			if newX >= 0 && newX < img.Bounds().Dx() &&
				newY >= 0 && newY < img.Bounds().Dy() {
				// Safely index into background slice
				if savedPixels < len(background) {
					img.Set(newX, newY, background[savedPixels])
					savedPixels++
				}
			}
		}
	}
}

// RenderDrawing renders a drawing on the canvas
func (r *DefaultRenderer) RenderDrawing(drawing *drawing.Drawing) {
	if drawing == nil || len(drawing.Points()) == 0 {
		log.Printf("No drawing points to render\n")
		return
	}

	// Clear the canvas
	for x := 0; x < r.width; x++ {
		for y := 0; y < r.height; y++ {
			r.image.Set(x, y, color.White)
		}
	}

	// Log total number of points
	log.Printf("Total drawing points: %d", len(drawing.Points()))

	// Calculate canvas center dynamically
	centreX := r.width / 2
	centreY := r.height / 2

	// Turtle sprite size
	turtleSize := 10

	// Render the drawing points
	x0, y0 := int(drawing.Points()[0].X+float64(centreX)), int(float64(centreY)-drawing.Points()[0].Y)

	// Save background where turtle will be drawn
	background := saveTurtleBackground(r.image, x0, y0, turtleSize)

	for i, point := range drawing.Points()[1:] {
		// Restore background to remove turtle sprite
		restoreTurtleBackground(r.image, x0, y0, turtleSize, background)

		x1, y1 := int(point.X+float64(centreX)), int(float64(centreY)-point.Y)

		// Detailed color logging
		red, green, blue, alpha := point.PenColor.RGBA()
		log.Printf("DRAWING LINE %d: from=(%d, %d) to=(%d, %d) color=RGBA(%d,%d,%d,%d) penDown=%v",
			i, x0, y0, x1, y1, red, green, blue, alpha, point.PenDown)

		// Verify line drawing
		if x0 == x1 && y0 == y1 {
			log.Printf("SKIPPING LINE: Same start and end point")
			continue
		}

		// Draw the line
		DrawLine(r.image, x0, y0, x1, y1, point.PenColor)

		// Save background where turtle will be drawn
		background = saveTurtleBackground(r.image, x1, y1, turtleSize)

		// Draw turtle sprite at the end of the line
		DrawTurtle(r.image, x1, y1, point.Angle)
		r.canvas.Refresh()
		time.Sleep(renderDelay)

		x0, y0 = x1, y1
	}
}
