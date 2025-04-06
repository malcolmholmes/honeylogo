import React from 'react';
import { commandDefinitions, CommandCategory, CommandSpec } from '../spec';
import { ArgumentType } from '../parser/types';
import './Docs.css';

interface DocsProps {
  isOpen: boolean;
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

const Docs: React.FC<DocsProps> = ({ isOpen, onClose }) => {
  // Group commands by category
  const groupedCommands = commandDefinitions.reduce((acc: Record<CommandCategory, CommandSpec[]>, command: CommandSpec) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<CommandCategory, CommandSpec[]>);

  // Sort categories for consistent display
  const categories = Object.keys(groupedCommands) as CommandCategory[];
  
  if (!isOpen) return null;

  return (
    <div className="docs-modal-overlay" onClick={onClose}>
      <div className="docs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="docs-header">
          <h2>Logo Language Reference</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="docs-content">
          {categories.map(category => (
            <div key={category} className="category-section">
              <h3>{category}</h3>
              <div className="commands-grid">
                {groupedCommands[category].map((command: CommandSpec) => (
                  <div key={command.name} className="command-card">
                    <h4>{command.name}</h4>
                    {command.aliases.length > 0 && (
                      <div className="aliases">
                        Aliases: {command.aliases.join(', ')}
                      </div>
                    )}
                    <p className="description">{command.description}</p>
                    
                    <div className="arguments">
                      <strong>Usage:</strong> {formatCommandUsage(command.name, command.argumentTypes)}
                    </div>
                    
                    {command.example && (
                      <div className="example">
                        <strong>Example:</strong>
                        <pre>{command.example}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Docs;
