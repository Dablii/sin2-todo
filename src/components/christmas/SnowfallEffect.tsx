'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Snowflake } from 'lucide-react';

interface SnowflakeParticle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
}

export function SnowfallEffect() {
  const [enabled, setEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('taskflow-snowfall-enabled');
    if (saved !== null) {
      setEnabled(saved === 'true');
    }
  }, []);

  const toggleSnowfall = () => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('taskflow-snowfall-enabled', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const flakeCount = Math.min(Math.floor(width / 25), 60);
    const flakes: SnowflakeParticle[] = Array.from({ length: flakeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      speed: Math.random() * 0.9 + 0.4,
      wind: Math.random() * 0.6 - 0.3,
      opacity: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#D3D9D4';
      for (const flake of flakes) {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(211, 217, 212, ${flake.opacity})`;
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.wind;

        if (flake.y > height) {
          flake.y = -5;
          flake.x = Math.random() * width;
        }
        if (flake.x > width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = width;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);

  return (
    <>
      {enabled && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 z-20 h-full w-full opacity-60"
        />
      )}
      <button
        onClick={toggleSnowfall}
        title={enabled ? 'Vypnout sněžení' : 'Zapnout sněžení'}
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold shadow-lg transition-all ${
          enabled
            ? 'bg-[#124E66] text-[#D3D9D4] border border-[#748D92]/40 hover:bg-[#124E66]/80'
            : 'bg-[#2E3944] text-[#748D92] border border-[#2E3944] hover:text-[#D3D9D4]'
        }`}
      >
        <Snowflake className={`w-4 h-4 ${enabled ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
        <span>{enabled ? 'Sněžení zapnuto' : 'Sněžení vypnuto'}</span>
      </button>
    </>
  );
}
