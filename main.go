package main

import (
	"image/color"
	"strings"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"

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
	myWindow.Resize(fyne.NewSize(800, 600))

	drawing := container.NewWithoutLayout()

	t := turtle.NewTurtle(drawing, 800, 600)
	t.Speed(10)
	executeButton := widget.NewButton("Execute", func() {

		for j := 0; j < 60; j++ {
			for i := 0; i < 4; i++ {
				t.Forward(100)
				t.Right(90)
			}
			t.Right(360 / 60)
		}
	})
	// Layout
	content := container.NewBorder(nil, executeButton, nil, nil, drawing)
	myWindow.SetContent(content)

	// Show and run the application
	myWindow.ShowAndRun()
}
