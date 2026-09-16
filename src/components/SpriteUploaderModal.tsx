import React, { useState, useRef } from 'react';
import { CharacterId, CharacterSprites } from '../types';
import { sliceSpriteSheet, saveSpriteSheetDataUrl, createFallbackSprites } from '../engine/spriteManager';
import { Upload, CheckCircle2, AlertCircle, RefreshCw, X, Eye, ShieldAlert } from 'lucide-react';

interface SpriteUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpritesUpdated: (charId: CharacterId, sprites: CharacterSprites) => void;
  varetaSprites: CharacterSprites;
  caitoSprites: CharacterSprites;
  onResetSprites: (charId: CharacterId) => void;
}

export const SpriteUploaderModal: React.FC<SpriteUploaderModalProps> = ({
  isOpen,
  onClose,
  onSpritesUpdated,
  varetaSprites,
  caitoSprites,
  onResetSprites
}) => {
  const [activeTab, setActiveTab] = useState<CharacterId>('vareta');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileInputVaretaRef = useRef<HTMLInputElement>(null);
  const fileInputCaitoRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File, charId: CharacterId) => {
    setProcessing(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        setErrorMsg('Error al leer el archivo de imagen.');
        setProcessing(false);
        return;
      }

      const img = new Image();
      img.onload = async () => {
        try {
          const sliced = sliceSpriteSheet(img);
          await saveSpriteSheetDataUrl(charId, dataUrl);
          onSpritesUpdated(charId, sliced);
          setProcessing(false);
        } catch (err) {
          console.error(err);
          setErrorMsg('Error al procesar las filas del sprite sheet.');
          setProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMsg('La imagen seleccionada no es válida o está dañada.');
        setProcessing(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        const lower = file.name.toLowerCase();
        if (lower.includes('vareta')) {
          handleFileProcess(file, 'vareta');
        } else if (lower.includes('caito')) {
          handleFileProcess(file, 'caito');
        } else {
          // Process for active tab
          handleFileProcess(file, activeTab);
        }
      }
    }
  };

  const currentSprites = activeTab === 'vareta' ? varetaSprites : caitoSprites;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        id="sprite-uploader-modal"
        className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-2xl font-bold font-arcade tracking-wider text-amber-400">
              GESTOR DE HOJAS DE SPRITES
            </h2>
            <p className="text-xs text-neutral-400">
              Carga tus archivos <span className="text-amber-300 font-mono">sprites_vareta.png</span> y <span className="text-amber-300 font-mono">sprites_caito.png</span>
            </p>
          </div>
          <button 
            id="close-uploader-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Tabs */}
        <div className="flex gap-2 my-4">
          <button
            id="tab-vareta-btn"
            onClick={() => setActiveTab('vareta')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm tracking-wide transition-all ${
              activeTab === 'vareta'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            Vareta {varetaSprites.rawImage ? '✓ (Cargado)' : '(Por defecto)'}
          </button>
          <button
            id="tab-caito-btn"
            onClick={() => setActiveTab('caito')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm tracking-wide transition-all ${
              activeTab === 'caito'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            Caíto {caitoSprites.rawImage ? '✓ (Cargado)' : '(Por defecto)'}
          </button>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Drop Zone */}
        <div 
          className="border-2 border-dashed border-neutral-700 hover:border-amber-500/80 bg-neutral-950/50 rounded-xl p-6 text-center transition-colors cursor-pointer group"
          onClick={() => {
            if (activeTab === 'vareta') {
              fileInputVaretaRef.current?.click();
            } else {
              fileInputCaitoRef.current?.click();
            }
          }}
        >
          <input 
            type="file" 
            ref={fileInputVaretaRef} 
            className="hidden" 
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileProcess(e.target.files[0], 'vareta');
            }} 
          />
          <input 
            type="file" 
            ref={fileInputCaitoRef} 
            className="hidden" 
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileProcess(e.target.files[0], 'caito');
            }} 
          />

          <div className="w-12 h-12 rounded-full bg-neutral-800 group-hover:bg-amber-500/20 text-neutral-400 group-hover:text-amber-400 mx-auto flex items-center justify-center mb-3 transition-colors">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-neutral-200 mb-1">
            Arrastra aquí la hoja de sprites de {activeTab === 'vareta' ? 'Vareta' : 'Caíto'}
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mb-3">
            O haz clic para seleccionar tu archivo PNG desde tu equipo. Se recortará automáticamente según las 8 filas especificadas y se removerá el fondo blanco.
          </p>

          <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-800 text-amber-300 border border-neutral-700">
            {processing ? 'Procesando imagen...' : 'Seleccionar archivo PNG'}
          </span>
        </div>

        {/* Status and Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800">
          <div className="flex items-center gap-2">
            {currentSprites.rawImage ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Sprite sheet personalizada activa
              </span>
            ) : (
              <span className="text-xs text-neutral-400">
                Usando sprites vectoriales de respaldo
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {currentSprites.rawImage && (
              <button
                id="reset-sprite-btn"
                onClick={() => onResetSprites(activeTab)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="Volver a los sprites por defecto"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Restaurar por defecto
              </button>
            )}
            <button
              id="view-sliced-btn"
              onClick={() => setPreviewOpen(!previewOpen)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> {previewOpen ? 'Ocultar recortes' : 'Ver recortes'}
            </button>
          </div>
        </div>

        {/* Sliced Sprites Inspector */}
        {previewOpen && (
          <div className="mt-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Vista previa de frames recortados ({activeTab})
            </h4>
            <div className="grid grid-cols-4 gap-3 text-center text-[10px] text-neutral-400">
              <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800 flex flex-col items-center">
                <div className="h-16 flex items-center justify-center">
                  <CanvasPreview canvas={currentSprites.idleRight[0]?.image} />
                </div>
                <span>Reposo 1</span>
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800 flex flex-col items-center">
                <div className="h-16 flex items-center justify-center">
                  <CanvasPreview canvas={currentSprites.punchRight?.image} />
                </div>
                <span>Piña</span>
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800 flex flex-col items-center">
                <div className="h-16 flex items-center justify-center">
                  <CanvasPreview canvas={currentSprites.kickRight?.image} />
                </div>
                <span>Patada</span>
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800 flex flex-col items-center">
                <div className="h-16 flex items-center justify-center">
                  <CanvasPreview canvas={currentSprites.specialBlastRight?.image} />
                </div>
                <span>Poder Especial</span>
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800 flex flex-col items-center">
                <div className="h-16 flex items-center justify-center">
                  <CanvasPreview canvas={currentSprites.crouchRight?.image} />
                </div>
                <span>Agachado</span>
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800 flex flex-col items-center">
                <div className="h-16 flex items-center justify-center">
                  <CanvasPreview canvas={currentSprites.jumpRight?.image} />
                </div>
                <span>Salto</span>
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800 flex flex-col items-center">
                <div className="h-16 flex items-center justify-center">
                  <CanvasPreview canvas={currentSprites.airKickRight?.image} />
                </div>
                <span>Patada Aire</span>
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800 flex flex-col items-center">
                <div className="h-16 flex items-center justify-center">
                  <CanvasPreview canvas={currentSprites.victory?.image} />
                </div>
                <span>Victoria</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 text-[11px] text-neutral-500 leading-relaxed border-t border-neutral-800/80 pt-3">
          💡 Las hojas cargadas se guardan automáticamente en tu navegador (IndexedDB) para que no tengas que volver a subirlas al recargar.
        </div>
      </div>
    </div>
  );
};

const CanvasPreview: React.FC<{ canvas?: HTMLCanvasElement }> = ({ canvas }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && canvas) {
      containerRef.current.innerHTML = '';
      const clone = document.createElement('canvas');
      clone.width = canvas.width;
      clone.height = canvas.height;
      const ctx = clone.getContext('2d');
      ctx?.drawImage(canvas, 0, 0);
      clone.style.maxHeight = '60px';
      clone.style.maxWidth = '100%';
      clone.style.objectFit = 'contain';
      containerRef.current.appendChild(clone);
    }
  }, [canvas]);

  return <div ref={containerRef} className="flex items-center justify-center" />;
};
