package main

import (
	"image/color"
	"strings"
	"time"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"

	"github.com/honeylogo/logo/ast"
	"github.com/honeylogo/logo/parser"
	"github.com/honeylogo/logo/turtle"

	"fmt"
	"os"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

const (
	canvasWidth  = 1200
	canvasHeight = 800
)

func executeCommands(turtle *turtle.Turtle) {

	// Draw the turtle graphics
	colors := []color.Color{
		color.RGBA{R: 255, A: 255},
		color.RGBA{G: 255, A: 255},
		color.RGBA{B: 255, A: 255},
		color.RGBA{R: 255, G: 255, A: 255},
	}

	size := float32(10.0)
	for i := 0; i < 60; i++ {
		log.Debug().Msgf("phase=main turtle draw point %d", i)
		turtle.SetPenColor(colors[i%len(colors)])
		turtle.Forward(size)
		turtle.Right(90)
		size += 5
	}
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
			msg := fmt.Sprintf("%v", i)
			if strings.HasPrefix(msg, "phase=") {
				parts := strings.SplitN(msg, " ", 2)
				if len(parts) == 2 {
					return fmt.Sprintf("\x1b[36m%s\x1b[0m %s", parts[0], parts[1])
				}
			}
			return msg
		},
	}).Level(zerolog.DebugLevel)
}

func main() {
	// Create a new Fyne application
	myApp := app.New()

	// Create a new window
	myWindow := myApp.NewWindow("HoneyLogo")

	// Set the window size
	myWindow.Resize(fyne.NewSize(canvasWidth, canvasHeight))

	ctrlPressed := false
	myWindow.Canvas().SetOnTypedKey(func(key *fyne.KeyEvent) {
		if key.Name == "Control" {
			ctrlPressed = true
		}
	})
	drawing := container.NewWithoutLayout()

	t := turtle.NewTurtle(drawing, canvasWidth, canvasHeight)
	t.Speed(10)

	codeBox := widget.NewMultiLineEntry()
	codeBox.SetPlaceHolder("Enter Logo commands...")
	codeBox.Resize(fyne.NewSize(400, 400))
	codeBox.OnSubmitted = func(text string) {
		if ctrlPressed {
			log.Debug().Msgf("phase=main ctrl-Enter: %s", text)
		} else {
			log.Debug().Msgf("enter: %s,", text)
		}
	}
	executeButton := widget.NewButton("Execute", func() {

		program := codeBox.Text

		ctx := ast.NewContext(t)
		ast, err := parser.ParseProgram(program)
		if err != nil {
			log.Fatal().Err(err).Msg("Failed to parse program")
		}
		err = ast.Execute(ctx)
		if err != nil {
			log.Fatal().Err(err).Msg("Failed to execute program")
		}
	})
	/*
		desktop.KeyDown(func(key *fyne.KeyEvent) {
			if key.Name == "Control" {
				ctrlPressed = true
			}
		})
	*/
	codePanel := container.NewBorder(nil, executeButton, nil, nil, codeBox)
	outputBox := widget.NewMultiLineEntry()
	outputBox.Disable()
	outputBox.Resize(fyne.NewSize(400, 400))
	outputPanel := container.NewBorder(nil, nil, nil, nil, outputBox)

	leftContainer := container.NewVSplit(codePanel, outputPanel)
	leftContainer.Resize(fyne.NewSize(400, 800))
	content := container.NewHSplit(leftContainer, drawing)
	content.Refresh()
	drawing.Refresh()
	myWindow.SetContent(content)
	go func() {
		time.Sleep(300 * time.Millisecond) // Wait for rendering
		t.Resize()
	}()
	// Show and run the application
	myWindow.ShowAndRun()
}

/*
  So, before I wire up a logo interpreter, what else do I need?
*/
