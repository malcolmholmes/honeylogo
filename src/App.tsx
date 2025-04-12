import { useState, useRef, useEffect } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/HelpIcon.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Turtle, { TurtleHandle } from './components/Turtle'
import CodeEditor from './components/CodeEditor'
import OutputPanel from './components/OutputPanel'
import SpeedSlider from './components/SpeedSlider'
import Docs from './components/Docs'
import ProgramManager from './components/ProgramManager'
import { parse } from './parser/parser'
import { Lexer } from './parser/lexer'
import { Context, Program } from './spec'

function App() {
  const [code, setCode] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [speed, setSpeed] = useState<number>(50) // Default speed (0-100)
  const [isDocsOpen, setIsDocsOpen] = useState(false)
  const turtleRef = useRef<TurtleHandle>(null)
  
  // Higher speed value = less delay
  const getDelay = () => {
    // Map speed 0-100 to delay 500-0ms (500ms at slowest, 0ms at fastest)
    return 500 - (speed * 5);
  }
  
  useEffect(() => {
    if (turtleRef.current) {
      // Convert speed (0-100) to animation speed for the turtle
      turtleRef.current.setAnimationSpeed(speed);
    }
  }, [speed]);
  
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
      const program: Program = parse(code, lexer.getTokens());
      
      // If there are errors, display them and stop execution
      if (program.errors.length > 0) {
        setOutput(`Parsing errors:\n${program.errors.map(err => `- ${err}`).join('\n')}`);
        return;
      }
      
      // Create execution context and execute the program
      const context = new Context(
        turtleRef.current, 
        (message) => setOutput(prev => `${message}\n${prev}`)
      );
      
      // Start executing commands with delay
      executeWithDelay(program, context, 0);
    } catch (error) {
      console.error(error);
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Execute commands one by one with delay
  const executeWithDelay = (program: Program, context: Context, index: number) => {
    if (index >= program.commands.length) {
      setOutput(prev => `Program executed successfully.\n${prev.split('\n').slice(1).join('\n')}`);
      return;
    }
    
    // Execute the current command
    try {
      program.commands[index].execute(context);
      
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
  }
  
  const handleClear = () => {
    if (!turtleRef.current) return;
    
    // Clear the canvas
    turtleRef.current.clear();
    
    // Clear the output
    setOutput('');
  }

  const toggleDocs = () => {
    setIsDocsOpen(!isDocsOpen);
  }

  // Handle load program from ProgramManager
  const handleLoadProgram = (programCode: string) => {
    setCode(programCode);
    setOutput('Program loaded successfully.');
  }

  return (
    <div className="container-fluid p-0">
      <header className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
        <h1 className="mb-0">HoneyLogo</h1>
        <div className="d-flex align-items-center">
          <div className="me-3">
            <ProgramManager 
              currentCode={code}
              onLoadProgram={handleLoadProgram}
            />
          </div>
          <button 
            className="help-icon" 
            onClick={toggleDocs}
            aria-label="Help"
            style={{ position: 'relative', zIndex: 1 }}
          >
            ?
          </button>
        </div>
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
      {isDocsOpen && <Docs isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />}
    </div>
  )
}

export default App
