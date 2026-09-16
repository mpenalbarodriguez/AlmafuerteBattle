/**
 * Almafuerte Battle - 2D Fighting Game
 * Characters: Vareta & Caíto
 * Environment: Dark alley at night
 */

import React, { useState, useEffect } from 'react';
import { CharacterId, CharacterSprites, GameMode } from './types';
import { AIDifficulty } from './engine/ai';
import { 
  createFallbackSprites, 
  loadSpriteSheetDataUrl, 
  sliceSpriteSheet, 
  saveSpriteSheetDataUrl 
} from './engine/spriteManager';
import { CharacterSelect } from './components/CharacterSelect';
import { FightArena } from './components/FightArena';
import { SpriteUploaderModal } from './components/SpriteUploaderModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { FullscreenPrompt } from './components/FullscreenPrompt';

export default function App() {
  const [view, setView] = useState<'select' | 'arena'>('select');
  const [p1Char, setP1Char] = useState<CharacterId>('vareta');
  const [p2Char, setP2Char] = useState<CharacterId>('caito');
  const [gameMode, setGameMode] = useState<GameMode>('vs_cpu');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');

  // Fullscreen gate overlay: shown immediately when page loads
  const [hasDismissedGate, setHasDismissedGate] = useState<boolean>(false);

  // Sprite sheets
  const [varetaSprites, setVaretaSprites] = useState<CharacterSprites>(() => createFallbackSprites('vareta'));
  const [caitoSprites, setCaitoSprites] = useState<CharacterSprites>(() => createFallbackSprites('caito'));

  // Modals
  const [isSpritesModalOpen, setIsSpritesModalOpen] = useState(false);
  const [isControlsModalOpen, setIsControlsModalOpen] = useState(false);

  // Global Drag & Drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Load spritesheets from /sprites/ folder or previously saved in IndexedDB on startup
  useEffect(() => {
    const loadSavedOrStatic = async () => {
      // Helper to try loading an image from public folder
      const tryLoadStatic = (paths: string[]): Promise<HTMLImageElement | null> => {
        return new Promise((resolve) => {
          let currentIdx = 0;
          const tryNext = () => {
            if (currentIdx >= paths.length) {
              resolve(null);
              return;
            }
            const path = paths[currentIdx++];
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => tryNext();
            img.src = path;
          };
          tryNext();
        });
      };

      // 1. Try static Vareta candidates first, otherwise check IndexedDB
      const varetaCandidates = [
        '/sprites/vareta.png',
        '/sprites/sprites_vareta.png',
        '/sprites/Vareta.png',
        '/sprites/vareta.PNG',
        '/vareta.png',
        '/sprites_vareta.png'
      ];
      const staticVareta = await tryLoadStatic(varetaCandidates);
      if (staticVareta) {
        setVaretaSprites(sliceSpriteSheet(staticVareta));
      } else {
        const varetaDataUrl = await loadSpriteSheetDataUrl('vareta');
        if (varetaDataUrl) {
          const img = new Image();
          img.onload = () => {
            setVaretaSprites(sliceSpriteSheet(img));
          };
          img.src = varetaDataUrl;
        }
      }

      // 2. Try static Caíto candidates first, otherwise check IndexedDB
      const caitoCandidates = [
        '/sprites/caito.png',
        '/sprites/sprites_caito.png',
        '/sprites/Caito.png',
        '/sprites/caito.PNG',
        '/caito.png',
        '/sprites_caito.png'
      ];
      const staticCaito = await tryLoadStatic(caitoCandidates);
      if (staticCaito) {
        setCaitoSprites(sliceSpriteSheet(staticCaito));
      } else {
        const caitoDataUrl = await loadSpriteSheetDataUrl('caito');
        if (caitoDataUrl) {
          const img = new Image();
          img.onload = () => {
            setCaitoSprites(sliceSpriteSheet(img));
          };
          img.src = caitoDataUrl;
        }
      }
    };
    loadSavedOrStatic();
  }, []);

  // Global window drop handler for dragging PNG sprite sheets directly into the game
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          const lower = file.name.toLowerCase();
          const targetChar: CharacterId = lower.includes('caito') ? 'caito' : 'vareta';

          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            if (dataUrl) {
              const img = new Image();
              img.onload = async () => {
                const sliced = sliceSpriteSheet(img);
                await saveSpriteSheetDataUrl(targetChar, dataUrl);
                if (targetChar === 'vareta') {
                  setVaretaSprites(sliced);
                } else {
                  setCaitoSprites(sliced);
                }
              };
              img.src = dataUrl;
            }
          };
          reader.readAsDataURL(file);
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleStartMatch = (p1: CharacterId, p2: CharacterId, mode: GameMode, diff: AIDifficulty) => {
    setP1Char(p1);
    setP2Char(p2);
    setGameMode(mode);
    setDifficulty(diff);
    setView('arena');
  };

  const handleResetSprites = async (charId: CharacterId) => {
    await saveSpriteSheetDataUrl(charId, '');
    if (charId === 'vareta') {
      setVaretaSprites(createFallbackSprites('vareta'));
    } else {
      setCaitoSprites(createFallbackSprites('caito'));
    }
  };

  const handleEnterFullscreen = async () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }

      // Try locking orientation to landscape if supported by device/browser
      if (screen.orientation && (screen.orientation as any).lock) {
        try {
          await (screen.orientation as any).lock('landscape');
        } catch {
          // Orientation lock might require PWA or specific permissions, gracefully ignore
        }
      }
    } catch (e) {
      console.warn('Fullscreen request failed or was dismissed:', e);
    } finally {
      setHasDismissedGate(true);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-neutral-950 text-white overflow-hidden select-none font-tech">
      {/* Mandatory Fullscreen Prompt on Load */}
      {!hasDismissedGate && (
        <FullscreenPrompt onEnterFullscreen={handleEnterFullscreen} />
      )}

      {/* Global Drag Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-amber-500/20 border-4 border-dashed border-amber-400 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-neutral-900/90 border border-amber-500/80 p-6 rounded-2xl text-center shadow-2xl">
            <h2 className="text-3xl font-arcade text-amber-400 font-bold mb-1">
              SUELTA AQUÍ TU HOJA DE SPRITES
            </h2>
            <p className="text-xs text-neutral-300">
              Se detectará automáticamente si es Vareta o Caíto y se recortará según las 8 filas.
            </p>
          </div>
        </div>
      )}

      {/* Main View */}
      {view === 'select' ? (
        <CharacterSelect
          onStartMatch={handleStartMatch}
          onOpenSprites={() => setIsSpritesModalOpen(true)}
          onOpenControls={() => setIsControlsModalOpen(true)}
          varetaSprites={varetaSprites}
          caitoSprites={caitoSprites}
        />
      ) : (
        <FightArena
          p1CharId={p1Char}
          p2CharId={p2Char}
          gameMode={gameMode}
          difficulty={difficulty}
          varetaSprites={varetaSprites}
          caitoSprites={caitoSprites}
          onOpenSprites={() => setIsSpritesModalOpen(true)}
          onOpenControls={() => setIsControlsModalOpen(true)}
          onExitToMenu={() => setView('select')}
        />
      )}

      {/* Sprite Sheet Manager Modal */}
      <SpriteUploaderModal
        isOpen={isSpritesModalOpen}
        onClose={() => setIsSpritesModalOpen(false)}
        onSpritesUpdated={(charId, sprites) => {
          if (charId === 'vareta') setVaretaSprites(sprites);
          else setCaitoSprites(sprites);
        }}
        varetaSprites={varetaSprites}
        caitoSprites={caitoSprites}
        onResetSprites={handleResetSprites}
      />

      {/* Controls and Moveset Guide Modal */}
      <ControlsGuideModal
        isOpen={isControlsModalOpen}
        onClose={() => setIsControlsModalOpen(false)}
      />
    </div>
  );
}
