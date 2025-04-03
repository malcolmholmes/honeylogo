import { useState, useRef } from 'react'
import './App.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Turtle, { TurtleHandle } from './components/Turtle'
import CodeEditor from './components/CodeEditor'
import OutputPanel from './components/OutputPanel'
import SpeedSlider from './components/SpeedSlider'
import { parseProgram } from './parser/parser'
import { Context } from './ast/ast'
import { Command } from './ast/ast'

function App() {
  const [code, setCode] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [speed, setSpeed] = useState<number>(50) // Default speed (0-100)
  const turtleRef = useRef<TurtleHandle>(null)
  
  // Calculate delay in milliseconds from speed (0-100)
  // Higher speed value = less delay
  const getDelay = () => {
    // Map speed 0-100 to delay 500-0ms (500ms at slowest, 0ms at fastest)
    return 500 - (speed * 5);
  }
  
  const handleExecute = () => {
    if (!turtleRef.current) return;
    
    try {
      // Clear previous output and turtle drawings
      setOutput('')
      turtleRef.current.clear();
      
      // Parse the Logo code
      const program = parseProgram(code);
      
      // Create context with the turtle reference
      const context = new Context(turtleRef.current);
      
      // Execute the program with delays
      executeWithDelay(program.commands, context, 0);
      
      // Set initial output
      setOutput(`Executing program...\n${program.toString()}`);
    } catch (error) {
      // Handle any errors
      console.error('Execution error:', error);
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Execute commands one by one with delay
  const executeWithDelay = (commands: Command[], context: Context, index: number) => {
    if (index >= commands.length) {
      setOutput(prev => `Program executed successfully.\n${prev.split('\n').slice(1).join('\n')}`);
      return;
    }
    
    // Execute the current command
    try {
      commands[index].execute(context);
      
      // Schedule the next command after delay
      setTimeout(() => {
        executeWithDelay(commands, context, index + 1);
      }, getDelay());
    } catch (error) {
      console.error('Execution error:', error);
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    
    // Update the turtle's animation speed when the slider changes
    if (turtleRef.current) {
      turtleRef.current.setAnimationSpeed(newSpeed);
    }
  }
  
  const handleClear = () => {
    if (!turtleRef.current) return;
    
    // Clear the canvas
    turtleRef.current.clear();
    
    // Clear the output
    setOutput('');
  }

  return (
    <div className="container-fluid p-0">
      <header className="bg-dark text-white p-3">
        <h1>HoneyLogo</h1>
      </header>
      
      <div className="row g-0 main-content">
        <div className="col-md-4">
          <div className="d-flex flex-column h-100">
            <div className="flex-grow-1">
              <CodeEditor 
                code={code} 
                onChange={setCode} 
                onExecute={handleExecute} 
                onClear={handleClear}
              />
            </div>
            <div className="mb-0 mt-2">
              <SpeedSlider speed={speed} onChange={handleSpeedChange} />
            </div>
            <div className="flex-grow-1">
              <OutputPanel output={output} />
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <Turtle ref={turtleRef} />
        </div>
      </div>
    </div>
  )
}

export default App
