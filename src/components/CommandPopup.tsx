import React from 'react';
import ReactDOM from 'react-dom';
import { CommandSpec } from '../spec';
import { ArgumentType } from '../parser/types';
import './CommandPopup.css';

interface CommandPopupProps {
  command: CommandSpec;
  position: { x: number, y: number };
  onClose: () => void;
}

// Map argument types to readable format for display
const getArgumentTypeName = (type: ArgumentType): string => {
  switch (type) {
    case ArgumentType.Number:
      return 'NUMBER';
    case ArgumentType.String:
      return 'STRING';
    case ArgumentType.Block:
      return 'BLOCK';
    case ArgumentType.List:
      return 'LIST';
    case ArgumentType.Boolean:
      return 'BOOLEAN';
    case ArgumentType.Condition:
      return 'CONDITION';
    default:
      return 'ARGUMENT';
  }
};

const formatCommandUsage = (name: string, argumentTypes: ArgumentType[]): string => {
  if (argumentTypes.length === 0) {
    return name;
  }
  
  const args = argumentTypes.map(argType => {
    const typeName = getArgumentTypeName(argType);
    if (argType === ArgumentType.Block) {
      return '[<COMMANDS>]';
    }
    return `<${typeName}>`;
  }).join(' ');
  
  return `${name} ${args}`;
};

const CommandPopup: React.FC<CommandPopupProps> = ({ command, position, onClose }) => {
  // Close the popup when clicking outside or pressing Escape
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.command-popup')) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
console.log("POPUP FOR", command.name)
  // Use portal to render the popup at the document body level
  // This ensures it appears above all other elements
  const popupContent = (
    <div 
      className="command-popup"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        zIndex: 9999 // Ensure high z-index
      }}
    >
      <div className="command-popup-header">
        <h4>{command.name}</h4>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      {command.aliases.length > 0 && (
        <div className="aliases">
          Aliases: {command.aliases.join(', ')}
        </div>
      )}
      
      <p className="description">{command.description}</p>
      
      <div className="usage">
        <strong>Usage:</strong> {formatCommandUsage(command.name, command.argumentTypes)}
      </div>
      
      {command.example && (
        <div className="example">
          <strong>Example:</strong>
          <pre>{command.example}</pre>
        </div>
      )}
      
      <div className="category">
        Category: {command.category}
      </div>
    </div>
  );

  // Create a portal to render at the body level
  // Only use portal in browser environment
  if (typeof document !== 'undefined') {
    return ReactDOM.createPortal(
      popupContent,
      document.body
    );
  }
  
  // Fallback for server-side rendering
  return popupContent;
};

export default CommandPopup;
