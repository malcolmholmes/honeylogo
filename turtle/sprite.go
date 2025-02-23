package turtle

import (
	"image"
	"image/color"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"github.com/disintegration/imaging"
	"github.com/rs/zerolog/log"
)

// TurtleSprite represents a turtle sprite with position and angle
type TurtleSprite struct {
	image     *canvas.Image // This will hold the image
	x, y      float64       // Position
	angle     float64       // Angle in degrees
	visible   bool
	png       image.Image
	container *fyne.Container
}

// NewTurtleSprite creates a new turtle sprite
func NewTurtleSprite() *TurtleSprite {
	t := &TurtleSprite{
		visible: true,
		x:       100,
		y:       100,
		angle:   90,
	}
	png, err := imaging.Open("turtle/sprite.png")
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to open sprite.png")
	}
	t.png = png
	t.image = canvas.NewImageFromImage(png)
	t.image.Resize(fyne.NewSize(30, 30))
	t.image.FillMode = canvas.ImageFillContain
	t.container = container.NewWithoutLayout()
	t.container.Add(t.image)
	t.updateImage()
	return t
}

// Image returns the image of the turtle sprite
func (t *TurtleSprite) Image() *fyne.Container {
	return t.container
}

// SetAngle sets the angle of the turtle sprite
func (t *TurtleSprite) SetAngle(angle float32) {
	t.container.Remove(t.image)
	spriteAngle := float64(270 - angle)
	rotatedImage := imaging.Rotate(t.png, spriteAngle, color.Transparent)
	t.image = canvas.NewImageFromImage(rotatedImage)
	t.image.Resize(fyne.NewSize(30, 30))
	t.angle = float64(angle)
	t.image.Refresh()
	t.container.Add(t.image)
	t.container.Refresh()
	t.updateImage() // Update the image position based on the new angle
}

// Show makes the turtle sprite visible
func (t *TurtleSprite) Show() {
	t.visible = true
	t.updateImage()
}

// Hide removes the turtle sprite from the canvas
func (t *TurtleSprite) Hide() {
	t.visible = false
}

// updateImage updates the image position based on the current coordinates
func (t *TurtleSprite) updateImage() {
	if !t.visible {
		return
	}

	// Set the position of the image
	t.image.Move(fyne.NewPos(float32(t.x-15), float32(t.y-15)))
}

// Move sets the position of the turtle sprite
func (t *TurtleSprite) Move(pos fyne.Position) {
	t.x = float64(pos.X)
	t.y = float64(pos.Y)
	t.updateImage() // Update the image position based on the new coordinates
}

// Position returns the current position of the turtle sprite
func (t *TurtleSprite) Position() fyne.Position {
	return fyne.NewPos(float32(t.x), float32(t.y))
}

// MinSize returns the minimum size of the turtle sprite
func (t *TurtleSprite) MinSize() fyne.Size {
	return fyne.NewSize(20, 20) // or any appropriate size for your sprite
}

// Size returns the current size of the turtle sprite
func (t *TurtleSprite) Size() fyne.Size {
	return fyne.NewSize(20, 20) // or any appropriate size for your sprite
}

// Resize sets the size of the turtle sprite
func (t *TurtleSprite) Resize(size fyne.Size) {
	// Implement resizing logic if necessary
}

// Refresh updates the visual representation of the turtle sprite
func (t *TurtleSprite) Refresh() {
	if t.visible {
		t.updateImage() // Ensure the image is updated
	}
}

// Visible returns whether the turtle sprite is visible
func (t *TurtleSprite) Visible() bool {
	return t.visible
}
