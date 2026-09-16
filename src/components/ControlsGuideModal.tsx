import React from 'react';
import { X, Shield, Zap, Sparkles, Swords } from 'lucide-react';

interface ControlsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        id="controls-guide-modal"
        className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold font-arcade tracking-wider text-amber-400">
              GUÍA DE COMBATE Y CONTROLES
            </h2>
          </div>
          <button 
            id="close-controls-guide-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 my-4 text-sm">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player 1 */}
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <h3 className="font-arcade text-lg text-amber-400 font-bold mb-3 flex items-center gap-1.5">
                <span>JUGADOR 1</span>
                <span className="text-xs font-mono text-neutral-400 font-normal">(Teclado)</span>
              </h3>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Moverse:</span>
                  <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-white font-bold">A / D</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Saltar:</span>
                  <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-white font-bold">W</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Agacharse:</span>
                  <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-white font-bold">S</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Piña (Golpe):</span>
                  <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-amber-300 font-bold">J ó F</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Patada:</span>
                  <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-amber-300 font-bold">K ó G</span>
                </li>
                <li className="flex justify-between items-center py-1">
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Poder Especial:
                  </span>
                  <span className="font-mono bg-cyan-950 border border-cyan-700 px-2 py-0.5 rounded text-cyan-200 font-bold">L ó H</span>
                </li>
              </ul>
            </div>

            {/* Player 2 */}
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <h3 className="font-arcade text-lg text-emerald-400 font-bold mb-3 flex items-center gap-1.5">
                <span>JUGADOR 2</span>
                <span className="text-xs font-mono text-neutral-400 font-normal">(Modo 2P)</span>
              </h3>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Moverse:</span>
                  <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-white font-bold">← / →</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Saltar:</span>
                  <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-white font-bold">↑</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Agacharse:</span>
                  <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-white font-bold">↓</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Piña (Golpe):</span>
                  <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-emerald-300 font-bold">Num 1 ó U</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Patada:</span>
                  <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-emerald-300 font-bold">Num 2 ó I</span>
                </li>
                <li className="flex justify-between items-center py-1">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Poder Especial:
                  </span>
                  <span className="font-mono bg-amber-950 border border-amber-700 px-2 py-0.5 rounded text-amber-200 font-bold">Num 3 ó O</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Combat Mechanics */}
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
            <h4 className="font-arcade text-base text-neutral-200 font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" /> MECÁNICAS DE JUEGO
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-400">
              <div className="bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-800">
                <strong className="text-white block mb-1">🛡️ Bloqueo</strong>
                Mantén la tecla hacia atrás mientras te atacan para reducir el daño un 80% y evitar el derribo.
              </div>
              <div className="bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-800">
                <strong className="text-white block mb-1">⚡ Barra de Poder</strong>
                Ganas energía al golpear y recibir daño. Cuando supere el 25%, desata el ataque especial.
              </div>
              <div className="bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-800">
                <strong className="text-white block mb-1">💨 Ataques en el Aire</strong>
                Presiona Piña o Patada en el aire para ejecutar los sprites aéreos y castigar al rival al saltar.
              </div>
            </div>
          </div>

          {/* Character Specials Breakdown */}
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
            <h4 className="font-arcade text-base text-neutral-200 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> PODERES ESPECIALES
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-green-950/30 border border-green-900/60">
                <span className="font-bold text-green-400 block mb-0.5">Vareta: "Vómito Tóxico"</span>
                <p className="text-neutral-400 text-[11px]">
                  Vareta se toma la garganta en el primer frame y luego expulsa un feroz chorro de bilis verde corrosiva que inunda el suelo e inflige daño continuo.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-950/30 border border-yellow-900/60">
                <span className="font-bold text-yellow-400 block mb-0.5">Caíto: "Destello Dorado"</span>
                <p className="text-neutral-400 text-[11px]">
                  Caíto acumula su energía dorada y dispara un colosal rayo solar horizontal que arrasa la pantalla con sus ojos brillando incandescentes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          id="got-it-btn"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-bold font-arcade text-base bg-amber-500 hover:bg-amber-400 text-black transition-colors"
        >
          ¡ENTENDIDO! VOLVER A LA PELEA
        </button>
      </div>
    </div>
  );
};
