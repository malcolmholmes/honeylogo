import React from 'react';

interface OutputPanelProps {
  output: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output }) => {
  return (
    <div className="card h-100">
      <div className="card-header bg-secondary text-white">
        <h5 className="mb-0">Output</h5>
      </div>
      <div className="card-body p-0">
        <textarea
          className="form-control h-100 border-0"
          value={output}
          readOnly
          style={{ resize: 'none', backgroundColor: '#f8f9fa' }}
        />
      </div>
    </div>
  );
};

export default OutputPanel;
