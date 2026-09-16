import React from 'react';
import { KeyControls } from '../types';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, ChevronUp } from 'lucide-react';

interface TouchControlsProps {
  onControlChange: (key: keyof KeyControls, pressed: boolean) => void;
  canSpecial: boolean;
  isPortrait?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ 
  onControlChange, 
  canSpecial,
  isPortrait = false
}) => {
  const bindTouch = (key: keyof KeyControls) => {
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

  if (isPortrait) {
    // PORTRAIT ARCADE CONTROLLER DECK (Underneath the game canvas)
    return (
      <div className="w-full bg-neutral-950 border-t-2 border-neutral-800 p-3 flex flex-col justify-between select-none touch-control-btn shadow-2xl flex-1 max-h-[340px]">
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            CONTROLES VIRTUALES CELULAR
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            {canSpecial ? '¡PODER DISPONIBLE!' : 'CARGANDO PODER...'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 px-2 my-auto">
          {/* Directional Pad */}
          <div className="grid grid-cols-3 gap-2 w-36 h-36 items-center justify-items-center bg-neutral-900/60 p-2 rounded-2xl border border-neutral-800 shadow-inner">
            <div />
            <button
              id="touch-dpad-up"
              {...bindTouch('up')}
              className="w-12 h-12 bg-neutral-800/90 active:bg-amber-500 active:text-black rounded-xl border border-neutral-600 flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
              title="Saltar"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
            <div />

            <button
              id="touch-dpad-left"
              {...bindTouch('left')}
              className="w-12 h-12 bg-neutral-800/90 active:bg-amber-500 active:text-black rounded-xl border border-neutral-600 flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
              title="Atrás / Bloqueo"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              id="touch-dpad-down"
              {...bindTouch('down')}
              className="w-12 h-12 bg-neutral-800/90 active:bg-amber-500 active:text-black rounded-xl border border-neutral-600 flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
              title="Agacharse"
            >
              <ArrowDown className="w-6 h-6" />
            </button>

            <button
              id="touch-dpad-right"
              {...bindTouch('right')}
              className="w-12 h-12 bg-neutral-800/90 active:bg-amber-500 active:text-black rounded-xl border border-neutral-600 flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
              title="Avanzar"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Action Buttons Cluster */}
          <div className="grid grid-cols-2 gap-2.5 items-center">
            {/* Dedicated Jump Button */}
            <button
              id="touch-btn-jump"
              {...bindTouch('up')}
              className="w-14 h-14 rounded-2xl bg-emerald-700/80 active:bg-emerald-500 border-2 border-emerald-400 active:scale-95 text-white font-arcade text-lg font-bold shadow-lg flex flex-col items-center justify-center transition-transform"
            >
              <ChevronUp className="w-5 h-5 -mb-1" />
              <span className="text-[11px] leading-tight">SALTO</span>
            </button>

            {/* Special Blast */}
            <button
              id="touch-btn-special"
              {...bindTouch('special')}
              className={`w-14 h-14 rounded-2xl border-2 active:scale-95 font-arcade text-lg font-bold shadow-lg flex flex-col items-center justify-center transition-transform ${
                canSpecial 
                  ? 'bg-amber-500 border-amber-300 text-black animate-pulse shadow-[0_0_20px_#f59e0b]' 
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-500'
              }`}
            >
              <Zap className="w-5 h-5 -mb-1" />
              <span className="text-[11px] leading-tight">PODER</span>
            </button>

            {/* Punch */}
            <button
              id="touch-btn-punch"
              {...bindTouch('punch')}
              className="w-14 h-14 rounded-2xl bg-blue-600/85 active:bg-blue-400 border-2 border-blue-400 active:scale-95 text-white font-arcade text-lg font-bold shadow-lg flex items-center justify-center transition-transform"
            >
              PIÑA
            </button>

            {/* Kick */}
            <button
              id="touch-btn-kick"
              {...bindTouch('kick')}
              className="w-14 h-14 rounded-2xl bg-red-600/85 active:bg-red-400 border-2 border-red-400 active:scale-95 text-white font-arcade text-lg font-bold shadow-lg flex items-center justify-center transition-transform"
            >
              PATA
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LANDSCAPE OVERLAY CONTROLS (Overlaid on left & right sides)
  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none touch-control-btn flex justify-between items-end p-3 sm:p-5">
      {/* Left: Direction Pad */}
      <div className="grid grid-cols-3 gap-1.5 w-36 pointer-events-auto bg-neutral-950/40 p-2 rounded-2xl backdrop-blur-xs border border-white/10">
        <div />
        <button
          id="touch-landscape-up"
          {...bindTouch('up')}
          className="w-11 h-11 bg-neutral-900/85 border border-neutral-600 active:bg-amber-500 active:text-black rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          id="touch-landscape-left"
          {...bindTouch('left')}
          className="w-11 h-11 bg-neutral-900/85 border border-neutral-600 active:bg-amber-500 active:text-black rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          id="touch-landscape-down"
          {...bindTouch('down')}
          className="w-11 h-11 bg-neutral-900/85 border border-neutral-600 active:bg-amber-500 active:text-black rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        <button
          id="touch-landscape-right"
          {...bindTouch('right')}
          className="w-11 h-11 bg-neutral-900/85 border border-neutral-600 active:bg-amber-500 active:text-black rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2 pointer-events-auto bg-neutral-950/40 p-2 rounded-2xl backdrop-blur-xs border border-white/10">
        {/* Punch */}
        <button
          id="touch-landscape-punch"
          {...bindTouch('punch')}
          className="w-13 h-13 rounded-full bg-blue-600/85 border-2 border-blue-400 active:scale-90 active:bg-blue-400 font-arcade text-lg font-bold text-white shadow-xl flex items-center justify-center backdrop-blur-sm"
        >
          PIÑA
        </button>

        {/* Kick */}
        <button
          id="touch-landscape-kick"
          {...bindTouch('kick')}
          className="w-13 h-13 rounded-full bg-red-600/85 border-2 border-red-400 active:scale-90 active:bg-red-400 font-arcade text-lg font-bold text-white shadow-xl flex items-center justify-center backdrop-blur-sm"
        >
          PATA
        </button>

        {/* Jump Button */}
        <button
          id="touch-landscape-jump"
          {...bindTouch('up')}
          className="w-12 h-12 rounded-full bg-emerald-600/85 border-2 border-emerald-400 active:scale-90 active:bg-emerald-400 font-arcade text-base font-bold text-white shadow-xl flex items-center justify-center backdrop-blur-sm"
        >
          SALTO
        </button>

        {/* Special */}
        <button
          id="touch-landscape-special"
          {...bindTouch('special')}
          className={`w-14 h-14 rounded-full border-2 active:scale-90 font-arcade text-lg font-bold shadow-xl flex flex-col items-center justify-center backdrop-blur-sm ${
            canSpecial 
              ? 'bg-amber-500 border-amber-300 text-black animate-pulse shadow-[0_0_15px_#f59e0b]' 
              : 'bg-neutral-800/80 border-neutral-700 text-neutral-500'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="text-[11px] leading-tight">PODER</span>
        </button>
      </div>
    </div>
  );
};
