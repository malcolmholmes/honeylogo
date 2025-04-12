import React, { useState, useEffect } from 'react';

interface SavedProgram {
  name: string;
  code: string;
  savedAt: number;
}

interface ProgramManagerProps {
  currentCode: string;
  onLoadProgram: (code: string) => void;
}

const ProgramManager: React.FC<ProgramManagerProps> = ({ currentCode, onLoadProgram }) => {
  const [programs, setPrograms] = useState<SavedProgram[]>([]);
  const [programName, setProgramName] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentProgramName, setCurrentProgramName] = useState<string | null>(null);
  const [showSaveHelp, setShowSaveHelp] = useState(false);
  
  // Load saved programs from localStorage on component mount
  useEffect(() => {
    loadSavedPrograms();
  }, []);
  
  // Load programs from localStorage
  const loadSavedPrograms = () => {
    try {
      const savedPrograms = localStorage.getItem('honeylogo-programs');
      if (savedPrograms) {
        setPrograms(JSON.parse(savedPrograms));
      }
    } catch (error) {
      console.error('Error loading saved programs:', error);
    }
  };
  
  // Save programs to localStorage
  const savePrograms = (updatedPrograms: SavedProgram[]) => {
    try {
      localStorage.setItem('honeylogo-programs', JSON.stringify(updatedPrograms));
      setPrograms(updatedPrograms);
    } catch (error) {
      console.error('Error saving programs:', error);
    }
  };
  
  // Save current program
  const saveProgram = () => {
    // Validation
    if (!programName.trim()) {
      setSaveError('Please enter a program name');
      return;
    }
    
    if (!currentCode.trim()) {
      setSaveError('Cannot save an empty program');
      return;
    }
    
    // Check if a program with this name already exists
    const existingIndex = programs.findIndex(p => p.name === programName);
    const newProgram: SavedProgram = {
      name: programName,
      code: currentCode,
      savedAt: Date.now()
    };
    
    let updatedPrograms: SavedProgram[];
    
    if (existingIndex >= 0) {
      // Update existing program
      const confirmed = window.confirm(`A program named "${programName}" already exists. Do you want to replace it?`);
      if (!confirmed) return;
      
      updatedPrograms = [...programs];
      updatedPrograms[existingIndex] = newProgram;
    } else {
      // Add new program
      updatedPrograms = [...programs, newProgram];
    }
    
    savePrograms(updatedPrograms);
    setProgramName('');
    setSaveError('');
    setIsSaveModalOpen(false);
  };
  
  // Load selected program
  const loadProgram = (program: SavedProgram) => {
    if (currentCode.trim() && currentCode !== program.code) {
      const confirmed = window.confirm('Loading a program will replace your current code. Continue?');
      if (!confirmed) return;
    }
    
    onLoadProgram(program.code);
    setIsLoadModalOpen(false);
    setCurrentProgramName(program.name);
  };
  
  // Delete a program
  const deleteProgram = (programName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${programName}"?`);
    if (!confirmed) return;
    
    const updatedPrograms = programs.filter(p => p.name !== programName);
    savePrograms(updatedPrograms);
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Handle opening save modal
  const handleOpenSaveModal = () => {
    // Pre-populate with current program name if available
    if (currentProgramName) {
      setProgramName(currentProgramName);
    }
    setIsSaveModalOpen(true);
  };

  return (
    <div className="d-flex justify-content-center">
      {/* Save/Load Icons */}
      <button
        className="btn btn-outline-primary mx-1"
        onClick={handleOpenSaveModal}
        title="Save Program"
      >
        <i className="bi bi-save"></i> Save
        {currentProgramName && <span className="ms-1">({currentProgramName})</span>}
      </button>
      
      <button
        className="btn btn-outline-secondary mx-1"
        onClick={() => setIsLoadModalOpen(true)}
        disabled={programs.length === 0}
        title="Load Program"
      >
        <i className="bi bi-folder-open"></i> Load
      </button>
      
      {/* Save Program Modal */}
      {isSaveModalOpen && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title flex-grow-1">Save Program</h5>
                <div className="d-flex align-items-center">
                  <button 
                    className="btn btn-sm btn-outline-info rounded-circle p-1 me-2" 
                    style={{ width: '24px', height: '24px', fontSize: '12px', lineHeight: 1 }}
                    onClick={() => setShowSaveHelp(!showSaveHelp)}
                    title="About saving programs"
                  >
                    ?
                  </button>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsSaveModalOpen(false)}
                  ></button>
                </div>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="programName" className="form-label mb-2">Program Name</label>
                  
                  {showSaveHelp && (
                    <div className="alert alert-info mb-3">
                      <p className="mb-0">
                        Your program will be stored in your browser's "local storage". You can retrieve 
                        it whenever you want. However, it will only be available within this browser, 
                        not from any other devices.
                      </p>
                    </div>
                  )}
                  
                  <input
                    type="text"
                    className="form-control"
                    id="programName"
                    placeholder="Enter a name for your program"
                    value={programName}
                    onChange={(e) => {
                      setProgramName(e.target.value);
                      setSaveError('');
                    }}
                  />
                  {saveError && (
                    <div className="alert alert-danger py-1 mt-2">{saveError}</div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsSaveModalOpen(false);
                    setShowSaveHelp(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveProgram}
                >
                  Save Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Load Program Modal */}
      {isLoadModalOpen && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Load Program</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsLoadModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {programs.length === 0 ? (
                  <p className="text-center text-muted">No saved programs</p>
                ) : (
                  <div className="list-group">
                    {programs.map((program) => (
                      <div
                        key={program.name}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={() => loadProgram(program)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <h6 className="mb-1">{program.name}</h6>
                          <small className="text-muted">Saved: {formatDate(program.savedAt)}</small>
                        </div>
                        <div>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click event
                              deleteProgram(program.name);
                            }}
                            title="Delete program"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsLoadModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal backdrop */}
      {(isLoadModalOpen || isSaveModalOpen) && (
        <div 
          className="modal-backdrop show" 
          onClick={() => {
            setIsLoadModalOpen(false);
            setIsSaveModalOpen(false);
          }}
        ></div>
      )}
    </div>
  );
};

export default ProgramManager;
