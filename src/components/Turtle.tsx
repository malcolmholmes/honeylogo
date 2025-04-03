import React, { useImperativeHandle, useRef, useEffect, forwardRef } from 'react';

interface TurtleProps {}

export interface TurtleHandle {
  forward: (distance: number) => void;
  right: (angle: number) => void;
  left: (angle: number) => void;
  penUp: () => void;
  penDown: () => void;
  setColor: (color: string) => void;
  clear: () => void;
  demo: () => void;
}

const Turtle = forwardRef<TurtleHandle, TurtleProps>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // State variables (using refs to avoid re-renders)
  const position = useRef({ x: 0, y: 0 });
  const angle = useRef(-90); // Start pointing upwards (-90 degrees)
  const isPenDown = useRef(true);
  const color = useRef('#000000');
  const turtleSize = useRef(15); // Size of the turtle sprite
  const backgroundImageData = useRef<ImageData | null>(null);
  const lastTurtlePosition = useRef({ x: 0, y: 0 });
  
  // Function to erase the turtle at its previous position
  const eraseTurtle = () => {
    const ctx = contextRef.current;
    if (!ctx || !backgroundImageData.current) return;
    
    const size = turtleSize.current;
    // Restore the saved background from where the turtle was previously drawn
    ctx.putImageData(
      backgroundImageData.current, 
      lastTurtlePosition.current.x - size - 2,
      lastTurtlePosition.current.y - size - 2
    );
  };

  // Function to draw the turtle sprite
  const drawTurtle = () => {
    const ctx = contextRef.current;
    if (!ctx) return;
    
    const size = turtleSize.current;
    const x = position.current.x;
    const y = position.current.y;
    
    // Save the current position as the last turtle position
    lastTurtlePosition.current = { x, y };
    
    // Save the background before drawing the turtle
    backgroundImageData.current = ctx.getImageData(
      x - size - 2, 
      y - size - 2, 
      size * 2 + 4, 
      size * 2 + 4
    );
    
    // Save current context state
    ctx.save();
    
    // Move to the current position and rotate
    ctx.translate(x, y);
    ctx.rotate(angle.current * Math.PI / 180);
    
    // Draw an arrow/triangle representing the turtle
    ctx.fillStyle = '#00AA00'; // Green turtle
    ctx.beginPath();
    ctx.moveTo(size, 0); // Nose of the arrow
    ctx.lineTo(-size / 2, size / 2); // Bottom right corner
    ctx.lineTo(-size / 2, -size / 2); // Bottom left corner
    ctx.closePath();
    ctx.fill();
    
    // Restore context to previous state
    ctx.restore();
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // Reset turtle position to center
        position.current = {
          x: canvas.width / 2,
          y: canvas.height / 2
        };
        
        // Also update last turtle position
        lastTurtlePosition.current = position.current;
        
        // Redraw if needed
        const ctx = canvas.getContext('2d');
        if (ctx) {
          contextRef.current = ctx;
          // Draw the turtle in its initial position
          drawTurtle();
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    forward: (distance: number) => {
      if (!contextRef.current) return;
      
      // Erase the turtle from its previous position
      eraseTurtle();
      
      const radians = angle.current * Math.PI / 180;
      const newX = position.current.x + distance * Math.cos(radians);
      const newY = position.current.y + distance * Math.sin(radians);
      
      if (isPenDown.current) {
        const ctx = contextRef.current;
        ctx.beginPath();
        ctx.strokeStyle = color.current;
        ctx.lineWidth = 2;
        ctx.moveTo(position.current.x, position.current.y);
        ctx.lineTo(newX, newY);
        ctx.stroke();
      }
      
      position.current = { x: newX, y: newY };
      
      // Redraw the turtle at its new position
      drawTurtle();
    },
    
    right: (degrees: number) => {
      // Erase the turtle from its previous position
      eraseTurtle();
      
      angle.current = (angle.current + degrees) % 360;
      
      // Redraw the turtle with the new angle
      drawTurtle();
    },
    
    left: (degrees: number) => {
      // Erase the turtle from its previous position
      eraseTurtle();
      
      angle.current = (angle.current - degrees) % 360;
      if (angle.current < 0) angle.current += 360;
      
      // Redraw the turtle with the new angle
      drawTurtle();
    },
    
    penUp: () => {
      isPenDown.current = false;
    },
    
    penDown: () => {
      isPenDown.current = true;
    },
    
    setColor: (newColor: string) => {
      color.current = newColor;
    },
    
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        position.current = { x: canvas.width / 2, y: canvas.height / 2 };
        lastTurtlePosition.current = position.current;
        angle.current = -90; // Reset to pointing upwards
        
        // Draw the turtle at its initial position
        drawTurtle();
      }
    },
    
    demo: () => {
      // Simple demo that draws a colorful spiral
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
      const turtle = ref as React.MutableRefObject<TurtleHandle>;
      
      if (turtle.current) {
        let size = 10;
        turtle.current.clear();
        
        const drawSpiral = (i = 0) => {
          if (i >= 60) return;
          
          turtle.current.setColor(colors[i % colors.length]);
          turtle.current.forward(size);
          turtle.current.right(90);
          size += 5;
          
          // Use setTimeout to animate the drawing
          setTimeout(() => drawSpiral(i + 1), 50);
        };
        
        drawSpiral();
      }
    }
  }));

  return (
    <div className="h-100 w-100">
      <canvas 
        ref={canvasRef} 
        className="turtle-canvas"
      />
    </div>
  );
});

export default Turtle;
