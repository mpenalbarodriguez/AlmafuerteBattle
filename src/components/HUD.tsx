import React from 'react';
import { Fighter, MatchPhase } from '../types';
import { 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Layers, 
  RotateCcw, 
  Trophy, 
  Crown, 
  Gamepad2, 
  Maximize2, 
  Minimize2, 
  ArrowLeft,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface HUDProps {
  f1: Fighter;
  f2: Fighter;
  timer: number;
  currentRound: number;
  matchPhase: MatchPhase;
  winner: Fighter | null;
  roundAnnounceText: string | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenControls: () => void;
  onOpenSprites: () => void;
  onRestartMatch: () => void;
  gameMode: string;
  onExitToMenu?: () => void;
  showTouchControls?: boolean;
  onToggleTouchControls?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  f1,
  f2,
  timer,
  currentRound,
  matchPhase,
  winner,
  roundAnnounceText,
  isMuted,
  onToggleMute,
  onOpenControls,
  onOpenSprites,
  onRestartMatch,
  gameMode,
  onExitToMenu,
  showTouchControls,
  onToggleTouchControls,
  isFullscreen,
  onToggleFullscreen,
  zoomLevel = 1.0,
  onZoomIn,
  onZoomOut,
  onResetZoom
}) => {
  const f1HealthPercent = Math.max(0, Math.min(100, (f1.health / f1.maxHealth) * 100));
  const f1DisplayPercent = Math.max(0, Math.min(100, (f1.displayHealth / f1.maxHealth) * 100));

  const f2HealthPercent = Math.max(0, Math.min(100, (f2.health / f2.maxHealth) * 100));
  const f2DisplayPercent = Math.max(0, Math.min(100, (f2.displayHealth / f2.maxHealth) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 z-20 overflow-hidden">
      {/* Top Controls & Navigation Bar */}
      <div className="flex items-center justify-between pointer-events-auto gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onExitToMenu && (
            <button
              id="hud-exit-btn"
              onClick={onExitToMenu}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 transition-colors"
              title="Volver al Menú Principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Menú</span>
            </button>
          )}
          <span className="font-arcade text-xs tracking-wider px-2 py-1 rounded bg-neutral-900/90 border border-neutral-700 text-amber-400">
            ALMAFUERTE
          </span>
          <span className="text-[10px] font-bold text-neutral-400 bg-neutral-900/70 px-1.5 py-0.5 rounded border border-neutral-800 uppercase hidden sm:inline">
            {gameMode === 'vs_cpu' ? '1P vs CPU' : gameMode === 'vs_p2' ? 'Versus 2P' : 'Entrenamiento'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-lg border border-neutral-800 shadow-lg">
          {/* Manual Zoom Controls for Samsung J7 and small screens */}
          {onZoomIn && onZoomOut && (
            <div className="flex items-center bg-neutral-950/80 border border-neutral-700/60 rounded px-1 py-0.5 gap-0.5 mr-0.5">
              <button
                id="hud-zoom-out-btn"
                onClick={onZoomOut}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 active:scale-95 transition-all"
                title="Alejar pantalla / Ajustar Zoom (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                id="hud-zoom-reset-btn"
                onClick={onResetZoom}
                className="px-1 text-[10px] font-mono font-bold text-amber-400 hover:text-white"
                title="Restablecer Zoom al 100%"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                id="hud-zoom-in-btn"
                onClick={onZoomIn}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 active:scale-95 transition-all"
                title="Acercar pantalla / Ajustar Zoom (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {onToggleTouchControls && (
            <button
              id="toggle-touch-btn"
              onClick={onToggleTouchControls}
              className={`p-1.5 rounded transition-colors ${
                showTouchControls ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-neutral-400 hover:text-white'
              }`}
              title="Alternar controles táctiles en pantalla"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>
          )}
          {onToggleFullscreen && (
            <button
              id="toggle-fullscreen-btn"
              onClick={onToggleFullscreen}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          <button
            id="toggle-audio-btn"
            onClick={onToggleMute}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            id="open-controls-btn"
            onClick={onOpenControls}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Ver controles y movimientos"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
          </button>
          <button
            id="open-sprites-btn"
            onClick={onOpenSprites}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1 text-xs px-2"
            title="Subir o gestionar spritesheets"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline text-[11px] font-semibold">Sprites</span>
          </button>
          <button
            id="restart-match-btn"
            onClick={onRestartMatch}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Reiniciar pelea"
          >
            <RotateCcw className="w-4 h-4 text-neutral-300" />
          </button>
        </div>
      </div>

      {/* Health Bars, Super Meters & Timer */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 max-w-5xl mx-auto w-full mt-2">
        {/* PLAYER 1 BAR */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-arcade text-lg tracking-wide">{f1.name}</span>
              <span className="text-[10px] text-neutral-400">P1</span>
            </div>
            {/* Round markers */}
            <div className="flex items-center gap-1">
              {[0, 1].map((r) => (
                <div
                  key={r}
                  className={`w-3 h-3 rounded-full border border-neutral-700 ${
                    f1.roundsWon > r ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-neutral-900'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Health container */}
          <div className="relative h-6 bg-neutral-950 rounded border-2 border-neutral-700 overflow-hidden shadow-inner flex justify-end">
            {/* Delayed damage bar */}
            <div 
              className="absolute right-0 top-0 bottom-0 bg-red-600/80 transition-all duration-300 ease-out"
              style={{ width: `${f1DisplayPercent}%` }}
            />
            {/* Actual health bar */}
            <div 
              className={`absolute right-0 top-0 bottom-0 transition-all duration-100 ${
                f1HealthPercent > 40 
                  ? 'bg-gradient-to-l from-emerald-500 to-green-400' 
                  : f1HealthPercent > 20 
                    ? 'bg-gradient-to-l from-amber-500 to-yellow-400 animate-pulse' 
                    : 'bg-gradient-to-l from-red-600 to-red-500 animate-pulse'
              }`}
              style={{ width: `${f1HealthPercent}%` }}
            />
            <span className="relative z-10 text-[10px] font-mono font-bold text-white px-2 self-center">
              {Math.ceil(f1.health)} HP
            </span>
          </div>

          {/* Super Meter P1 */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 h-3 bg-neutral-950 rounded border border-neutral-800 overflow-hidden flex justify-end">
              <div 
                className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-75"
                style={{ width: `${f1.meter}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold font-mono ${f1.meter >= 25 ? 'text-cyan-400 animate-bounce' : 'text-neutral-500'}`}>
              {f1.meter >= 25 ? '¡PODER!' : `${Math.floor(f1.meter)}%`}
            </span>
          </div>
        </div>

        {/* TIMER & ROUND */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-950 border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center text-center">
            <span className={`font-arcade text-3xl sm:text-4xl font-bold tracking-tight ${timer <= 10 ? 'text-red-500 animate-ping' : 'text-neutral-100'}`}>
              {timer}
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-400/90 tracking-widest mt-1">
            ROUND {currentRound}
          </span>
        </div>

        {/* PLAYER 2 BAR */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            {/* Round markers */}
            <div className="flex items-center gap-1">
              {[0, 1].map((r) => (
                <div
                  key={r}
                  className={`w-3 h-3 rounded-full border border-neutral-700 ${
                    f2.roundsWon > r ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-neutral-900'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400">{f2.isCPU ? 'CPU' : 'P2'}</span>
              <span className="text-emerald-400 font-arcade text-lg tracking-wide">{f2.name}</span>
            </div>
          </div>

          {/* Health container */}
          <div className="relative h-6 bg-neutral-950 rounded border-2 border-neutral-700 overflow-hidden shadow-inner flex justify-start">
            {/* Delayed damage bar */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-red-600/80 transition-all duration-300 ease-out"
              style={{ width: `${f2DisplayPercent}%` }}
            />
            {/* Actual health bar */}
            <div 
              className={`absolute left-0 top-0 bottom-0 transition-all duration-100 ${
                f2HealthPercent > 40 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                  : f2HealthPercent > 20 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 animate-pulse' 
                    : 'bg-gradient-to-r from-red-600 to-red-500 animate-pulse'
              }`}
              style={{ width: `${f2HealthPercent}%` }}
            />
            <span className="relative z-10 text-[10px] font-mono font-bold text-white px-2 self-center">
              {Math.ceil(f2.health)} HP
            </span>
          </div>

          {/* Super Meter P2 */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold font-mono ${f2.meter >= 25 ? 'text-amber-400 animate-bounce' : 'text-neutral-500'}`}>
              {f2.meter >= 25 ? '¡PODER!' : `${Math.floor(f2.meter)}%`}
            </span>
            <div className="relative flex-1 h-3 bg-neutral-950 rounded border border-neutral-800 overflow-hidden flex justify-start">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 transition-all duration-75"
                style={{ width: `${f2.meter}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT TOP VICTORY BANNERS: High up so they DO NOT block the winner's pose in the center */}
      {matchPhase === 'round_end' && winner && (
        <div className="absolute top-[76px] sm:top-[86px] left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2 bg-neutral-950/90 border border-amber-500/80 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] backdrop-blur-md">
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-400 font-bold">ROUND {currentRound}:</span>
            <span className="text-base sm:text-xl font-bold font-arcade tracking-wide text-white">¡GANA {winner.name.toUpperCase()}!</span>
          </div>
        </div>
      )}

      {matchPhase === 'match_end' && winner && (
        <div className="absolute top-[74px] sm:top-[84px] left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-300 w-[94%] max-w-sm">
          <div className="flex items-center justify-between gap-3 bg-neutral-950/95 border-2 border-amber-400 px-3.5 py-1.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0">
              <Crown className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold block leading-none">
                  CAMPEÓN DEL CALLEJÓN
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-arcade text-white truncate tracking-wide leading-tight">
                  ¡{winner.name.toUpperCase()} VICTORIOSO!
                </h2>
              </div>
            </div>
            <button
              id="rematch-btn"
              onClick={onRestartMatch}
              className="shrink-0 px-3 py-1 rounded-lg font-bold font-arcade text-base bg-amber-500 hover:bg-amber-400 active:scale-95 text-black shadow-md shadow-amber-500/30 transition-transform"
            >
              REVANCHA
            </button>
          </div>
        </div>
      )}

      {/* Center Announcements (Round start, Fight, KO only - cleared during victory pose!) */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-none">
        {roundAnnounceText && (
          <div className="text-center animate-in zoom-in-50 duration-300">
            <h1 className="text-6xl sm:text-7xl font-bold font-arcade tracking-wider text-amber-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] stroke-black">
              {roundAnnounceText}
            </h1>
          </div>
        )}

        {matchPhase === 'ko' && (
          <div className="text-center animate-bounce">
            <h1 className="text-7xl sm:text-8xl font-bold font-arcade tracking-wider text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.8)]">
              ¡K.O.!
            </h1>
          </div>
        )}
      </div>

      {/* Bottom status & combo banners */}
      <div className="flex justify-between items-end mb-2">
        {/* P1 Combo indicator */}
        <div className="min-w-[120px]">
          {f1.comboCount > 1 && (
            <div className="animate-pulse bg-red-950/80 border border-red-500/60 px-3 py-1.5 rounded-lg text-left">
              <span className="font-arcade text-xl text-amber-400 font-bold">{f1.comboCount} GOLPES</span>
              <p className="text-[10px] text-red-300 font-mono">¡COMBO CONTINUO!</p>
            </div>
          )}
        </div>

        {/* P2 Combo indicator */}
        <div className="min-w-[120px] text-right">
          {f2.comboCount > 1 && (
            <div className="animate-pulse bg-amber-950/80 border border-amber-500/60 px-3 py-1.5 rounded-lg text-right">
              <span className="font-arcade text-xl text-emerald-400 font-bold">{f2.comboCount} GOLPES</span>
              <p className="text-[10px] text-amber-300 font-mono">¡COMBO CONTINUO!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
