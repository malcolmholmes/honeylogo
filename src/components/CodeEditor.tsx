import React, { useState, useRef, useEffect } from 'react';
import { commandDefinitions, CommandSpec } from '../spec';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onExecute: () => void;
  onClear: () => void;
  isAnimating: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onExecute, onClear, isAnimating }) => {
  const [popupCommand, setPopupCommand] = useState<CommandSpec | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Function to find a command by name or alias
  const findCommandByNameOrAlias = (word: string) => {
    const upperWord = word.toUpperCase();
    return commandDefinitions.find(cmd => 
      cmd.name === upperWord || cmd.aliases.some(alias => alias === upperWord)
    );
  };

  // Get the word at the cursor position - simplified for robustness
  const getWordAtCursor = (textarea: HTMLTextAreaElement) => {
    try {
      // Get the text selection position
      const selectionStart = textarea.selectionStart;
      if (selectionStart === null) return null;
      
      // Get the text content
      const text = textarea.value;
      
      // Find word boundaries
      let start = selectionStart;
      while (start > 0 && /[a-zA-Z0-9]/.test(text[start - 1])) {
        start--;
      }
      
      let end = selectionStart;
      while (end < text.length && /[a-zA-Z0-9]/.test(text[end])) {
        end++;
      }
      
      // Extract the word
      if (start !== end) {
        return text.substring(start, end);
      }
    } catch (error) {
      console.error("Error getting word at cursor:", error);
    }
    
    return null;
  };
  
  // Handle CTRL+click event
  const handleMouseDown = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    try {
      if (e.ctrlKey || e.metaKey) {
        const textarea = e.currentTarget;
        
        // Focus the textarea to get proper selection
        textarea.focus();
        
        // Let browser handle the click first to set selection
        setTimeout(() => {
          // Now we should have a selection point
          const word = getWordAtCursor(textarea);
          console.log("WORD AT CURSOR:", word);
          
          if (word) {
            const command = findCommandByNameOrAlias(word);
            console.log("COMMAND:", command);
            
            if (command) {
              e.preventDefault(); // Prevent default behavior
              setPopupCommand(command);
            } else {
              // Close popup if the word is not a command
              setPopupCommand(null);
            }
          } else {
            // Close popup if no word is found
            setPopupCommand(null);
          }
        }, 0);
      } else if (popupCommand) {
        // If clicking without CTRL key and popup is open, close it
        setPopupCommand(null);
      }
    } catch (error) {
      console.error("Error in mouse down handler:", error);
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl+Enter (or Cmd+Enter on Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault(); // Prevent default behavior (newline insertion)
      onExecute();
    }
    
    // Close popup on Escape
    if (e.key === 'Escape' && popupCommand) {
      setPopupCommand(null);
    }
  };

  // Handle clicks outside the editor to close the popup
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popupCommand && 
          popupRef.current && 
          !popupRef.current.contains(e.target as Node) &&
          textareaRef.current && 
          !textareaRef.current.contains(e.target as Node)) {
        setPopupCommand(null);
      }
    };

    // Add click listener to document when popup is open
    if (popupCommand) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [popupCommand]);

  return (
    <div className="card h-100" ref={editorContainerRef}>
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Logo Code</h5>
        <small className="text-white-50 d-block mt-1">
          Ctrl+Click on any command to see documentation
        </small>
      </div>
      <div className="card-body d-flex flex-column p-0 position-relative">
        <textarea
          ref={textareaRef}
          className="form-control flex-grow-1 border-0"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          placeholder="Enter Logo commands..."
          style={{ resize: 'none', fontFamily: 'monospace' }}
        />
        
        {/* Simple inline popup for command information */}
        {popupCommand && (
          <div
            ref={popupRef}
            style={{
              position: 'absolute',
              top: '50px',
              left: '50px',
              backgroundColor: 'white',
              border: '2px solid #0066cc',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
              maxWidth: '300px',
              width: '300px'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #eee',
              paddingBottom: '8px',
              marginBottom: '8px'
            }}>
              <h4 style={{ margin: 0, color: '#0066cc' }}>{popupCommand.name}</h4>
              <button
                onClick={() => setPopupCommand(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            {popupCommand.aliases.length > 0 && (
              <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                <strong>Aliases:</strong> {popupCommand.aliases.join(', ')}
              </div>
            )}
            
            <p style={{ marginBottom: '10px' }}>{popupCommand.description}</p>
            
            <div style={{
              fontFamily: 'monospace',
              backgroundColor: '#f5f5f5',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '8px'
            }}>
              <strong>Usage:</strong> {popupCommand.name} {
                popupCommand.argumentTypes.map((arg, i) => 
                  arg === 4 ? "[<COMMANDS>]" : `<ARG${i+1}>`
                ).join(' ')
              }
            </div>
            
            {popupCommand.example && (
              <div>
                <strong>Example:</strong>
                <pre style={{
                  backgroundColor: '#f0f0f0',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  overflowX: 'auto',
                  marginTop: '5px'
                }}>
                  {popupCommand.example}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="card-footer p-0">
        <div className="d-flex">
          <button
            className={`btn ${isAnimating ? 'btn-danger' : 'btn-success'} flex-grow-1 rounded-0`}
            onClick={onExecute}
            title="Execute (Ctrl+Enter)"
          >
            {isAnimating ? 'Cancel' : 'Execute'}
          </button>
          <button
            className="btn btn-secondary flex-grow-1 rounded-0 border-left"
            onClick={onClear}
            disabled={isAnimating}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
