import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onExecute: () => void;
  onClear: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onExecute, onClear }) => {
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl+Enter (or Cmd+Enter on Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault(); // Prevent default behavior (newline insertion)
      onExecute();
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Logo Code</h5>
      </div>
      <div className="card-body d-flex flex-column p-0">
        <textarea
          className="form-control flex-grow-1 border-0"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Logo commands..."
          style={{ resize: 'none' }}
        />
      </div>
      <div className="card-footer p-0">
        <div className="d-flex">
          <button
            className="btn btn-success flex-grow-1 rounded-0"
            onClick={onExecute}
            title="Execute (Ctrl+Enter)"
          >
            Execute
          </button>
          <button
            className="btn btn-secondary flex-grow-1 rounded-0 border-left"
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
