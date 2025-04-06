import { useState, useRef } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/HelpIcon.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Turtle, { TurtleHandle } from './components/Turtle'
import CodeEditor from './components/CodeEditor'
import OutputPanel from './components/OutputPanel'
import SpeedSlider from './components/SpeedSlider'
import Docs from './components/Docs'
import { parse } from './parser/parser'
import { Lexer } from './parser/lexer'
import { Context } from './spec'
import { Program } from './spec'

function App() {
  const [code, setCode] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [speed, setSpeed] = useState<number>(50) // Default speed (0-100)
  const [isDocsOpen, setIsDocsOpen] = useState(false)
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
      console.clear();
      // Parse the Logo code
      const lexer = new Lexer(code);
      lexer.tokenize();
      const program = parse(code, lexer.getTokens());
      
      // If there are errors, display them and stop execution
      if (program.errors.length > 0) {
        setOutput(`Parsing errors:\n${program.errors.map(err => `- ${err}`).join('\n')}`);
        return;
      }
      
      console.log('Program:', program.toString());
      
      // Create context with the turtle reference
      const context = new Context(turtleRef.current);
      
      // Execute the program with delays
      executeWithDelay(program, context, 0);
      
      // Set initial output
      setOutput(`Executing program...\n${program.toString()}`);
    } catch (error) {
      // Handle any errors
      console.error('Execution error:', error);
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Execute commands one by one with delay
  const executeWithDelay = (program: Program, context: Context, index: number) => {
    if (index >= program.length) {
      setOutput(prev => `Program executed successfully.\n${prev.split('\n').slice(1).join('\n')}`);
      return;
    }
    
    // Execute the current command
    try {
      program.executeCommand(context, index);
      
      // Schedule the next command after delay
      setTimeout(() => {
        executeWithDelay(program, context, index + 1);
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
        <button 
          className="help-icon" 
          onClick={() => setIsDocsOpen(true)}
          aria-label="Help"
        >
          ?
        </button>
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
      
      {/* Documentation Modal */}
      <Docs isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  )
}

export default App
