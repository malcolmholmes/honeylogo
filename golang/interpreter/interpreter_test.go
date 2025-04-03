package interpreter

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSimpleCommands(t *testing.T) {
	interp := New()

	// Test forward command
	drawing, err := interp.Execute("forward 100")
	assert.NoError(t, err)
	assert.NotNil(t, drawing)
	x, y := interp.GetTurtle().GetPosition()
	assert.InDelta(t, 0.0, x, 0.001)
	assert.InDelta(t, 100.0, y, 0.001)

	// Test left command
	drawing, err = interp.Execute("left 90")
	assert.NoError(t, err)
	assert.NotNil(t, drawing)
	assert.InDelta(t, 180.0, interp.GetTurtle().GetAngle(), 0.001)
}

func TestRepeatCommand(t *testing.T) {
	interp := New()

	// Test simple repeat
	drawing, err := interp.Execute("repeat 4 [ forward 100 right 90 ]")
	assert.NoError(t, err)
	assert.NotNil(t, drawing)

	x, y := interp.GetTurtle().GetPosition()
	assert.InDelta(t, 0.0, x, 0.001)
	assert.InDelta(t, 0.0, y, 0.001)
}

func TestInvalidCommands(t *testing.T) {
	interp := New()

	// Test missing number
	drawing, err := interp.Execute("forward")
	assert.Error(t, err)
	assert.Nil(t, drawing)

	// Test invalid token
	drawing, err = interp.Execute("dance 100")
	assert.Error(t, err)
	assert.Nil(t, drawing)
}

func TestAliasCommands(t *testing.T) {
	interp := New()

	// Test forward alias
	drawing, err := interp.Execute("fd 100")
	assert.NoError(t, err)
	assert.NotNil(t, drawing)
	x, y := interp.GetTurtle().GetPosition()
	assert.InDelta(t, 0.0, x, 0.001)
	assert.InDelta(t, 100.0, y, 0.001)

	// Test left alias
	drawing, err = interp.Execute("lt 90")
	assert.NoError(t, err)
	assert.NotNil(t, drawing)
	assert.InDelta(t, 270.0, interp.GetTurtle().GetAngle(), 0.001)
}
