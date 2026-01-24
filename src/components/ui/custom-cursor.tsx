import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface CursorPosition {
  x: number;
  y: number;
}

export const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const trailRef = useRef<CursorPosition[]>([]);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Check if device supports hover (not touch-only)
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
      
      // Update trail
      trailRef.current = [
        { x: e.clientX, y: e.clientY },
        ...trailRef.current.slice(0, 4)
      ];
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Detect hoverable elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, textarea, select, [role="button"], .hover-scale');
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousemove', handleElementHover);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousemove', handleElementHover);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cursorX, cursorY]);

  // Hide on touch devices
  if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          animate={{
            scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
          className="relative -translate-x-1/2 -translate-y-1/2"
        >
          {/* Inner dot */}
          <div className="w-3 h-3 bg-primary rounded-full" />
        </motion.div>
      </motion.div>

      {/* Cursor ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          animate={{
            scale: isClicking ? 0.9 : isHovering ? 1.8 : 1,
            opacity: isVisible ? 0.5 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="relative -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-8 h-8 border-2 border-primary rounded-full" />
        </motion.div>
      </motion.div>

      {/* Trail effect */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="fixed top-0 left-0 pointer-events-none z-[9997]"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
          }}
          transition={{ delay: i * 0.03 }}
        >
          <motion.div
            animate={{
              scale: isHovering ? 1 + i * 0.3 : 1,
              opacity: isVisible ? 0.15 / i : 0,
            }}
            transition={{ duration: 0.3 + i * 0.1 }}
            className="relative -translate-x-1/2 -translate-y-1/2"
          >
            <div 
              className="rounded-full bg-primary/30"
              style={{
                width: `${12 + i * 8}px`,
                height: `${12 + i * 8}px`,
              }}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Add global styles to hide default cursor on interactive elements */}
      <style>{`
        @media (hover: hover) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
