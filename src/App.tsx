import { useState, useRef, useEffect } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/HelpIcon.css';
import './styles/AboutIcon.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal, Button } from 'react-bootstrap'
import Split from 'react-split'
import './styles/SplitPane.css'
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
  const [showAbout, setShowAbout] = useState(false)
  const turtleRef = useRef<TurtleHandle>(null)
  const [isAnimating, setIsAnimating] = useState(false);
  
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
  
  const handleAnimationEnd = () => {
    setIsAnimating(false);
  }
  const handleExecute = () => {
    if (!turtleRef.current) return;
    
    if (isAnimating) {
      turtleRef.current.cancelAnimation();
      setIsAnimating(false);
      return;
    }
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
        (message) => setOutput(prev => `${prev ? prev + '\n' : ''}${message}`)
      );
      
      // Start executing commands with delay
      setIsAnimating(true);
      executeWithDelay(program, context, 0);
    } catch (error) {
      console.error(error);
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Execute commands one by one with delay
  const executeWithDelay = (program: Program, context: Context, index: number) => {
    if (index >= program.commands.length) {
      // Add completion message only if there's no output yet
      if (!context.hasOutput) {
        setOutput(prev => `${prev ? prev + '\n' : ''}Program executed successfully.`);
      }
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
    <div className="container-fluid p-0" style={{ overflow: 'hidden' }}>
      <header className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
        <h1 className="mb-0">
          <img src="images/logo.svg" alt="HoneyLogo" width="100px"></img>
        </h1>
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
            title="Help"
          >
            ?
          </button>
          <button 
            className="about-icon" 
            onClick={() => setShowAbout(true)}
            aria-label="About"
            title="About HoneyLogo"
          >
            i
          </button>
        </div>
      </header>
      
      <Split
        className="split-container"
        direction="horizontal"
        sizes={[40, 60]}
        minSize={[300, 400]}
        gutterSize={8}
        snapOffset={30}
        style={{ height: 'calc(100vh - 70px)' }}
      >
        <div className="left-panel">
          <Split
            className="split-wrapper"
            direction="vertical"
            sizes={[60, 40]}
            minSize={100}
            gutterSize={8}
            gutterAlign="center"
            snapOffset={30}
          >
            <div className="code-section">
              <CodeEditor 
                code={code} 
                onChange={setCode} 
                onExecute={handleExecute} 
                onClear={handleClear}
                isAnimating={isAnimating}
              />
            </div>
            <div className="output-section d-flex flex-column" style={{ height: '100%' }}>
              <div className="speed-slider-container">
                <SpeedSlider speed={speed} onChange={handleSpeedChange} />
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <OutputPanel output={output} />
              </div>
            </div>
          </Split>
        </div>
        <div className="turtle-container" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Turtle ref={turtleRef} onAnimationEnd={handleAnimationEnd} />
        </div>
      </Split>
      
      {/* Documentation Modal */}
      {isDocsOpen && <Docs isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />}
      
      {/* About Modal */}
      <Modal 
        show={showAbout} 
        onHide={() => setShowAbout(false)}
        className="about-modal"
        centered
        scrollable
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>About HoneyLogo</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <h5>HoneyLogo v1.0.0</h5>
          <p>
            HoneyLogo is a modern implementation of the Logo programming language with a focus on education and ease of use.
          </p>
          <p>
            HoneyLogo was originally written by <a target="_blank" href="https://malcolholmes.org">Malcolm Holmes</a> in
            the 1980s, and was used widely in schools in the UK and around the world. A wide range
            of support materials were made available by the publishing company, Glentop. These resources
            were curated and prepared by Martin Sims, Janet Forster
            and <a target="_blank" href="https://holmesbrass.com">Dr Peter Holmes</a>.
          </p>
          <p>
            This modern implementation has been made possible almost entirely due to the Windsurf AI
            coding platform. Handing it a specification of what was required, combined with an
            understanding of language design and implementation, allowed the AI to complete 90% of this
            site with minimal human intervention.
          </p>
          <p>
            We hope you enjoy this site that brings together the best of the 1980s with a modern twist!
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAbout(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default App
