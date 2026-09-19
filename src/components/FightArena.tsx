import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Fighter, 
  CharacterId, 
  CharacterSprites, 
  GameMode, 
  MatchPhase, 
  KeyControls, 
  Projectile, 
  ParticleEffect, 
  FloatingText,
  SlicedSprite
} from '../types';
import { 
  ARENA_WIDTH, 
  ARENA_HEIGHT, 
  GROUND_Y, 
  createFighter, 
  updateFighter, 
  getFighterHitbox, 
  getFighterHurtbox, 
  checkAABB, 
  applyHit, 
  updateProjectiles, 
  updateParticles, 
  updateFloatingTexts 
} from '../engine/combatEngine';
import { AIController, AIDifficulty } from '../engine/ai';
import { sounds } from '../audio/soundEffects';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';

interface FightArenaProps {
  p1CharId: CharacterId;
  p2CharId: CharacterId;
  gameMode: GameMode;
  difficulty: AIDifficulty;
  varetaSprites: CharacterSprites;
  caitoSprites: CharacterSprites;
  telmoSprites: CharacterSprites;
  onOpenSprites: () => void;
  onOpenControls: () => void;
  onExitToMenu: () => void;
}

export const FightArena: React.FC<FightArenaProps> = ({
  p1CharId,
  p2CharId,
  gameMode,
  difficulty,
  varetaSprites,
  caitoSprites,
  telmoSprites,
  onOpenSprites,
  onOpenControls,
  onExitToMenu
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background Image
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // Game state
  const [f1, setF1] = useState<Fighter>(() => createFighter(p1CharId, true, false));
  const [f2, setF2] = useState<Fighter>(() => createFighter(p2CharId, false, gameMode === 'vs_cpu'));
  const [timer, setTimer] = useState<number>(99);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [matchPhase, setMatchPhase] = useState<MatchPhase>('intro');
  const [winner, setWinner] = useState<Fighter | null>(null);
  const [roundAnnounceText, setRoundAnnounceText] = useState<string | null>('ROUND 1');
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());

  // Mobile / Viewport detection
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerHeight > window.innerWidth && window.innerWidth < 800;
  });
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('almafuerte_zoom');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });

  const handleZoomIn = () => {
    setZoomLevel(prev => {
      const next = Math.min(1.30, Math.round((prev + 0.05) * 100) / 100);
      try { localStorage.setItem('almafuerte_zoom', next.toString()); } catch {}
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(0.65, Math.round((prev - 0.05) * 100) / 100);
      try { localStorage.setItem('almafuerte_zoom', next.toString()); } catch {}
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    try { localStorage.setItem('almafuerte_zoom', '1.0'); } catch {}
  };

  useEffect(() => {
    const checkOrientation = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 800;
      setIsPortrait(portrait);
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    document.addEventListener('fullscreenchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      document.removeEventListener('fullscreenchange', checkOrientation);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch {
            // Optional orientation lock
          }
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch {
      // Ignore if fullscreen is rejected by browser policy
    }
  };

  // Screen shake
  const screenShakeRef = useRef<number>(0);

  // AI controller
  const aiRef = useRef<AIController>(new AIController());

  // Input states
  const p1ControlsRef = useRef<KeyControls>({
    left: false, right: false, up: false, down: false, block: false, punch: false, kick: false, special: false
  });
  const p2ControlsRef = useRef<KeyControls>({
    left: false, right: false, up: false, down: false, block: false, punch: false, kick: false, special: false
  });

  // Combat entities
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<ParticleEffect[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = '/alley_night_bg.jpg';
    img.onload = () => {
      bgImageRef.current = img;
    };
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      // P1 Controls: WASD + J/K/L/B or F/G/H/Space
      if (code === 'KeyA') p1ControlsRef.current.left = true;
      if (code === 'KeyD') p1ControlsRef.current.right = true;
      if (code === 'KeyW') p1ControlsRef.current.up = true;
      if (code === 'KeyS') p1ControlsRef.current.down = true;
      if (code === 'KeyB' || code === 'Space') p1ControlsRef.current.block = true;
      if (code === 'KeyJ' || code === 'KeyF') p1ControlsRef.current.punch = true;
      if (code === 'KeyK' || code === 'KeyG') p1ControlsRef.current.kick = true;
      if (code === 'KeyL' || code === 'KeyH') p1ControlsRef.current.special = true;

      // In single player modes, Arrow keys also control P1 movement
      if (gameMode !== 'vs_player') {
        if (code === 'ArrowLeft') p1ControlsRef.current.left = true;
        if (code === 'ArrowRight') p1ControlsRef.current.right = true;
        if (code === 'ArrowUp') p1ControlsRef.current.up = true;
        if (code === 'ArrowDown') p1ControlsRef.current.down = true;
      } else {
        // P2 Controls (2-player local mode)
        if (code === 'ArrowLeft') p2ControlsRef.current.left = true;
        if (code === 'ArrowRight') p2ControlsRef.current.right = true;
        if (code === 'ArrowUp') p2ControlsRef.current.up = true;
        if (code === 'ArrowDown') p2ControlsRef.current.down = true;
      }

      if (code === 'Numpad0' || code === 'KeyY') p2ControlsRef.current.block = true;
      if (code === 'Numpad1' || code === 'KeyU') p2ControlsRef.current.punch = true;
      if (code === 'Numpad2' || code === 'KeyI') p2ControlsRef.current.kick = true;
      if (code === 'Numpad3' || code === 'KeyO') p2ControlsRef.current.special = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyA') p1ControlsRef.current.left = false;
      if (code === 'KeyD') p1ControlsRef.current.right = false;
      if (code === 'KeyW') p1ControlsRef.current.up = false;
      if (code === 'KeyS') p1ControlsRef.current.down = false;
      if (code === 'KeyB' || code === 'Space') p1ControlsRef.current.block = false;
      if (code === 'KeyJ' || code === 'KeyF') p1ControlsRef.current.punch = false;
      if (code === 'KeyK' || code === 'KeyG') p1ControlsRef.current.kick = false;
      if (code === 'KeyL' || code === 'KeyH') p1ControlsRef.current.special = false;

      if (gameMode !== 'vs_player') {
        if (code === 'ArrowLeft') p1ControlsRef.current.left = false;
        if (code === 'ArrowRight') p1ControlsRef.current.right = false;
        if (code === 'ArrowUp') p1ControlsRef.current.up = false;
        if (code === 'ArrowDown') p1ControlsRef.current.down = false;
      } else {
        if (code === 'ArrowLeft') p2ControlsRef.current.left = false;
        if (code === 'ArrowRight') p2ControlsRef.current.right = false;
        if (code === 'ArrowUp') p2ControlsRef.current.up = false;
        if (code === 'ArrowDown') p2ControlsRef.current.down = false;
      }

      if (code === 'Numpad0' || code === 'KeyY') p2ControlsRef.current.block = false;
      if (code === 'Numpad1' || code === 'KeyU') p2ControlsRef.current.punch = false;
      if (code === 'Numpad2' || code === 'KeyI') p2ControlsRef.current.kick = false;
      if (code === 'Numpad3' || code === 'KeyO') p2ControlsRef.current.special = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Match Intro Sequence
  useEffect(() => {
    setRoundAnnounceText(`ROUND ${currentRound}`);
    sounds.playRoundAnnounce();

    const fightTimer = setTimeout(() => {
      setRoundAnnounceText('¡A PELEAR!');
      sounds.playRoundAnnounce();
      const startTimer = setTimeout(() => {
        setRoundAnnounceText(null);
        setMatchPhase('fighting');
      }, 900);
      return () => clearTimeout(startTimer);
    }, 1200);

    return () => clearTimeout(fightTimer);
  }, [currentRound]);

  // Restart match handler
  const handleRestartMatch = useCallback(() => {
    setF1(createFighter(p1CharId, true, false));
    setF2(createFighter(p2CharId, false, gameMode === 'vs_cpu'));
    setCurrentRound(1);
    setTimer(99);
    setWinner(null);
    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    setMatchPhase('intro');
  }, [p1CharId, p2CharId, gameMode]);

  // Helper to pick the correct sprite from the 12 rows
  const getFighterSprite = (fighter: Fighter): SlicedSprite => {
    const sprites = fighter.id === 'vareta' ? varetaSprites : fighter.id === 'caito' ? caitoSprites : telmoSprites;
    const f = fighter.facing;

    // Row 11: Defeated state (stays on the floor)
    if (fighter.state === 'knockdown' || fighter.health <= 0) {
      return sprites.defeated;
    }

    // Row 1: Victory
    if (fighter.state === 'victory') {
      return sprites.victory;
    }

    // Row 9: Blocking position
    if (fighter.state === 'block') {
      return f === 1 ? sprites.blockRight : sprites.blockLeft;
    }

    // Row 10: Damage / Hit reaction
    if (fighter.state === 'hit') {
      return f === 1 ? sprites.hurtRight : sprites.hurtLeft;
    }

    if (fighter.state === 'crouch') {
      return f === 1 ? sprites.crouchRight : sprites.crouchLeft;
    }

    if (fighter.state === 'jump') {
      return f === 1 ? sprites.jumpRight : sprites.jumpLeft;
    }

    if (fighter.state === 'walk_fwd' || fighter.state === 'walk_back') {
      const walkList = f === 1 ? sprites.walkRight : sprites.walkLeft;
      const stepIdx = Math.floor(fighter.stateTimer / 10) % 2;
      return walkList[stepIdx] || walkList[0] || sprites.idleRight[0];
    }

    if (fighter.state === 'punch') {
      return f === 1 ? sprites.punchRight : sprites.punchLeft;
    }

    if (fighter.state === 'kick') {
      return f === 1 ? sprites.kickRight : sprites.kickLeft;
    }

    if (fighter.state === 'air_punch') {
      return f === 1 ? sprites.airPunchRight : sprites.airPunchLeft;
    }

    if (fighter.state === 'air_kick') {
      return f === 1 ? sprites.airKickRight : sprites.airKickLeft;
    }

    if (fighter.state === 'special_prep') {
      return f === 1 ? sprites.specialPrepRight : sprites.specialPrepLeft;
    }

    if (fighter.state === 'special_blast') {
      return f === 1 ? sprites.specialBlastRight : sprites.specialBlastLeft;
    }

    // Default Idle
    const idleList = f === 1 ? sprites.idleRight : sprites.idleLeft;
    const idleIdx = Math.floor(fighter.stateTimer / 25) % 2;
    return idleList[idleIdx] || idleList[0] || sprites.idleRight[0];
  };

  // Main Canvas Game Loop
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    let secondAccumulator = 0;

    const gameLoop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Timer decrement (only when fighting)
      if (matchPhase === 'fighting') {
        secondAccumulator += dt;
        if (secondAccumulator >= 1) {
          secondAccumulator -= 1;
          setTimer((prev) => {
            if (prev <= 1) {
              // Time Out!
              handleRoundOver('timeout');
              return 0;
            }
            return prev - 1;
          });
        }
      }

      // 2. Update Fighters & AI
      const isFighting = matchPhase === 'fighting';

      // CPU AI inputs
      if (f2.isCPU && isFighting) {
        p2ControlsRef.current = aiRef.current.getControls(f2, f1, difficulty);
      }

      // In training mode, replenish health/meter
      if (gameMode === 'training') {
        if (f1.health < 40) f1.health = 100;
        if (f2.health < 40) f2.health = 100;
        f1.meter = 100;
      }

      // Update Fighters
      updateFighter(f1, f2, p1ControlsRef.current, projectilesRef.current, particlesRef.current, floatingTextsRef.current, isFighting);
      updateFighter(f2, f1, p2ControlsRef.current, projectilesRef.current, particlesRef.current, floatingTextsRef.current, isFighting);

      // 3. Check Hitbox Collisions
      if (isFighting) {
        // P1 attacking P2
        const h1 = getFighterHitbox(f1);
        if (h1) {
          const hurt2 = getFighterHurtbox(f2);
          if (checkAABB(h1, hurt2)) {
            const result = applyHit(f1, f2, h1, particlesRef.current, floatingTextsRef.current);
            if (result.hit || result.blocked) {
              screenShakeRef.current = result.blocked ? 3 : 8;
            }
            // Check KO
            if (f2.health <= 0) {
              handleRoundOver('f1_wins');
            }
          }
        }

        // P2 attacking P1
        const h2 = getFighterHitbox(f2);
        if (h2) {
          const hurt1 = getFighterHurtbox(f1);
          if (checkAABB(h2, hurt1)) {
            const result = applyHit(f2, f1, h2, particlesRef.current, floatingTextsRef.current);
            if (result.hit || result.blocked) {
              screenShakeRef.current = result.blocked ? 3 : 8;
            }
            // Check KO
            if (f1.health <= 0) {
              handleRoundOver('f2_wins');
            }
          }
        }
      }

      // 4. Update Projectiles & Particles
      updateProjectiles(projectilesRef.current, f1, f2, particlesRef.current, floatingTextsRef.current);
      updateParticles(particlesRef.current);
      updateFloatingTexts(floatingTextsRef.current);

      // 5. RENDER CANVAS
      ctx.save();
      ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      // Screen shake translation
      if (screenShakeRef.current > 0) {
        const sx = (Math.random() - 0.5) * screenShakeRef.current * 2;
        const sy = (Math.random() - 0.5) * screenShakeRef.current * 2;
        ctx.translate(sx, sy);
        screenShakeRef.current *= 0.82;
        if (screenShakeRef.current < 0.2) screenShakeRef.current = 0;
      }

      // Background alley
      if (bgImageRef.current && bgImageRef.current.complete) {
        ctx.drawImage(bgImageRef.current, 0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      } else {
        // Fallback night alley gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
        bgGrad.addColorStop(0, '#0a0d14');
        bgGrad.addColorStop(0.65, '#161922');
        bgGrad.addColorStop(0.85, '#1e232d');
        bgGrad.addColorStop(1, '#111317');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      }

      // Ambient night alley lighting: Street lamp cone glow
      const lampGrad = ctx.createRadialGradient(500, 80, 20, 500, 360, 380);
      lampGrad.addColorStop(0, 'rgba(253, 224, 71, 0.16)');
      lampGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.05)');
      lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lampGrad;
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      // Ground Line & Wet Pavement Reflection
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, GROUND_Y, ARENA_WIDTH, ARENA_HEIGHT - GROUND_Y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(ARENA_WIDTH, GROUND_Y);
      ctx.stroke();

      // Draw Shadows under fighters
      [f1, f2].forEach((fighter) => {
        const heightOffGround = Math.max(0, GROUND_Y - fighter.y);
        const shadowScale = Math.max(0.3, 1 - heightOffGround / 220);
        const shadowAlpha = Math.max(0.15, 0.5 - heightOffGround / 400);

        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(fighter.x, GROUND_Y + 4, 38 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Projectiles
      projectilesRef.current.forEach((p) => {
        ctx.save();
        const pSprites = p.ownerId === 'vareta' ? varetaSprites : p.ownerId === 'caito' ? caitoSprites : telmoSprites;
        const projSprite = pSprites.projectileSprite;

        if (projSprite && projSprite.width > 5) {
          // Render Row 12 special power sprite moving horizontally
          const pAspect = projSprite.width / (projSprite.height || 1);
          const pHeight = Math.max(50, p.height * 1.6);
          const pWidth = pHeight * pAspect;
          const drawX = p.facing === 1 ? p.x : p.x - pWidth;
          const drawY = p.y + (p.height - pHeight) / 2;

          if (p.facing === -1) {
            ctx.translate(drawX + pWidth, drawY);
            ctx.scale(-1, 1);
            ctx.drawImage(projSprite.image, 0, 0, pWidth, pHeight);
          } else {
            ctx.drawImage(projSprite.image, drawX, drawY, pWidth, pHeight);
          }
        } else if (p.type === 'vomit') {
          // Vareta's Corrosive Bile Wave
          const grad = ctx.createLinearGradient(p.x, p.y, p.x + (p.facing === 1 ? p.width : -p.width), p.y);
          grad.addColorStop(0, 'rgba(34, 197, 94, 0.9)');
          grad.addColorStop(0.6, 'rgba(132, 204, 22, 0.85)');
          grad.addColorStop(1, 'rgba(163, 230, 53, 0.2)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(p.x + (p.facing === 1 ? p.width / 2 : -p.width / 2), p.y + p.height / 2, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'pills') {
          // Doctor Telmo's Blister Pack of Medical Capsules
          const bx = p.facing === 1 ? p.x : p.x - p.width;
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(bx, p.y, p.width, p.height, 6);
          } else {
            ctx.rect(bx, p.y, p.width, p.height);
          }
          ctx.fill();
          ctx.stroke();

          // Draw medical cross in center
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(bx + p.width / 2 - 2, p.y + 4, 4, p.height - 8);
          ctx.fillRect(bx + 4, p.y + p.height / 2 - 2, p.width - 8, 4);

          // Glowing aura
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 4;
          ctx.stroke();
        } else {
          // Caíto's Golden Ki Beam
          const grad = ctx.createLinearGradient(p.x, p.y, p.x + (p.facing === 1 ? p.width : -p.width), p.y);
          grad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
          grad.addColorStop(0.4, 'rgba(234, 179, 8, 0.9)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0.2)');
          ctx.fillStyle = grad;
          ctx.fillRect(p.facing === 1 ? p.x : p.x - p.width, p.y, p.width, p.height);

          // Beam core
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(p.facing === 1 ? p.x + 10 : p.x - p.width + 10, p.y + p.height * 0.25, p.width - 20, p.height * 0.5);
        }
        ctx.restore();
      });

      // Draw Fighters
      [f1, f2].forEach((fighter) => {
        ctx.save();
        const sprite = getFighterSprite(fighter);

        // Flash white on hit
        if (fighter.hitStun > 0 && Math.floor(fighter.hitStun / 3) % 2 === 0) {
          ctx.filter = 'brightness(2.2) contrast(1.5)';
        }

        // Target display size for character: ~165px tall
        const isDefeated = fighter.state === 'knockdown' || fighter.health <= 0;
        const targetHeight = fighter.state === 'crouch' ? 120 : isDefeated ? 90 : 165;
        const aspect = sprite.width / (sprite.height || 1);
        const targetWidth = targetHeight * aspect;

        const drawX = fighter.x - targetWidth / 2;
        const drawY = isDefeated ? fighter.y - targetHeight + 12 : fighter.y - targetHeight;

        ctx.drawImage(sprite.image, drawX, drawY, targetWidth, targetHeight);
        ctx.restore();
      });

      // Draw Particles
      particlesRef.current.forEach((pt) => {
        ctx.save();
        ctx.fillStyle = pt.color;
        const alpha = 1 - pt.life / pt.maxLife;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Floating Combat Texts
      floatingTextsRef.current.forEach((txt) => {
        ctx.save();
        const alpha = 1 - txt.life / txt.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = txt.color;
        ctx.font = `bold ${txt.size}px 'Teko', sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(txt.text, txt.x, txt.y);
        ctx.restore();
      });

      ctx.restore();
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [matchPhase, f1, f2, difficulty, gameMode, varetaSprites, caitoSprites, telmoSprites]);

  // Handle Round/Match Over
  const handleRoundOver = (reason: 'f1_wins' | 'f2_wins' | 'timeout') => {
    sounds.playKO();
    setMatchPhase('ko');

    let roundWinner: Fighter;
    let roundLoser: Fighter;
    if (reason === 'f1_wins') {
      roundWinner = f1;
      roundLoser = f2;
    } else if (reason === 'f2_wins') {
      roundWinner = f2;
      roundLoser = f1;
    } else {
      roundWinner = f1.health >= f2.health ? f1 : f2;
      roundLoser = roundWinner === f1 ? f2 : f1;
    }

    // Loser falls defeated to ground (Row 11 sprite) and stays there
    roundLoser.state = 'knockdown';
    roundLoser.health = 0;

    setTimeout(() => {
      roundWinner.roundsWon++;
      setWinner(roundWinner);
      roundWinner.state = 'victory';
      roundLoser.state = 'knockdown';
      sounds.playVictory();
      setMatchPhase('round_end');

      // Check if match won (best of 3 rounds, first to 2)
      if (roundWinner.roundsWon >= 2) {
        setTimeout(() => {
          setMatchPhase('match_end');
        }, 1800);
      } else {
        // Next round
        setTimeout(() => {
          setCurrentRound((r) => r + 1);
          setTimer(99);
          setWinner(null);
          // Reset fighters positions & health
          f1.x = 260;
          f1.y = GROUND_Y;
          f1.vx = 0;
          f1.vy = 0;
          f1.health = 100;
          f1.displayHealth = 100;
          f1.state = 'idle';

          f2.x = 740;
          f2.y = GROUND_Y;
          f2.vx = 0;
          f2.vy = 0;
          f2.health = 100;
          f2.displayHealth = 100;
          f2.state = 'idle';

          setMatchPhase('intro');
        }, 2500);
      }
    }, 1200);
  };

  const handleTouchControl = (key: keyof KeyControls, pressed: boolean) => {
    p1ControlsRef.current[key] = pressed;
  };

  // PORTRAIT MOBILE: Split layout with 16:9 battle screen at top and ergonomic arcade deck at bottom
  if (isPortrait) {
    return (
      <div 
        ref={containerRef}
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        className="relative w-full max-h-[100dvh] flex flex-col justify-between bg-neutral-950 overflow-hidden select-none"
      >
        {/* Top 16:9 Combat Viewport */}
        <div 
          style={{
            transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="relative w-full aspect-[1000/560] shadow-2xl bg-neutral-950 border-b border-neutral-800 shrink-0"
        >
          <canvas
            id="fight-canvas"
            ref={canvasRef}
            width={ARENA_WIDTH}
            height={ARENA_HEIGHT}
            className="w-full h-full object-contain block"
          />

          {/* Retro CRT Scanlines overlay */}
          <div className="absolute inset-0 crt-overlay pointer-events-none" />

          {/* HUD Layer with top victory banners */}
          <HUD
            f1={f1}
            f2={f2}
            timer={timer}
            currentRound={currentRound}
            matchPhase={matchPhase}
            winner={winner}
            roundAnnounceText={roundAnnounceText}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(sounds.toggleMute())}
            onOpenControls={onOpenControls}
            onOpenSprites={onOpenSprites}
            onRestartMatch={handleRestartMatch}
            gameMode={gameMode}
            onExitToMenu={onExitToMenu}
            showTouchControls={showTouchControls}
            onToggleTouchControls={() => setShowTouchControls(p => !p)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
          />
        </div>

        {/* Bottom Dedicated Arcade Control Deck for Smartphones */}
        {showTouchControls && (
          <TouchControls
            onControlChange={handleTouchControl}
            canSpecial={f1.meter >= 25}
            isPortrait={true}
          />
        )}
      </div>
    );
  }

  // LANDSCAPE / DESKTOP VIEWPORT
  return (
    <div 
      ref={containerRef}
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
      className="relative w-full max-h-[100dvh] flex items-center justify-center bg-black overflow-hidden select-none"
    >
      {/* 16:9 Canvas container: dynamically clamped so it fits all mobile screens without overflow */}
      <div 
        style={{
          width: 'min(100vw, calc(var(--vh, 1vh) * 100 * (1000 / 560)))',
          height: 'min(calc(var(--vh, 1vh) * 100), calc(100vw * (560 / 1000)))',
          maxWidth: '1000px',
          maxHeight: '560px',
          transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out'
        }}
        className="relative aspect-[1000/560] shadow-2xl bg-neutral-950 border border-neutral-800 shrink-0"
      >
        <canvas
          id="fight-canvas"
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT}
          className="w-full h-full object-contain block"
        />

        {/* Retro CRT Scanlines overlay */}
        <div className="absolute inset-0 crt-overlay pointer-events-none" />

        {/* HUD Layer with top victory banners */}
        <HUD
          f1={f1}
          f2={f2}
          timer={timer}
          currentRound={currentRound}
          matchPhase={matchPhase}
          winner={winner}
          roundAnnounceText={roundAnnounceText}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(sounds.toggleMute())}
          onOpenControls={onOpenControls}
          onOpenSprites={onOpenSprites}
          onRestartMatch={handleRestartMatch}
          gameMode={gameMode}
          onExitToMenu={onExitToMenu}
          showTouchControls={showTouchControls}
          onToggleTouchControls={() => setShowTouchControls(p => !p)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />

        {/* Virtual Touch Controls for Landscape Mobile */}
        {showTouchControls && (
          <TouchControls
            onControlChange={handleTouchControl}
            canSpecial={f1.meter >= 25}
            isPortrait={false}
          />
        )}
      </div>
    </div>
  );
};
