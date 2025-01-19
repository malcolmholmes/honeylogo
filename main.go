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
	canvas       *canvas.Image
	cmdInput     *widget.Entry
	outputLog    *widget.Entry
	turtleStatus *widget.Label
	delayInput   *widget.Entry
	renderer     rendering.Renderer
}

func NewLogoApp() *LogoApp {
	a := &LogoApp{
		app:      app.New(),
		interp:   interpreter.New(),
		renderer: rendering.NewRenderer(),
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

	la.canvas = canvas.NewImageFromImage(img)
	la.canvas.SetMinSize(fyne.NewSize(canvasWidth, canvasHeight))
	la.canvas.FillMode = canvas.ImageFillOriginal

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
		leftSideContainerWithTurtleStatus,
		la.canvas,
	)

	la.window.SetContent(content)
}

func (la *LogoApp) executeCommands() {
	// Get the text from the input
	commands := la.cmdInput.Text

	// Create a new image
	la.canvas.Image = image.NewRGBA(image.Rect(0, 0, rendering.CanvasWidth, rendering.CanvasHeight))

	// Execute the command
	drawing, err := la.interp.Execute(commands)
	if err != nil {
		// Log error to output log
		la.outputLog.Append("Error: " + err.Error() + "\n")
	} else {
		// Log successful command
		la.outputLog.Append("> " + commands + "\n")
	}
	// Render the drawing
	log.Debug().Msgf("phase=main render %d drawing points", len(drawing.Points()))

	la.renderer.SetCanvas(la.canvas)
	la.renderer.RenderDrawing(drawing)
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
			return "" // Remove log level
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
			return "" // Remove field names
		},
		FormatFieldValue: func(i interface{}) string {
			return "" // Remove field values
		},
	}).Level(zerolog.DebugLevel)
}

func main() {
	logoApp := NewLogoApp()
	logoApp.Run()
}
