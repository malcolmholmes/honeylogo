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
        
        // Redraw if needed
        const ctx = canvas.getContext('2d');
        if (ctx) {
          contextRef.current = ctx;
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
    },
    
    right: (degrees: number) => {
      angle.current = (angle.current + degrees) % 360;
    },
    
    left: (degrees: number) => {
      angle.current = (angle.current - degrees) % 360;
      if (angle.current < 0) angle.current += 360;
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
        angle.current = -90; // Reset to pointing upwards
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
