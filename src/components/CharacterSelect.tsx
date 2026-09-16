import React, { useState } from 'react';
import { CharacterId, GameMode, CharacterSprites } from '../types';
import { AIDifficulty } from '../engine/ai';
import { sounds } from '../audio/soundEffects';
import { Swords, User, Bot, Dumbbell, Shield, Zap, Sparkles, Layers } from 'lucide-react';

interface CharacterSelectProps {
  onStartMatch: (p1Id: CharacterId, p2Id: CharacterId, mode: GameMode, difficulty: AIDifficulty) => void;
  onOpenSprites: () => void;
  onOpenControls: () => void;
  varetaSprites: CharacterSprites;
  caitoSprites: CharacterSprites;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onStartMatch,
  onOpenSprites,
  onOpenControls,
  varetaSprites,
  caitoSprites
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('vs_cpu');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');
  const [p1Char, setP1Char] = useState<CharacterId>('vareta');
  const [p2Char, setP2Char] = useState<CharacterId>('caito');

  const handleStart = () => {
    sounds.playSelect();
    sounds.playRoundAnnounce();
    onStartMatch(p1Char, p2Char, selectedMode, difficulty);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 z-10 overflow-y-auto">
      {/* Background Dimmed Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10 brightness-[0.25] saturate-150"
        style={{ backgroundImage: "url('/alley_night_bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/80 -z-10" />

      {/* Header */}
      <div className="text-center pt-2 sm:pt-4">
        <h1 className="text-5xl sm:text-7xl font-bold font-arcade tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
          ALMAFUERTE BATTLE
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 tracking-widest uppercase font-semibold mt-1">
          Combate Callejero 2D • Callejón Nocturno
        </p>
      </div>

      {/* Main Selection Area */}
      <div className="w-full max-w-5xl my-4 space-y-6">
        {/* Game Mode Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <button
            id="mode-vs-cpu-btn"
            onClick={() => { sounds.playSelect(); setSelectedMode('vs_cpu'); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              selectedMode === 'vs_cpu'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105'
                : 'bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" /> 1P vs CPU
          </button>
          <button
            id="mode-vs-p2-btn"
            onClick={() => { sounds.playSelect(); setSelectedMode('vs_p2'); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              selectedMode === 'vs_p2'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105'
                : 'bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> 2P Versus Local
          </button>
          <button
            id="mode-training-btn"
            onClick={() => { sounds.playSelect(); setSelectedMode('training'); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              selectedMode === 'training'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105'
                : 'bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" /> Entrenamiento
          </button>
        </div>

        {/* CPU Difficulty (if vs_cpu) */}
        {selectedMode === 'vs_cpu' && (
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="text-neutral-400 font-bold uppercase tracking-wider">Dificultad CPU:</span>
            {(['facil', 'normal', 'dificil'] as AIDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => { sounds.playSelect(); setDifficulty(d); }}
                className={`px-3 py-1 rounded-lg font-bold uppercase transition-colors ${
                  difficulty === d
                    ? 'bg-neutral-200 text-black'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                {d === 'facil' ? 'Fácil' : d === 'normal' ? 'Normal' : 'Difícil'}
              </button>
            ))}
          </div>
        )}

        {/* Character Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* VARETA CARD */}
          <div 
            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
              p1Char === 'vareta'
                ? 'border-amber-400 bg-neutral-900/90 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
            }`}
            onClick={() => {
              sounds.playSelect();
              setP1Char('vareta');
              if (selectedMode !== 'training') setP2Char('caito');
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  EL TERROR DEL CALLEJÓN
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold font-arcade tracking-wide text-neutral-100">
                  VARETA
                </h2>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-arcade tracking-wider ${
                p1Char === 'vareta' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {p1Char === 'vareta' ? 'JUGADOR 1' : 'ELEGIR'}
              </span>
            </div>

            <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
              Indumentaria oscura con gabardina y botella en mano. Golpes pesados a corta distancia y un letal ataque especial de vómito químico que inunda el asfalto.
            </p>

            {/* Character Stats & Attack Summary */}
            <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Poder de Ataque:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`w-2.5 h-1.5 rounded-sm ${s <= 4 ? 'bg-red-500' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Velocidad de Movimiento:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`w-2.5 h-1.5 rounded-sm ${s <= 3 ? 'bg-amber-400' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Poder Especial:</span>
                <span className="text-green-400 font-bold">Vómito Tóxico</span>
              </div>
            </div>
          </div>

          {/* CAÍTO CARD */}
          <div 
            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
              p1Char === 'caito'
                ? 'border-emerald-400 bg-neutral-900/90 shadow-[0_0_25px_rgba(52,211,153,0.25)]'
                : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
            }`}
            onClick={() => {
              sounds.playSelect();
              setP1Char('caito');
              if (selectedMode !== 'training') setP2Char('vareta');
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  EL GUERRERO DEL ASFALTO
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold font-arcade tracking-wide text-neutral-100">
                  CAÍTO
                </h2>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-arcade tracking-wider ${
                p1Char === 'caito' ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {p1Char === 'caito' ? 'JUGADOR 1' : 'ELEGIR'}
              </span>
            </div>

            <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
              Musculoso con remera ZZ verde, rizos oscuros y ojos amarillos radiantes. Combates ágiles, patadas aéreas acrobáticas y un cañón solar de energía ki.
            </p>

            {/* Character Stats & Attack Summary */}
            <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Poder de Ataque:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`w-2.5 h-1.5 rounded-sm ${s <= 4 ? 'bg-red-500' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Velocidad de Movimiento:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`w-2.5 h-1.5 rounded-sm ${s <= 4 ? 'bg-amber-400' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Poder Especial:</span>
                <span className="text-yellow-400 font-bold">Destello Dorado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="start-fight-btn"
            onClick={handleStart}
            className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold font-arcade text-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-xl shadow-amber-500/30 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Swords className="w-6 h-6" /> ¡ENTRAR AL CALLEJÓN!
          </button>

          <button
            id="menu-open-sprites-btn"
            onClick={onOpenSprites}
            className="px-5 py-3 rounded-xl font-bold text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 flex items-center gap-2 transition-colors"
          >
            <Layers className="w-4 h-4 text-cyan-400" /> Cargar Hojas de Sprites
          </button>

          <button
            id="menu-open-controls-btn"
            onClick={onOpenControls}
            className="px-5 py-3 rounded-xl font-bold text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 flex items-center gap-2 transition-colors"
          >
            Ver Controles
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-2 text-[11px] text-neutral-400">
        Almafuerte Battle • Motor 2D desarrollado a medida con Web Audio API y renderizado Canvas
      </div>
    </div>
  );
};
