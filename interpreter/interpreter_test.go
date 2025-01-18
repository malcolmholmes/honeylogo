package interpreter

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSimpleCommands(t *testing.T) {
	interp := New()

	// Test forward command
	err := interp.Execute("forward 100")
	assert.NoError(t, err)
	x, y := interp.GetTurtle().GetPosition()
	assert.InDelta(t, 0.0, x, 0.001)
	assert.InDelta(t, 100.0, y, 0.001)

	// Test left command
	err = interp.Execute("left 90")
	assert.NoError(t, err)
	assert.InDelta(t, 180.0, interp.GetTurtle().GetAngle(), 0.001)
}

func TestRepeatCommand(t *testing.T) {
	interp := New()

	// Test simple repeat
	err := interp.Execute("repeat 4 [ forward 100 right 90 ]")
	assert.NoError(t, err)

	x, y := interp.GetTurtle().GetPosition()
	assert.InDelta(t, 0.0, x, 0.001)
	assert.InDelta(t, 0.0, y, 0.001)
}

func TestInvalidCommands(t *testing.T) {
	interp := New()

	// Test missing number
	err := interp.Execute("forward")
	assert.Error(t, err)

	// Test invalid token
	err = interp.Execute("dance 100")
	assert.Error(t, err)
}

func TestAliasCommands(t *testing.T) {
	interp := New()

	// Test forward alias
	err := interp.Execute("fd 50")
	assert.NoError(t, err)
	x, y := interp.GetTurtle().GetPosition()
	assert.InDelta(t, 0.0, x, 0.001)
	assert.InDelta(t, 50.0, y, 0.001)

	// Test left alias
	err = interp.Execute("lt 45")
	assert.NoError(t, err)
	assert.InDelta(t, 135.0, interp.GetTurtle().GetAngle(), 0.001)
}
