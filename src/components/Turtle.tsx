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
  setAnimationSpeed: (speed: number) => void;
  hideTurtle: () => void;
  showTurtle: () => void;
  setPenSize?: (size: number) => void;
  setPosition?: (x: number | null, y: number | null) => void;
  setHeading?: (angle: number) => void;
  home?: () => void;
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
  const animationSpeed = useRef(10); // Number of animation steps per movement
  const animationInProgress = useRef(false); // Track if animation is in progress
  const animationQueue = useRef<(() => void)[]>([]); // Queue for pending animations
  const isTurtleVisible = useRef(true); // Track if turtle is visible
  const penSize = useRef(2); // Pen size
  
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
    if (!isTurtleVisible.current) return;
    
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
  
  // Process next animation in queue
  const processNextAnimation = () => {
    if (animationQueue.current.length > 0) {
      const nextAnimation = animationQueue.current.shift();
      if (nextAnimation) {
        nextAnimation();
      }
    } else {
      animationInProgress.current = false;
    }
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
  useImperativeHandle(ref, () => {
    // Create the interface object
    const turtleInterface: TurtleHandle = {
      forward: (distance: number) => {
        // Queue this animation
        const animateForward = () => {
          if (!contextRef.current) {
            processNextAnimation();
            return;
          }
          
          const ctx = contextRef.current;
          const radians = angle.current * Math.PI / 180;
          const startX = position.current.x;
          const startY = position.current.y;
          const endX = startX + distance * Math.cos(radians);
          const endY = startY + distance * Math.sin(radians);
          
          // Number of steps based on animation speed
          // More steps = smoother but slower animation
          const steps = Math.max(5, Math.min(Math.abs(distance), animationSpeed.current * 5));
          let currentStep = 0;
          
          // Function for animation step
          const animateStep = () => {
            if (currentStep >= steps) {
              // Animation complete, process next animation
              processNextAnimation();
              return;
            }
            
            currentStep++;
            
            // Calculate incremental movement
            const progress = currentStep / steps;
            const newX = startX + (endX - startX) * progress;
            const newY = startY + (endY - startY) * progress;
            
            // Erase the turtle from its previous position
            eraseTurtle();
            
            // Draw the line segment if pen is down
            if (isPenDown.current) {
              ctx.beginPath();
              ctx.strokeStyle = color.current;
              ctx.lineWidth = 2;
              // For smooth continuous lines, only draw from the last position to new position
              ctx.moveTo(position.current.x, position.current.y);
              ctx.lineTo(newX, newY);
              ctx.stroke();
            }
            
            // Update position
            position.current = { x: newX, y: newY };
            
            // Redraw turtle at new position
            drawTurtle();
            
            // Schedule next step
            requestAnimationFrame(animateStep);
          };
          
          // Start animation
          animateStep();
        };
        
        // Add to animation queue
        animationQueue.current.push(animateForward);
        
        // Start processing animations if not already in progress
        if (!animationInProgress.current) {
          animationInProgress.current = true;
          processNextAnimation();
        }
      },
      
      right: (degrees: number) => {
        // Store the degrees in a variable to ensure it's correctly captured in the closure
        const degreesToRotate = degrees;
        
        // Queue this animation
        const animateRight = () => {
          // Erase the turtle from its previous position
          eraseTurtle();
          
          // Update angle
          angle.current = angle.current + degreesToRotate; // Use assignment instead of += operator
          
          // Redraw turtle at new angle
          drawTurtle();
          
          // Animation complete, process next animation
          processNextAnimation();
        };
        
        // Add to animation queue
        animationQueue.current.push(animateRight);
        
        // Start processing animations if not already in progress
        if (!animationInProgress.current) {
          animationInProgress.current = true;
          processNextAnimation();
        }
      },
      
      left: (degrees: number) => {
        // Store the degrees in a variable to ensure it's correctly captured in the closure
        const degreesToRotate = degrees;
        
        // Queue this animation
        const animateLeft = () => {
          // Erase the turtle from its previous position
          eraseTurtle();
          
          // Update angle
          angle.current = angle.current - degreesToRotate; // Use assignment instead of -= operator
          
          // Redraw turtle at new angle
          drawTurtle();
          
          // Animation complete, process next animation
          processNextAnimation();
        };
        
        // Add to animation queue
        animationQueue.current.push(animateLeft);
        
        // Start processing animations if not already in progress
        if (!animationInProgress.current) {
          animationInProgress.current = true;
          processNextAnimation();
        }
      },
      
      penUp: () => {
        
        // Queue this animation
        const animatePenUp = () => {
          isPenDown.current = false;
          
          // Animation complete, process next animation
          processNextAnimation();
        };
        
        // Add to animation queue
        animationQueue.current.push(animatePenUp);
        
        // Start processing animations if not already in progress
        if (!animationInProgress.current) {
          animationInProgress.current = true;
          processNextAnimation();
        }
      },
      
      penDown: () => {
        // Queue this animation
        const animatePenDown = () => {
          isPenDown.current = true;
          
          // Animation complete, process next animation
          processNextAnimation();
        };
        
        // Add to animation queue
        animationQueue.current.push(animatePenDown);
        
        // Start processing animations if not already in progress
        if (!animationInProgress.current) {
          animationInProgress.current = true;
          processNextAnimation();
        }
      },
      
      setColor: (newColor: string) => {
        // Queue this animation
        const animateSetColor = () => {
          color.current = newColor;
          
          // Animation complete, process next animation
          processNextAnimation();
        };
        
        // Add to animation queue
        animationQueue.current.push(animateSetColor);
        
        // Start processing animations if not already in progress
        if (!animationInProgress.current) {
          animationInProgress.current = true;
          processNextAnimation();
        }
      },
      
      clear: () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Reset turtle position
        position.current = { x: canvas.width / 2, y: canvas.height / 2 };
        angle.current = -90; // Point upwards
        isPenDown.current = true;
        isTurtleVisible.current = true;
        
        // Redraw the turtle
        drawTurtle();
        
        // Clear the animation queue
        animationQueue.current = [];
        animationInProgress.current = false;
      },
      
      setAnimationSpeed: (speed: number) => {
        // Store the animation speed (0-100 scale)
        animationSpeed.current = speed;
      },
      
      hideTurtle: () => {
        if (isTurtleVisible.current) {
          // Queue the hide turtle action
          const animateHideTurtle = () => {
            // Erase the turtle from its current position
            eraseTurtle();
            // Update visibility state
            isTurtleVisible.current = false;
            // Process next animation
            processNextAnimation();
          };
          
          // Add to animation queue
          animationQueue.current.push(animateHideTurtle);
          
          // Start processing the queue if not already in progress
          if (!animationInProgress.current) {
            animationInProgress.current = true;
            processNextAnimation();
          }
        }
      },

      showTurtle: () => {
        if (!isTurtleVisible.current) {
          // Queue the show turtle action
          const animateShowTurtle = () => {
            // Update visibility state
            isTurtleVisible.current = true;
            // Draw the turtle at its current position
            drawTurtle();
            // Process next animation
            processNextAnimation();
          };
          
          // Add to animation queue
          animationQueue.current.push(animateShowTurtle);
          
          // Start processing the queue if not already in progress
          if (!animationInProgress.current) {
            animationInProgress.current = true;
            processNextAnimation();
          }
        }
      },


      setPenSize: (size: number) => {
        console.log(`Setting pen size to ${size}`);
        penSize.current = size;
      },

      home: () => {
        const canvas = canvasRef.current;
        if (canvas) {
          // Erase the turtle at current position
          eraseTurtle();
          
          // Reset heading to upward (preserving the animation for position change)
          angle.current = -90;
          
          // Animate the movement to center
          turtleInterface.setPosition?.(0,0);
        }
      },

      setPosition: (x: number | null, y: number | null) => {
        // Queue this animation
        const animateSetPosition = () => {
          if (!contextRef.current) {
            processNextAnimation();
            return;
          }
          
          const ctx = contextRef.current;
          const canvas = canvasRef.current;
          if (!canvas) return;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          if (x === null) {
            x = position.current.x;
          } else {
            x+= centerX;
          }
          if (y === null) {
            y = position.current.y;
          } else {
            y = centerY - y;
          }

          const startX = position.current.x;
          const startY = position.current.y;
          const endX = x;
          const endY = y;
                    
          // Number of steps based on animation speed
          // More steps = smoother but slower animation
          const steps = Math.max(5, Math.min(Math.abs(endX - startX) + Math.abs(endY - startY), animationSpeed.current * 5));
          let currentStep = 0;
          
          // Function for animation step
          const animateStep = () => {
            if (currentStep >= steps) {
              // Animation complete, process next animation
              processNextAnimation();
              return;
            }
            
            currentStep++;
            
            // Calculate incremental movement
            const progress = currentStep / steps;
            const newX = startX + (endX - startX) * progress;
            const newY = startY + (endY - startY) * progress;
            
            // Erase the turtle from its previous position
            eraseTurtle();
            
            // Draw the line segment if pen is down
            if (isPenDown.current) {
              ctx.beginPath();
              ctx.strokeStyle = color.current;
              ctx.lineWidth = 2;
              // For smooth continuous lines, only draw from the last position to new position
              ctx.moveTo(position.current.x, position.current.y);
              ctx.lineTo(newX, newY);
              ctx.stroke();
            }
            
            // Update position
            position.current = { x: newX, y: newY };
            
            // Redraw turtle at new position
            drawTurtle();
            
            // Schedule next step
            requestAnimationFrame(animateStep);
          };
          
          // Start animation
          animateStep();
        };
        // Add to animation queue
        animationQueue.current.push(animateSetPosition);
        
        // Start processing animations if not already in progress
        if (!animationInProgress.current) {
          animationInProgress.current = true;
          processNextAnimation();
        }
      },
      
      setHeading: (heading: number) => {
        // Erase the turtle from its previous position
        eraseTurtle();
        angle.current = heading - 90;
        
        // Redraw turtle at new angle
        drawTurtle();
        
        // Animation complete, process next animation
        processNextAnimation();
      },
    };
    
    return turtleInterface;
  });

  return (
    <div className="h-100 w-100">
      <canvas 
        ref={canvasRef}
        className="h-100 w-100"
      />
    </div>
  );
});

export default Turtle;
