# HoneyLogo: A Logo Programming Language Interpreter in Go

## Overview
HoneyLogo is a modern implementation of the Logo programming language, designed to be simple, educational, and fun. This implementation focuses on the core features of Logo, including turtle graphics and basic programming constructs.

## Features
- Turtle graphics
- Basic Logo syntax support
- Simple interpreter
- Extensible design

## Getting Started

### Prerequisites
- Go 1.21 or higher

### Installation
```bash
git clone https://github.com/honeylogo/logo
cd logo
go mod tidy
go build
```

### Running
```bash
./logo
```

## Running the Logo Visualization

### Prerequisites
- Go 1.21 or higher
- Required system dependencies for Fyne (varies by platform)
  - Linux: `sudo apt-get install gcc libgl1-mesa-dev xorg-dev`
  - macOS: Xcode Command Line Tools
  - Windows: MinGW-w64 with GCC

### Installation
```bash
git clone https://github.com/honeylogo/logo
cd logo
go mod tidy
go build ./cmd
```

### Running the App
```bash
go run ./cmd
```

### Example Logo Commands
- `forward 100`: Move turtle forward 100 units
- `right 90`: Turn turtle right 90 degrees
- `repeat 4 [ forward 100 right 90 ]`: Draw a square
- `fd 50 rt 120 fd 50 rt 120 fd 50`: Draw an equilateral triangle

## Supported Logo Commands
- `forward` / `fd`
- `backward` / `bk`
- `left` / `lt`
- `right` / `rt`
- `penup` / `pu`
- `pendown` / `pd`
- `setcolor`
- `repeat`
- Basic arithmetic operations

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
MIT License
