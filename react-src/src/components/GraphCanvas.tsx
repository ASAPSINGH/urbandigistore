import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface Props {
  expression: string; // e.g. "x^2", "sin(x)", "2*x + 1", "cos(x)", "x^3 - 3*x"
}

export const GraphCanvas: React.FC<Props> = ({ expression }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(20); // pixels per unit
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Evaluate single variable expression safely
  const evaluateFunc = (xVal: number, expr: string): number | null => {
    try {
      let cleaned = expr
        .toLowerCase()
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/ln/g, 'Math.log')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');

      // Insert explicit multiplication for implicit terms like "2x" -> "2*x"
      cleaned = cleaned.replace(/(\d)([a-zMath])/g, '$1*$2');

      const fn = new Function('x', `return ${cleaned};`);
      const res = fn(xVal);
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        return res;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a'; // dark slate
    ctx.fillRect(0, 0, width, height);

    const originX = width / 2 + offsetX;
    const originY = height / 2 + offsetY;

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b';

    const gridStep = zoomLevel;

    // Vertical grid
    for (let x = originX % gridStep; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid
    for (let y = originY % gridStep; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Plot Function Curve
    ctx.strokeStyle = '#38bdf8'; // Sky blue neon
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let isDrawing = false;

    for (let px = 0; px < width; px += 2) {
      const mathX = (px - originX) / zoomLevel;
      const mathY = evaluateFunc(mathX, expression);

      if (mathY !== null) {
        const py = originY - mathY * zoomLevel;

        if (py >= -100 && py <= height + 100) {
          if (!isDrawing) {
            ctx.moveTo(px, py);
            isDrawing = true;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          isDrawing = false;
        }
      } else {
        isDrawing = false;
      }
    }
    ctx.stroke();

    // Draw Cursor Trace Dot
    if (mousePos) {
      const mathX = (mousePos.x - originX) / zoomLevel;
      const mathY = evaluateFunc(mathX, expression);

      if (mathY !== null) {
        const py = originY - mathY * zoomLevel;

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(mousePos.x, py, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.fillText(
          `(${mathX.toFixed(2)}, ${mathY.toFixed(2)})`,
          mousePos.x + 8,
          py - 8
        );
      }
    }
  }, [expression, zoomLevel, offsetX, offsetY, mousePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
      <canvas
        ref={canvasRef}
        width={540}
        height={320}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos(null)}
        className="w-full h-[300px] cursor-crosshair"
      />

      {/* Control Overlay */}
      <div className="absolute top-3 right-3 flex gap-1 bg-slate-800/90 p-1.5 rounded-lg border border-slate-700 shadow-md">
        <button
          onClick={() => setZoomLevel((z) => Math.min(100, z + 5))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(5, z - 5))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoomLevel(20);
            setOffsetX(0);
            setOffsetY(0);
          }}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
          title="Reset View"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-2 left-3 text-[11px] text-slate-400 font-mono">
        Plot: <span className="text-sky-400 font-bold">y = {expression}</span>
      </div>
    </div>
  );
};
