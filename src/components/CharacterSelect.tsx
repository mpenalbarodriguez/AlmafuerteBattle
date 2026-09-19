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
  telmoSprites: CharacterSprites;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onStartMatch,
  onOpenSprites,
  onOpenControls,
  varetaSprites,
  caitoSprites,
  telmoSprites
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* VARETA CARD */}
          <div 
            id="card-char-vareta"
            className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
              p1Char === 'vareta'
                ? 'border-amber-400 bg-neutral-900/95 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                : p2Char === 'vareta'
                ? 'border-red-500/80 bg-neutral-900/80'
                : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
            }`}
            onClick={() => {
              sounds.playSelect();
              setP1Char('vareta');
              if (p2Char === 'vareta') setP2Char('caito');
            }}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                    EL TERROR DEL CALLEJÓN
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold font-arcade tracking-wide text-neutral-100">
                    VARETA
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {p1Char === 'vareta' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-arcade tracking-wider bg-amber-500 text-black">
                      1P JUGADOR
                    </span>
                  )}
                  {p2Char === 'vareta' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-arcade tracking-wider bg-red-600 text-white">
                      2P / CPU
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                Indumentaria oscura con gabardina y botella en mano. Golpes pesados a corta distancia y vómito químico tóxico.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Ataque:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`w-2.5 h-1.5 rounded-sm ${s <= 4 ? 'bg-red-500' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Velocidad:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`w-2.5 h-1.5 rounded-sm ${s <= 3 ? 'bg-amber-400' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Poder:</span>
                <span className="text-green-400 font-bold">Vómito Tóxico</span>
              </div>

              {/* Set as Opponent Button */}
              {p1Char !== 'vareta' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playSelect();
                    setP2Char('vareta');
                  }}
                  className={`w-full mt-2 py-1 rounded text-[10px] font-bold font-arcade transition-colors ${
                    p2Char === 'vareta'
                      ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {p2Char === 'vareta' ? '✓ OPONENTE SELECCIONADO' : 'ELEGIR COMO OPONENTE'}
                </button>
              )}
            </div>
          </div>

          {/* CAÍTO CARD */}
          <div 
            id="card-char-caito"
            className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
              p1Char === 'caito'
                ? 'border-emerald-400 bg-neutral-900/95 shadow-[0_0_25px_rgba(52,211,153,0.25)]'
                : p2Char === 'caito'
                ? 'border-red-500/80 bg-neutral-900/80'
                : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
            }`}
            onClick={() => {
              sounds.playSelect();
              setP1Char('caito');
              if (p2Char === 'caito') setP2Char('vareta');
            }}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                    EL GUERRERO DEL ASFALTO
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold font-arcade tracking-wide text-neutral-100">
                    CAÍTO
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {p1Char === 'caito' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-arcade tracking-wider bg-emerald-500 text-black">
                      1P JUGADOR
                    </span>
                  )}
                  {p2Char === 'caito' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-arcade tracking-wider bg-red-600 text-white">
                      2P / CPU
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                Musculoso con remera ZZ verde y ojos amarillos radiantes. Combates ágiles, patadas acrobáticas y cañón de energía solar.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Ataque:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`w-2.5 h-1.5 rounded-sm ${s <= 4 ? 'bg-red-500' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Velocidad:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`w-2.5 h-1.5 rounded-sm ${s <= 4 ? 'bg-amber-400' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Poder:</span>
                <span className="text-yellow-400 font-bold">Destello Dorado</span>
              </div>

              {/* Set as Opponent Button */}
              {p1Char !== 'caito' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playSelect();
                    setP2Char('caito');
                  }}
                  className={`w-full mt-2 py-1 rounded text-[10px] font-bold font-arcade transition-colors ${
                    p2Char === 'caito'
                      ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {p2Char === 'caito' ? '✓ OPONENTE SELECCIONADO' : 'ELEGIR COMO OPONENTE'}
                </button>
              )}
            </div>
          </div>

          {/* DOCTOR TELMO CARD */}
          <div 
            id="card-char-telmo"
            className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
              p1Char === 'telmo'
                ? 'border-sky-400 bg-neutral-900/95 shadow-[0_0_25px_rgba(56,189,248,0.25)]'
                : p2Char === 'telmo'
                ? 'border-red-500/80 bg-neutral-900/80'
                : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
            }`}
            onClick={() => {
              sounds.playSelect();
              setP1Char('telmo');
              if (p2Char === 'telmo') setP2Char('caito');
            }}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">
                    EL MÉDICO COMBATIENTE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold font-arcade tracking-wide text-neutral-100">
                    DR. TELMO
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {p1Char === 'telmo' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-arcade tracking-wider bg-sky-500 text-black">
                      1P JUGADOR
                    </span>
                  )}
                  {p2Char === 'telmo' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-arcade tracking-wider bg-red-600 text-white">
                      2P / CPU
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                Guardapolvo médico y ambo celeste. Golpes quirúrgicos veloces, jeringas de precisión y lanzamiento de blister de píldoras explosivas.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Ataque:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`w-2.5 h-1.5 rounded-sm ${s <= 4 ? 'bg-red-500' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Velocidad:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`w-2.5 h-1.5 rounded-sm ${s <= 4 ? 'bg-amber-400' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Poder:</span>
                <span className="text-sky-400 font-bold">Blíster de Píldoras</span>
              </div>

              {/* Set as Opponent Button */}
              {p1Char !== 'telmo' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playSelect();
                    setP2Char('telmo');
                  }}
                  className={`w-full mt-2 py-1 rounded text-[10px] font-bold font-arcade transition-colors ${
                    p2Char === 'telmo'
                      ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {p2Char === 'telmo' ? '✓ OPONENTE SELECCIONADO' : 'ELEGIR COMO OPONENTE'}
                </button>
              )}
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
