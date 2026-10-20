import React, { useRef, useEffect } from 'react';
import FluidSolver from '../engine/fluidSolver';

export default function FluidCanvas({
  stressLevel = 0.2,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  className = ''
}) {
  const canvasRef = useRef(null);
  const solverRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const solver = new FluidSolver(canvas);
    solver.setStressLevel(stressLevel);
    solver.startAnimation();
    solverRef.current = solver;

    const handleResize = () => {
      if (solverRef.current) {
        solverRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (solverRef.current) {
        solverRef.current.stopAnimation();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (solverRef.current) {
      solverRef.current.setStressLevel(stressLevel);
    }
  }, [stressLevel]);

  const handleDown = (e) => {
    if (!canvasRef.current || !solverRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    solverRef.current.addDensity(x, y, 3.0);
    solverRef.current.addVelocity(x, y, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);

    if (onPointerDown) onPointerDown(e, x, y);
  };

  const handleMove = (e) => {
    if (!canvasRef.current || !solverRef.current) return;
    if (e.buttons === 0 && e.pointerType === 'mouse') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    solverRef.current.addDensity(x, y, 1.5);
    solverRef.current.addVelocity(x, y, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);

    if (onPointerMove) onPointerMove(e, x, y);
  };

  const handleUp = (e) => {
    if (onPointerUp) onPointerUp(e);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full touch-none ${className}`}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
    />
  );
}
