package main

import (
	"image"
	"strings"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"

	"github.com/honeylogo/logo/interpreter"
	"github.com/honeylogo/logo/rendering"

	"fmt"
	"os"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

const (
	canvasWidth  = rendering.CanvasWidth
	canvasHeight = rendering.CanvasHeight
)

type LogoApp struct {
	app          fyne.App
	window       fyne.Window
	interp       *interpreter.Interpreter
	drawingArea  *canvas.Image
	cmdInput     *widget.Entry
	outputLog    *widget.Entry
	turtleStatus *widget.Label
	delayInput   *widget.Entry
}

func NewLogoApp() *LogoApp {
	a := &LogoApp{
		app:    app.New(),
		interp: interpreter.New(),
	}

	// Start turtle in the middle of the screen, pointing up
	a.interp.GetTurtle().SetPosition(0, 0)
	a.interp.GetTurtle().SetAngle(90) // Pointing upwards

	a.setupUI()
	return a
}

func (la *LogoApp) setupUI() {
	la.window = la.app.NewWindow("HoneyLogo")
	la.window.Resize(fyne.NewSize(1200, 800))

	// Create a drawing area
	img := image.NewRGBA(image.Rect(0, 0, canvasWidth, canvasHeight))

	// Draw initial turtle
	currentX, currentY := la.interp.GetTurtle().GetPosition()
	currentAngle := la.interp.GetTurtle().GetAngle()
	rendering.DrawTurtle(img, int(currentX), int(currentY), currentAngle)

	la.drawingArea = canvas.NewImageFromImage(img)
	la.drawingArea.SetMinSize(fyne.NewSize(canvasWidth, canvasHeight))
	la.drawingArea.FillMode = canvas.ImageFillOriginal

	// Create input field for Logo commands
	la.cmdInput = widget.NewMultiLineEntry()
	la.cmdInput.SetPlaceHolder("Enter Logo commands...")

	// Create output log
	la.outputLog = widget.NewMultiLineEntry()
	la.outputLog.Disable() // Make it read-only

	// Create a submit button
	submitBtn := widget.NewButton("Execute", func() {
		la.executeCommands()
	})

	// Turtle status label
	la.turtleStatus = widget.NewLabel("Turtle status: ")

	// Left panel with command input and output log
	leftPanel := container.NewBorder(
		nil,         // Top
		submitBtn,   // Bottom
		nil,         // Left
		nil,         // Right
		la.cmdInput, // Center
	)

	// Output log panel
	outputPanel := container.NewBorder(
		nil,          // Top
		nil,          // Bottom
		nil,          // Left
		nil,          // Right
		la.outputLog, // Center
	)

	// Turtle status panel
	turtleStatusPanel := container.NewBorder(
		nil,             // Top
		nil,             // Bottom
		nil,             // Left
		nil,             // Right
		la.turtleStatus, // Center
	)

	// Left side container (commands and output)
	leftSideContainer := container.NewVSplit(
		leftPanel,
		outputPanel,
	)
	leftSideContainer.Offset = 0.7 // Give more space to command input

	// Left side container with turtle status
	leftSideContainerWithTurtleStatus := container.NewVSplit(
		leftSideContainer,
		turtleStatusPanel,
	)
	leftSideContainerWithTurtleStatus.Offset = 0.95 // Give more space to command input and output

	// Main window layout
	content := container.NewHSplit(
		la.drawingArea,
		leftSideContainerWithTurtleStatus,
	)

	la.window.SetContent(content)
}

func (la *LogoApp) updateCanvas() {
	// Create a new image to draw on
	img := image.NewRGBA(image.Rect(0, 0, canvasWidth, canvasHeight))

	// Get turtle from interpreter and adapt it
	currentTurtle := la.interp.GetTurtle()
	turtleAdapter := &rendering.TurtleAdapter{Turtle: currentTurtle}

	// Update canvas using rendering package
	rendering.UpdateCanvas(img, turtleAdapter)

	// Update canvas image
	la.drawingArea.Image = img
	la.drawingArea.Refresh()

	// Update turtle status
	la.turtleStatus.SetText(rendering.GetTurtleStatus(turtleAdapter))
}

func (la *LogoApp) executeCommands() {
	// Get the text from the input
	commands := la.cmdInput.Text

	// Split commands by newline
	for _, cmd := range strings.Split(commands, "\n") {
		cmd = strings.TrimSpace(cmd)
		if cmd == "" || strings.HasPrefix(cmd, ";") { // Skip empty lines and comments
			continue
		}

		// Execute the command
		err := la.interp.Execute(cmd)
		if err != nil {
			// Log error to output log
			la.outputLog.Append("Error: " + err.Error() + "\n")
		} else {
			// Log successful command
			la.outputLog.Append("> " + cmd + "\n")
		}
	}

	// Update canvas
	la.updateCanvas()
}

func (la *LogoApp) Run() {
	la.window.ShowAndRun()
}

func init() {
	// Configure zerolog for human-readable, colorized output
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{
		Out:        os.Stderr,
		TimeFormat: "15:04:05",
		FormatLevel: func(i interface{}) string {
			return ""  // Remove log level
		},
		FormatMessage: func(i interface{}) string {
			// Check if the message starts with a phase
			msg := fmt.Sprintf("%v", i)
			if strings.HasPrefix(msg, "phase=") {
				// Split the phase and the rest of the message
				parts := strings.SplitN(msg, " ", 2)
				if len(parts) == 2 {
					// Colorize the phase (cyan) and keep the rest of the message
					return fmt.Sprintf("\x1b[36m%s\x1b[0m %s", parts[0], parts[1])
				}
			}
			return msg
		},
		FormatFieldName: func(i interface{}) string {
			return ""  // Remove field names
		},
		FormatFieldValue: func(i interface{}) string {
			return ""  // Remove field values
		},
	}).Level(zerolog.DebugLevel)
}

func main() {
	logoApp := NewLogoApp()
	logoApp.Run()
}
