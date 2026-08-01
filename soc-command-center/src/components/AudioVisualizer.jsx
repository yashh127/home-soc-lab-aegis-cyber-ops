import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ isActive }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isActive ? '#00f0ff' : '#334155';

      phase += isActive ? 0.2 : 0.05;

      for (let x = 0; x < width; x++) {
        const amplitude = isActive ? Math.sin(x * 0.08 + phase) * 8 + Math.cos(x * 0.04 - phase) * 4 : Math.sin(x * 0.03 + phase) * 2;
        const y = midY + amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isActive]);

  return (
    <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
      <span className="text-[10px] font-mono text-slate-400">VOICE WAVEFORM</span>
      <canvas ref={canvasRef} width={80} height={20} className="rounded" />
    </div>
  );
}
