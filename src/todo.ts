/**
 * Unimplemented Logo Commands in HoneyLogo
 * 
 * This file contains a list of commands from the JSLogo and Berkeley Logo specifications
 * that have not yet been implemented in HoneyLogo.
 */

export interface UnimplementedCommand {
  name: string;
  aliases: string[];
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  example?: string;
}

export const UNIMPLEMENTED_COMMANDS: UnimplementedCommand[] = [
  // ===== Data Structure Primitives =====
  // Array Operations
  {
    name: 'array',
    aliases: ['mdarray'],
    description: 'Create single and multi-dimensional arrays',
    category: 'Data Structure Primitives',
    priority: 'medium',
    example: 'MAKE "myarray ARRAY 5 0 ; Create a 1D array with 5 elements'
  },
  {
    name: 'listtoarray',
    aliases: ['arraytolist'],
    description: 'Convert between lists and arrays',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },
  {
    name: 'setitem',
    aliases: ['mdsetitem'],
    description: 'Set array elements',
    category: 'Data Structure Primitives',
    priority: 'medium',
    example: 'SETITEM 2 :myarray 10 ; Set third element to 10'
  },
  {
    name: 'mditem',
    aliases: [],
    description: 'Access multi-dimensional array elements',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },
  {
    name: 'combine',
    aliases: [],
    description: 'Combine two items into a word or list',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },
  {
    name: 'pick',
    aliases: [],
    description: 'Select random item from list',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },
  {
    name: 'quoted',
    aliases: [],
    description: 'Check if a value is quoted',
    category: 'Data Structure Primitives',
    priority: 'low'
  },
  {
    name: 'split',
    aliases: [],
    description: 'Split word into list',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },
  {
    name: 'gensym',
    aliases: [],
    description: 'Generate unique symbol',
    category: 'Data Structure Primitives',
    priority: 'low'
  },
  
  // Data Mutators
  {
    name: '.setfirst',
    aliases: [],
    description: 'Mutate the first element of a list',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },
  {
    name: '.setbf',
    aliases: [],
    description: 'Mutate the butfirst of a list',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },
  {
    name: 'push',
    aliases: [],
    description: 'Push an item onto a stack',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },
  {
    name: 'pop',
    aliases: [],
    description: 'Pop an item from a stack',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },
  {
    name: 'queue',
    aliases: [],
    description: 'Add an item to a queue',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },
  {
    name: 'dequeue',
    aliases: [],
    description: 'Remove an item from a queue',
    category: 'Data Structure Primitives',
    priority: 'medium'
  },

  // ===== Predicates =====
  // Type Checking
  {
    name: 'numberp',
    aliases: ['number?'],
    description: 'Check if a value is a number',
    category: 'Predicates',
    priority: 'high',
    example: 'PRINT NUMBER? 42 ; Outputs true'
  },
  {
    name: 'arrayp',
    aliases: ['array?'],
    description: 'Check if a value is an array',
    category: 'Predicates',
    priority: 'medium'
  },
  {
    name: 'equalp',
    aliases: ['equal?', '='],
    description: 'Check if two values are equal',
    category: 'Predicates',
    priority: 'high'
  },
  {
    name: 'notequalp',
    aliases: ['notequal?', '<>'],
    description: 'Check if two values are not equal',
    category: 'Predicates',
    priority: 'high'
  },
  {
    name: 'beforep',
    aliases: ['before?'],
    description: 'Check if one string comes before another',
    category: 'Predicates',
    priority: 'medium'
  },
  {
    name: '.eq',
    aliases: [],
    description: 'Check if two values are the same object',
    category: 'Predicates',
    priority: 'medium'
  },
  {
    name: 'substringp',
    aliases: ['substring?'],
    description: 'Check if a string contains another string',
    category: 'Predicates',
    priority: 'medium'
  },

  // ===== Communication =====
  // Text I/O
  {
    name: 'type',
    aliases: [],
    description: 'Print without adding a newline',
    category: 'Communication',
    priority: 'high',
    example: 'TYPE "Hello, " TYPE "world!" ; Prints on one line'
  },
  {
    name: 'readlist',
    aliases: [],
    description: 'Read a list from input',
    category: 'Communication',
    priority: 'medium'
  },
  {
    name: 'readword',
    aliases: [],
    description: 'Read a word from input',
    category: 'Communication',
    priority: 'medium'
  },
  {
    name: 'cleartext',
    aliases: ['ct'],
    description: 'Clear the text output area',
    category: 'Communication',
    priority: 'medium'
  },
  {
    name: 'settextcolor',
    aliases: [],
    description: 'Set the text color',
    category: 'Communication',
    priority: 'low'
  },
  {
    name: 'textcolor',
    aliases: [],
    description: 'Get the current text color',
    category: 'Communication',
    priority: 'low'
  },
  {
    name: 'increasefont',
    aliases: [],
    description: 'Increase the font size',
    category: 'Communication',
    priority: 'low'
  },
  {
    name: 'decreasefont',
    aliases: [],
    description: 'Decrease the font size',
    category: 'Communication',
    priority: 'low'
  },
  {
    name: 'settextsize',
    aliases: [],
    description: 'Set the text size',
    category: 'Communication',
    priority: 'low'
  },
  {
    name: 'textsize',
    aliases: [],
    description: 'Get the current text size',
    category: 'Communication',
    priority: 'low'
  },
  {
    name: 'setfont',
    aliases: [],
    description: 'Set the font family',
    category: 'Communication',
    priority: 'low'
  },
  {
    name: 'font',
    aliases: [],
    description: 'Get the current font family',
    category: 'Communication',
    priority: 'low'
  },

  // ===== Arithmetic =====
  // Math Operations
  {
    name: 'sum',
    aliases: [],
    description: 'Add numbers together',
    category: 'Arithmetic',
    priority: 'high',
    example: 'PRINT SUM 1 2 3 ; Outputs 6'
  },
  {
    name: 'difference',
    aliases: [],
    description: 'Subtract numbers',
    category: 'Arithmetic',
    priority: 'high'
  },
  {
    name: 'product',
    aliases: [],
    description: 'Multiply numbers',
    category: 'Arithmetic',
    priority: 'high'
  },
  {
    name: 'quotient',
    aliases: [],
    description: 'Divide numbers',
    category: 'Arithmetic',
    priority: 'high'
  },
  {
    name: 'modulo',
    aliases: [],
    description: 'Get the remainder of division',
    category: 'Arithmetic',
    priority: 'medium'
  },
  {
    name: 'minus',
    aliases: [],
    description: 'Negate a number',
    category: 'Arithmetic',
    priority: 'medium'
  },
  {
    name: 'abs',
    aliases: [],
    description: 'Get the absolute value',
    category: 'Arithmetic',
    priority: 'medium'
  },
  {
    name: 'int',
    aliases: [],
    description: 'Convert to integer',
    category: 'Arithmetic',
    priority: 'medium'
  },
  {
    name: 'round',
    aliases: [],
    description: 'Round a number',
    category: 'Arithmetic',
    priority: 'medium'
  },
  {
    name: 'sqrt',
    aliases: [],
    description: 'Square root',
    category: 'Arithmetic',
    priority: 'medium'
  },
  {
    name: 'log10',
    aliases: [],
    description: 'Base-10 logarithm',
    category: 'Arithmetic',
    priority: 'medium'
  },
  {
    name: 'ln',
    aliases: [],
    description: 'Natural logarithm',
    category: 'Arithmetic',
    priority: 'medium'
  },
  {
    name: 'iseq',
    aliases: [],
    description: 'Generate a sequence of integers',
    category: 'Arithmetic',
    priority: 'medium'
  },
  {
    name: 'rseq',
    aliases: [],
    description: 'Generate a sequence of real numbers',
    category: 'Arithmetic',
    priority: 'medium'
  },
  {
    name: 'form',
    aliases: [],
    description: 'Format a number',
    category: 'Arithmetic',
    priority: 'low'
  },
  {
    name: 'bitand',
    aliases: [],
    description: 'Bitwise AND',
    category: 'Arithmetic',
    priority: 'low'
  },
  {
    name: 'bitor',
    aliases: [],
    description: 'Bitwise OR',
    category: 'Arithmetic',
    priority: 'low'
  },
  {
    name: 'bitxor',
    aliases: [],
    description: 'Bitwise XOR',
    category: 'Arithmetic',
    priority: 'low'
  },
  {
    name: 'bitnot',
    aliases: [],
    description: 'Bitwise NOT',
    category: 'Arithmetic',
    priority: 'low'
  },
  {
    name: 'ashift',
    aliases: [],
    description: 'Arithmetic shift',
    category: 'Arithmetic',
    priority: 'low'
  },
  {
    name: 'lshift',
    aliases: [],
    description: 'Logical shift',
    category: 'Arithmetic',
    priority: 'low'
  },

  // Numeric Predicates
  {
    name: 'lessp',
    aliases: ['less?', '<'],
    description: 'Check if first number is less than second',
    category: 'Numeric Predicates',
    priority: 'high'
  },
  {
    name: 'greaterp',
    aliases: ['greater?', '>'],
    description: 'Check if first number is greater than second',
    category: 'Numeric Predicates',
    priority: 'high'
  },
  {
    name: 'lessequalp',
    aliases: ['lessequal?', '<='],
    description: 'Check if first number is less than or equal to second',
    category: 'Numeric Predicates',
    priority: 'high'
  },
  {
    name: 'greaterequalp',
    aliases: ['greaterequal?', '>='],
    description: 'Check if first number is greater than or equal to second',
    category: 'Numeric Predicates',
    priority: 'high'
  },

  // ===== Graphics =====
  // Turtle Motion
  {
    name: 'arc',
    aliases: [],
    description: 'Draw an arc',
    category: 'Graphics',
    priority: 'medium'
  },

  // Turtle Motion Queries
  {
    name: 'pos',
    aliases: [],
    description: 'Get current position',
    category: 'Graphics',
    priority: 'high'
  },
  {
    name: 'xcor',
    aliases: [],
    description: 'Get x-coordinate',
    category: 'Graphics',
    priority: 'high'
  },
  {
    name: 'ycor',
    aliases: [],
    description: 'Get y-coordinate',
    category: 'Graphics',
    priority: 'high'
  },
  {
    name: 'heading',
    aliases: [],
    description: 'Get current heading',
    category: 'Graphics',
    priority: 'high'
  },
  {
    name: 'towards',
    aliases: [],
    description: 'Calculate angle to point',
    category: 'Graphics',
    priority: 'medium'
  },
  {
    name: 'scrunch',
    aliases: [],
    description: 'Get view bounds',
    category: 'Graphics',
    priority: 'low'
  },
  {
    name: 'bounds',
    aliases: [],
    description: 'Get view bounds',
    category: 'Graphics',
    priority: 'low'
  },

  // Turtle and Window Control
  {
    name: 'clean',
    aliases: [],
    description: 'Clear drawing without reset',
    category: 'Graphics',
    priority: 'medium'
  },
  {
    name: 'wrap',
    aliases: [],
    description: 'Set wrap mode for turtle movement',
    category: 'Graphics',
    priority: 'medium'
  },
  {
    name: 'window',
    aliases: [],
    description: 'Set window mode for turtle movement',
    category: 'Graphics',
    priority: 'medium'
  },
  {
    name: 'fence',
    aliases: [],
    description: 'Set fence mode for turtle movement',
    category: 'Graphics',
    priority: 'medium'
  },
  {
    name: 'filled',
    aliases: [],
    description: 'Fill with color',
    category: 'Graphics',
    priority: 'medium'
  },
  {
    name: 'setscrunch',
    aliases: [],
    description: 'Set aspect ratio',
    category: 'Graphics',
    priority: 'low'
  },
  {
    name: 'setturtle',
    aliases: [],
    description: 'Set current turtle',
    category: 'Graphics',
    priority: 'low'
  },
  {
    name: 'ask',
    aliases: [],
    description: 'Send command to specific turtles',
    category: 'Graphics',
    priority: 'low'
  },
  {
    name: 'clearturtles',
    aliases: [],
    description: 'Clear all turtles',
    category: 'Graphics',
    priority: 'low'
  },

  // ===== Workspace Management =====
  // Property Lists
  {
    name: 'pprop',
    aliases: [],
    description: 'Set a property in a property list',
    category: 'Workspace Management',
    priority: 'medium',
    example: 'PPROP "plist "property "value ; Set a property'
  },
  {
    name: 'gprop',
    aliases: [],
    description: 'Get a property from a property list',
    category: 'Workspace Management',
    priority: 'medium'
  },
  {
    name: 'remprop',
    aliases: [],
    description: 'Remove a property from a property list',
    category: 'Workspace Management',
    priority: 'medium'
  },
  {
    name: 'plist',
    aliases: [],
    description: 'Get all properties from a property list',
    category: 'Workspace Management',
    priority: 'medium'
  },

  // ===== Control Structures =====
  {
    name: 'run',
    aliases: [],
    description: 'Execute code from a list',
    category: 'Control Structures',
    priority: 'high'
  },
  {
    name: 'runresult',
    aliases: [],
    description: 'Execute code from a list and return result',
    category: 'Control Structures',
    priority: 'high'
  },
  {
    name: 'forever',
    aliases: [],
    description: 'Execute a block of code indefinitely',
    category: 'Control Structures',
    priority: 'high',
    example: 'FOREVER [FORWARD 1 RIGHT 1] ; Draw a circle'
  },
  {
    name: 'output',
    aliases: ['op'],
    description: 'Return a value from a procedure',
    category: 'Control Structures',
    priority: 'high'
  },
  {
    name: 'stop',
    aliases: [],
    description: 'Stop procedure execution',
    category: 'Control Structures',
    priority: 'high'
  },
  {
    name: 'catch',
    aliases: [],
    description: 'Catch exceptions',
    category: 'Control Structures',
    priority: 'medium'
  },
  {
    name: 'throw',
    aliases: [],
    description: 'Throw an exception',
    category: 'Control Structures',
    priority: 'medium'
  },
  {
    name: 'for',
    aliases: [],
    description: 'Counted loop',
    category: 'Control Structures',
    priority: 'medium'
  },
  {
    name: 'dotimes',
    aliases: [],
    description: 'Repeat a fixed number of times',
    category: 'Control Structures',
    priority: 'medium'
  },
  {
    name: 'do.while',
    aliases: [],
    description: 'Do-while loop',
    category: 'Control Structures',
    priority: 'medium'
  },
  {
    name: 'do.until',
    aliases: [],
    description: 'Do-until loop',
    category: 'Control Structures',
    priority: 'medium'
  },
  {
    name: 'while',
    aliases: [],
    description: 'While loop',
    category: 'Control Structures',
    priority: 'medium'
  },
  {
    name: 'until',
    aliases: [],
    description: 'Until loop',
    category: 'Control Structures',
    priority: 'medium'
  },
  {
    name: 'case',
    aliases: [],
    description: 'Case statement',
    category: 'Control Structures',
    priority: 'medium'
  },
  {
    name: 'cond',
    aliases: [],
    description: 'Conditional expression',
    category: 'Control Structures',
    priority: 'medium'
  },

  // ===== Template-based Iteration =====
  {
    name: 'apply',
    aliases: [],
    description: 'Apply a function to arguments',
    category: 'Template-based Iteration',
    priority: 'medium'
  },
  {
    name: 'invoke',
    aliases: [],
    description: 'Invoke a procedure with arguments',
    category: 'Template-based Iteration',
    priority: 'medium'
  },
  {
    name: 'foreach',
    aliases: [],
    description: 'Iterate over items in a list',
    category: 'Template-based Iteration',
    priority: 'medium',
    example: 'FOREACH [1 2 3] [PRINT ?] ; Print each number'
  },
  {
    name: 'map',
    aliases: [],
    description: 'Apply a function to each item in a list',
    category: 'Template-based Iteration',
    priority: 'medium'
  },
  {
    name: 'filter',
    aliases: [],
    description: 'Filter a list based on a predicate',
    category: 'Template-based Iteration',
    priority: 'medium'
  },
  {
    name: 'find',
    aliases: [],
    description: 'Find an item in a list',
    category: 'Template-based Iteration',
    priority: 'medium'
  },
  {
    name: 'reduce',
    aliases: [],
    description: 'Reduce a list to a single value',
    category: 'Template-based Iteration',
    priority: 'medium'
  },
  {
    name: 'crossmap',
    aliases: [],
    description: 'Apply a function to all combinations of list items',
    category: 'Template-based Iteration',
    priority: 'medium'
  }
];

// Group commands by category
export const groupedUnimplementedCommands = UNIMPLEMENTED_COMMANDS.reduce((acc, cmd) => {
  if (!acc[cmd.category]) {
    acc[cmd.category] = [];
  }
  acc[cmd.category].push(cmd);
  return acc;
}, {} as Record<string, UnimplementedCommand[]>);
