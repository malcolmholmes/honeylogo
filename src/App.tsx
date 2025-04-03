import { useState, useRef, useEffect } from 'react'
import './App.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Turtle, { TurtleHandle } from './components/Turtle'
import CodeEditor from './components/CodeEditor'
import OutputPanel from './components/OutputPanel'
import { parseProgram } from './parser/parser'
import { Context } from './ast/ast'

function App() {
  const [code, setCode] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const turtleRef = useRef<TurtleHandle>(null)
  
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
      
      // Execute the program
      program.execute(context);
      
      // Set success output
      setOutput(`Program executed successfully.\n${program.toString()}`);
    } catch (error) {
      // Handle any errors
      console.error('Execution error:', error);
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
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
              />
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
