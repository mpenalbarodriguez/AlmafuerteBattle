import React from 'react';
import { Maximize2, Smartphone, Volume2, ShieldAlert } from 'lucide-react';

interface FullscreenPromptProps {
  onEnterFullscreen: () => void;
}

export const FullscreenPrompt: React.FC<FullscreenPromptProps> = ({ onEnterFullscreen }) => {
  return (
    <div 
      id="fullscreen-gate-modal"
      className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none"
    >
      <div className="max-w-md w-full bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center flex flex-col items-center">
        {/* Animated Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20 animate-pulse">
          <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 rotate-90 transform" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 mb-2">
          MODO ARCADE EN CELULAR
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold font-arcade tracking-wider text-white mb-2">
          ALMAFUERTE BATTLE
        </h1>

        <p className="text-sm sm:text-base text-neutral-300 mb-6 leading-relaxed">
          Para jugar con la máxima resolución, controles táctiles y sin barras del navegador, ingresa en <strong className="text-amber-400">Pantalla Completa Horizontal</strong>.
        </p>

        {/* Action Button */}
        <button
          id="enter-fullscreen-action-btn"
          onClick={onEnterFullscreen}
          className="w-full py-4 px-6 rounded-2xl font-arcade text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-3 transition-transform cursor-pointer"
        >
          <Maximize2 className="w-6 h-6 stroke-[2.5]" />
          <span>ACTIVAR PANTALLA COMPLETA</span>
        </button>

        <div className="mt-5 flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-amber-500/70" /> Audio activado
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-amber-500/70" /> Giro automático
          </span>
        </div>
      </div>
    </div>
  );
};
