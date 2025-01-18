package turtle

import (
	"image/color"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTurtleMovement(t *testing.T) {
	turtle := New()

	// Initial position
	x, y := turtle.GetPosition()
	assert.Equal(t, 0.0, x)
	assert.Equal(t, 0.0, y)

	// Move forward
	turtle.Forward(100)
	x, y = turtle.GetPosition()
	assert.InDelta(t, 0.0, x, 0.001)
	assert.InDelta(t, 100.0, y, 0.001)

	// Turn right and move
	turtle.Right(90)
	turtle.Forward(50)
	x, y = turtle.GetPosition()
	assert.InDelta(t, 50.0, x, 0.001)
	assert.InDelta(t, 100.0, y, 0.001)
}

func TestTurtleRotation(t *testing.T) {
	turtle := New()

	// Initial angle
	assert.Equal(t, 90.0, turtle.GetAngle())

	// Turn left
	turtle.Left(45)
	assert.Equal(t, 135.0, turtle.GetAngle())

	// Turn right
	turtle.Right(90)
	assert.Equal(t, 45.0, turtle.GetAngle())
}

func TestPenControl(t *testing.T) {
	turtle := New()

	// Initial path should be empty
	assert.Empty(t, turtle.GetPath())

	// Move with pen down
	turtle.Forward(100)
	assert.Len(t, turtle.GetPath(), 1)

	// Lift pen
	turtle.PenUp()
	turtle.Forward(50)
	assert.Len(t, turtle.GetPath(), 1)

	// Put pen down
	turtle.PenDown()
	turtle.Forward(50)
	assert.Len(t, turtle.GetPath(), 2)
}

func TestSetColor(t *testing.T) {
	turtle := New()

	// Set a custom color
	red := color.RGBA{255, 0, 0, 255}
	turtle.SetColor(red)
}

func TestAngleNormalization(t *testing.T) {
	turtle := New()

	// Test angle wrapping
	turtle.Left(450) // Should be equivalent to 90 degrees
	assert.InDelta(t, 180.0, turtle.GetAngle(), 0.001)

	turtle.Right(540) // Should be equivalent to 270 degrees
	assert.InDelta(t, 270.0, turtle.GetAngle(), 0.001)
}
