import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KeyControls } from '../types';
import { Zap, ChevronUp, Shield, Flame } from 'lucide-react';

interface TouchControlsProps {
  onControlChange: (key: keyof KeyControls, pressed: boolean) => void;
  canSpecial: boolean;
  isPortrait?: boolean;
}

/**
 * High-performance Virtual Joystick (Palanca Arcade)
 * Smoothly tracks multi-touch and converts angle/distance into arcade directions
 */
const VirtualJoystick: React.FC<{
  onDirectionChange: (dir: { left: boolean; right: boolean; up: boolean; down: boolean }) => void;
  size?: number;
}> = ({ onDirectionChange, size = 130 }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState<boolean>(false);
  const touchIdRef = useRef<number | null>(null);
  const activeDirsRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const maxDist = size * 0.32; // Maximum knob displacement from center

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;
    if (dist > maxDist) {
      clampedX = (dx / dist) * maxDist;
      clampedY = (dy / dist) * maxDist;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Directional thresholds
    const threshold = 14;
    const left = clampedX < -threshold;
    const right = clampedX > threshold;
    const up = clampedY < -threshold;
    const down = clampedY > threshold;

    const prev = activeDirsRef.current;
    if (prev.left !== left || prev.right !== right || prev.up !== up || prev.down !== down) {
      activeDirsRef.current = { left, right, up, down };
      onDirectionChange({ left, right, up, down });
    }
  }, [maxDist, onDirectionChange]);

  const resetJoystick = useCallback(() => {
    touchIdRef.current = null;
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    const prev = activeDirsRef.current;
    if (prev.left || prev.right || prev.up || prev.down) {
      activeDirsRef.current = { left: false, right: false, up: false, down: false };
      onDirectionChange({ left: false, right: false, up: false, down: false });
    }
  }, [onDirectionChange]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsActive(true);
    updatePosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        updatePosition(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        resetJoystick();
        break;
      }
    }
  };

  // Mouse fallback for testing on desktop preview
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsActive(true);
    updatePosition(e.clientX, e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      updatePosition(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      resetJoystick();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={baseRef}
      id="virtual-joystick-base"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative rounded-full select-none cursor-pointer flex items-center justify-center transition-shadow ${
        isActive 
          ? 'bg-neutral-900/90 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]' 
          : 'bg-neutral-950/80 border-2 border-neutral-700/80 shadow-inner'
      }`}
    >
      {/* Cardinal Direction Ticks */}
      <span className="absolute top-1 text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-wider">SALTO</span>
      <span className="absolute bottom-1 text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-wider">ABAJO</span>
      <span className="absolute left-1.5 text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-wider">ATRÁS</span>
      <span className="absolute right-1.5 text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-wider">AVANCE</span>

      {/* Guide Crosshairs */}
      <div className="absolute inset-x-4 top-1/2 h-px bg-neutral-800/80 pointer-events-none" />
      <div className="absolute inset-y-4 left-1/2 w-px bg-neutral-800/80 pointer-events-none" />

      {/* Inner Boundary Circle */}
      <div 
        style={{ width: `${size * 0.65}px`, height: `${size * 0.65}px` }}
        className="rounded-full border border-neutral-800 pointer-events-none"
      />

      {/* Analog Stick Knob (Palanca) */}
      <div
        id="virtual-joystick-knob"
        style={{
          width: `${size * 0.44}px`,
          height: `${size * 0.44}px`,
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: isActive ? 'none' : 'transform 0.18s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
        }}
        className={`absolute rounded-full pointer-events-none flex items-center justify-center shadow-2xl ${
          isActive
            ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-amber-200 text-neutral-950 shadow-[0_0_15px_#f59e0b]'
            : 'bg-gradient-to-b from-neutral-600 to-neutral-800 border-2 border-neutral-500 text-neutral-400'
        }`}
      >
        <div className="w-3 h-3 rounded-full bg-white/40 shadow-inner" />
      </div>
    </div>
  );
};

export const TouchControls: React.FC<TouchControlsProps> = ({ 
  onControlChange, 
  canSpecial,
  isPortrait = false
}) => {
  const bindButton = (key: keyof KeyControls) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        onControlChange(key, true);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        onControlChange(key, false);
      },
      onTouchCancel: (e: React.TouchEvent) => {
        e.preventDefault();
        onControlChange(key, false);
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        onControlChange(key, true);
      },
      onMouseUp: (e: React.MouseEvent) => {
        e.preventDefault();
        onControlChange(key, false);
      },
      onMouseLeave: () => {
        onControlChange(key, false);
      },
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault();
      }
    };
  };

  const handleJoystickDirections = useCallback((dirs: { left: boolean; right: boolean; up: boolean; down: boolean }) => {
    onControlChange('left', dirs.left);
    onControlChange('right', dirs.right);
    onControlChange('up', dirs.up);
    onControlChange('down', dirs.down);
  }, [onControlChange]);

  if (isPortrait) {
    // PORTRAIT ARCADE CONTROLLER DECK (Underneath the combat screen)
    return (
      <div 
        id="portrait-arcade-deck"
        className="w-full bg-neutral-950 border-t-2 border-neutral-800 px-3 py-2 flex flex-col justify-between select-none touch-control-btn shadow-2xl flex-1 max-h-[380px]"
      >
        {/* Status Bar */}
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            ARCADE MÓVIL (PALANCA + BOTONES GIGANTES)
          </span>
          <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
            canSpecial ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-neutral-500'
          }`}>
            {canSpecial ? '¡PODER LISTO!' : 'METER CARGANDO...'}
          </span>
        </div>

        {/* Controls Layout: Joystick on left, Extra Large Arcade Buttons on right */}
        <div className="flex items-center justify-between gap-3 px-1 my-auto">
          {/* Left: Virtual Joystick (Palanca) */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <VirtualJoystick onDirectionChange={handleJoystickDirections} size={135} />
            <span className="text-[10px] text-neutral-400 font-mono mt-1 font-bold">PALANCA</span>
          </div>

          {/* Right: Doubled Action Buttons (Piña, Pata, Bloqueo, Salto, Poder) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 items-center shrink-0">
            {/* Piña (Golpe / Punch) - Blue */}
            <button
              id="touch-btn-punch-portrait"
              {...bindButton('punch')}
              className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-2xl bg-blue-600 active:bg-blue-400 border-2 border-blue-400 active:scale-95 text-white font-arcade text-xl font-bold shadow-lg flex flex-col items-center justify-center transition-transform"
              title="Golpe de Puño"
            >
              <Flame className="w-6 h-6 mb-0.5 text-blue-200" />
              <span className="text-xs leading-none font-bold">PIÑA</span>
            </button>

            {/* Pata (Patada / Kick) - Red */}
            <button
              id="touch-btn-kick-portrait"
              {...bindButton('kick')}
              className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-2xl bg-red-600 active:bg-red-400 border-2 border-red-400 active:scale-95 text-white font-arcade text-xl font-bold shadow-lg flex flex-col items-center justify-center transition-transform"
              title="Patada"
            >
              <span className="text-xl font-black mb-0.5">💥</span>
              <span className="text-xs leading-none font-bold">PATA</span>
            </button>

            {/* Bloqueo (Block Guard) - Cyan */}
            <button
              id="touch-btn-block-portrait"
              {...bindButton('block')}
              className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-2xl bg-cyan-700 active:bg-cyan-500 border-2 border-cyan-400 active:scale-95 text-white font-arcade text-xl font-bold shadow-lg flex flex-col items-center justify-center transition-transform"
              title="Bloqueo Defensivo"
            >
              <Shield className="w-6 h-6 mb-0.5 text-cyan-200" />
              <span className="text-xs leading-none font-bold">BLOQUEO</span>
            </button>

            {/* Salto - Emerald */}
            <button
              id="touch-btn-jump-portrait"
              {...bindButton('up')}
              className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-2xl bg-emerald-600 active:bg-emerald-400 border-2 border-emerald-400 active:scale-95 text-white font-arcade text-xl font-bold shadow-lg flex flex-col items-center justify-center transition-transform"
              title="Saltar"
            >
              <ChevronUp className="w-7 h-7 -mb-1 text-emerald-100" />
              <span className="text-xs leading-none font-bold">SALTO</span>
            </button>

            {/* Poder Especial - Amber Gold (Colspan 2 for prominent trigger) */}
            <button
              id="touch-btn-special-portrait"
              {...bindButton('special')}
              className={`col-span-2 h-[74px] sm:h-[86px] rounded-2xl border-2 active:scale-95 font-arcade text-lg font-bold shadow-xl flex items-center justify-center gap-2 transition-transform ${
                canSpecial 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 border-amber-200 text-black animate-pulse shadow-[0_0_20px_#f59e0b]' 
                  : 'bg-neutral-900 border-neutral-700 text-neutral-500'
              }`}
              title="Poder Especial (Gasta 25% Barra)"
            >
              <Zap className={`w-7 h-7 ${canSpecial ? 'text-black' : 'text-neutral-600'}`} />
              <span className="text-base font-bold tracking-wider">PODER ESPECIAL</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LANDSCAPE / FULLSCREEN CONTROLS: Floating Ergonomic Palanca + Doubled Buttons
  return (
    <div 
      id="landscape-touch-overlay"
      className="absolute inset-0 pointer-events-none z-30 select-none touch-control-btn flex justify-between items-end p-3 sm:p-5"
    >
      {/* Left Bottom: Virtual Joystick (Palanca) */}
      <div className="pointer-events-auto bg-neutral-950/70 p-2.5 rounded-3xl backdrop-blur-sm border border-white/15 shadow-2xl flex flex-col items-center">
        <VirtualJoystick onDirectionChange={handleJoystickDirections} size={145} />
        <span className="text-[10px] text-amber-400 font-mono mt-1 font-bold tracking-widest">PALANCA</span>
      </div>

      {/* Right Bottom: Doubled Action Buttons Cluster */}
      <div className="pointer-events-auto bg-neutral-950/70 p-3 rounded-3xl backdrop-blur-sm border border-white/15 shadow-2xl">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Bloqueo Button */}
          <button
            id="touch-landscape-block"
            {...bindButton('block')}
            className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-full bg-cyan-700 active:bg-cyan-500 border-2 border-cyan-400 active:scale-90 font-arcade text-xs font-bold text-white shadow-xl flex flex-col items-center justify-center transition-transform backdrop-blur-xs"
            title="Bloqueo Defensivo"
          >
            <Shield className="w-6 h-6 mb-0.5 text-cyan-200" />
            <span className="font-bold">BLOQUEO</span>
          </button>

          {/* Punch Button (PIÑA) */}
          <button
            id="touch-landscape-punch"
            {...bindButton('punch')}
            className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-full bg-blue-600 active:bg-blue-400 border-2 border-blue-400 active:scale-90 font-arcade text-xs font-bold text-white shadow-xl flex flex-col items-center justify-center transition-transform backdrop-blur-xs"
            title="Golpe"
          >
            <Flame className="w-6 h-6 mb-0.5 text-blue-200" />
            <span className="font-bold">PIÑA</span>
          </button>

          {/* Kick Button (PATADA) */}
          <button
            id="touch-landscape-kick"
            {...bindButton('kick')}
            className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-full bg-red-600 active:bg-red-400 border-2 border-red-400 active:scale-90 font-arcade text-xs font-bold text-white shadow-xl flex flex-col items-center justify-center transition-transform backdrop-blur-xs"
            title="Patada"
          >
            <span className="text-xl leading-none mb-0.5">💥</span>
            <span className="font-bold">PATA</span>
          </button>

          {/* Salto Button */}
          <button
            id="touch-landscape-jump"
            {...bindButton('up')}
            className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-full bg-emerald-600 active:bg-emerald-400 border-2 border-emerald-400 active:scale-90 font-arcade text-xs font-bold text-white shadow-xl flex flex-col items-center justify-center transition-transform backdrop-blur-xs"
            title="Salto"
          >
            <ChevronUp className="w-7 h-7 -mb-1 text-emerald-100" />
            <span className="font-bold">SALTO</span>
          </button>

          {/* Special Blast Button */}
          <button
            id="touch-landscape-special"
            {...bindButton('special')}
            className={`w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-full border-2 active:scale-90 font-arcade text-xs font-bold shadow-2xl flex flex-col items-center justify-center transition-transform backdrop-blur-xs ${
              canSpecial 
                ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-amber-200 text-black animate-pulse shadow-[0_0_20px_#f59e0b]' 
                : 'bg-neutral-900 border-neutral-700 text-neutral-500'
            }`}
            title="Poder Especial"
          >
            <Zap className={`w-7 h-7 ${canSpecial ? 'text-black' : 'text-neutral-600'}`} />
            <span className="font-bold">PODER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
