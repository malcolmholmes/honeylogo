import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onExecute: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onExecute }) => {
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
          placeholder="Enter Logo commands..."
          style={{ resize: 'none' }}
        />
      </div>
      <div className="card-footer p-0">
        <button
          className="btn btn-success btn-execute"
          onClick={onExecute}
        >
          Execute
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
