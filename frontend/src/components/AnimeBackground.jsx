import React, { useEffect, useRef } from 'react';

export default function AnimeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // MVJCE Festival Sparkle and Glow Particles
    const particles = [];
    const colors = [
      '#fbbf24', // Festival Amber Gold
      '#f59e0b', // Deep Amber
      '#ff3366', // Neon Festive Magenta
      '#ec4899', // Hot Pink
      '#06b6d4', // Electric Cyan
      '#a855f7', // Royal Violet
      '#ffffff', // Brilliant Star White
    ];

    for (let i = 0; i < 65; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 1.5 + 0.5, // Rising Ki aura
        speedX: (Math.random() - 0.5) * 0.8,
        alpha: Math.random() * 0.7 + 0.25,
        pulseSpeed: Math.random() * 0.04 + 0.015,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Floating Festive Stars & Sparkles (MVJCE Talent's Day Aura)
    const sparkles = [
      { text: '✦', x: width * 0.06, y: height * 0.2, size: 42, speedY: -0.3, alpha: 0.25, rot: -0.1 },
      { text: '★', x: width * 0.12, y: height * 0.45, size: 36, speedY: -0.4, alpha: 0.28, rot: 0.12 },
      { text: '✧', x: width * 0.08, y: height * 0.75, size: 32, speedY: -0.25, alpha: 0.22, rot: -0.08 },
      { text: '★', x: width * 0.90, y: height * 0.28, size: 40, speedY: -0.35, alpha: 0.3, rot: 0.1 },
      { text: '✦', x: width * 0.84, y: height * 0.62, size: 38, speedY: -0.45, alpha: 0.24, rot: -0.15 },
      { text: '✧', x: width * 0.93, y: height * 0.82, size: 30, speedY: -0.28, alpha: 0.22, rot: 0.05 },
    ];

    let tick = 0;

    // Interactive pointer spark
    let pointer = { x: -100, y: -100, active: false };
    const handleMouseMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space/Aura Ambient Radial Glow
      const centerGrad = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      centerGrad.addColorStop(0, 'rgba(30, 16, 56, 0.45)');
      centerGrad.addColorStop(0.5, 'rgba(18, 10, 36, 0.65)');
      centerGrad.addColorStop(1, 'rgba(11, 7, 20, 0.95)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. EVA-01 NERV Hex / Sync Radar Rings in deep center
      const centerX = width / 2;
      const centerY = height / 2;
      const pulseRadius = 160 + Math.sin(tick * 0.02) * 25;

      // Outer radar circle
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Inner radar circle
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius * 1.25, 0, Math.PI * 2);
      ctx.stroke();

      // Diagonal cross-hairs (EVA Target Lock)
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.06)';
      ctx.beginPath();
      ctx.moveTo(centerX - pulseRadius * 2.2, centerY);
      ctx.lineTo(centerX + pulseRadius * 2.2, centerY);
      ctx.moveTo(centerX, centerY - pulseRadius * 2.2);
      ctx.lineTo(centerX, centerY + pulseRadius * 2.2);
      ctx.stroke();
      ctx.restore();

      // 3. Render Floating Festive Stars & Sparkles (MVJCE Talent's Day Aura)
      ctx.save();
      sparkles.forEach((s) => {
        s.y += s.speedY;
        if (s.y < -90) s.y = height + 60;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot + Math.sin(tick * 0.025) * 0.08);
        ctx.font = `900 ${s.size}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = `rgba(251, 191, 36, ${s.alpha})`;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.7)';
        ctx.shadowBlur = 14;
        ctx.fillText(s.text, 0, 0);
        ctx.restore();
      });
      ctx.restore();

      // 4. Render Rising Ki / Energy Embers (Dragon Ball Z Aura)
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += Math.sin(tick * 0.03 + p.pulseOffset) * 0.7 + p.speedX;

        // Reset particle when it flies above screen
        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }

        const currentAlpha = p.alpha * (0.65 + 0.35 * Math.sin(tick * p.pulseSpeed + p.pulseOffset));

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 5. Interactive Cursor Aura Trail
      if (pointer.active) {
        ctx.save();
        const auraGradient = ctx.createRadialGradient(
          pointer.x, pointer.y, 0,
          pointer.x, pointer.y, 140
        );
        auraGradient.addColorStop(0, 'rgba(251, 191, 36, 0.12)');
        auraGradient.addColorStop(0.4, 'rgba(236, 72, 153, 0.06)');
        auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 140, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.98 }}
    />
  );
}

