import { CharacterId, CharacterSprites, SlicedSprite } from '../types';

// IndexedDB database name and store
const DB_NAME = 'AlmafuerteBattleDB';
const STORE_NAME = 'spritesheets';

/**
 * Open IndexedDB helper
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save sprite sheet DataURL to IndexedDB
 */
export async function saveSpriteSheetDataUrl(charId: CharacterId, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(dataUrl, charId);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save to IndexedDB', err);
  }
}

/**
 * Load sprite sheet DataURL from IndexedDB
 */
export async function loadSpriteSheetDataUrl(charId: CharacterId): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(charId);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Creates an empty or default canvas sprite
 */
export function createEmptySprite(w = 120, h = 160): SlicedSprite {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { image: canvas, width: w, height: h };
}

/**
 * Removes white background from a canvas by setting alpha to 0 for pixels where R,G,B > threshold.
 * If the image ALREADY has transparent pixels around the borders, it preserves it without stripping white details.
 */
export function removeWhiteBackground(sourceCanvas: HTMLCanvasElement, threshold = 242): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Check if image already has transparent pixels at the corners or borders
  const w = canvas.width;
  const h = canvas.height;
  const sampleCorners = [
    0, // top-left
    (w - 1) * 4, // top-right
    ((h - 1) * w) * 4, // bottom-left
    ((h - 1) * w + (w - 1)) * 4 // bottom-right
  ];
  
  let transparentCorners = 0;
  for (const idx of sampleCorners) {
    if (data[idx + 3] < 30) {
      transparentCorners++;
    }
  }

  // If at least 2 corners are already transparent, it's already an alpha-masked PNG!
  // Don't erase white pixels from clothing, eyes, or effects!
  if (transparentCorners >= 2) {
    return canvas;
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // If near white, make transparent with smooth falloff
    if (r > threshold && g > threshold && b > threshold) {
      data[i + 3] = 0;
    } else if (r > threshold - 20 && g > threshold - 20 && b > threshold - 20) {
      // smooth antialias fringe
      const avg = (r + g + b) / 3;
      const factor = Math.max(0, 1 - (avg - (threshold - 20)) / 20);
      data[i + 3] = Math.floor(data[i + 3] * factor);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Trims transparent borders around a canvas sprite
 */
export function trimSprite(canvas: HTMLCanvasElement, padding = 4): SlicedSprite {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { image: canvas, width: canvas.width, height: canvas.height };

  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  let minX = w, maxX = 0, minY = h, maxY = 0;
  let hasPixels = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > 15) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasPixels) {
    return { image: canvas, width: w, height: h };
  }

  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(w - 1, maxX + padding);
  maxY = Math.min(h - 1, maxY + padding);

  const trimW = maxX - minX + 1;
  const trimH = maxY - minY + 1;

  const trimmed = document.createElement('canvas');
  trimmed.width = trimW;
  trimmed.height = trimH;
  const tCtx = trimmed.getContext('2d')!;
  tCtx.drawImage(canvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);

  return { image: trimmed, width: trimW, height: trimH };
}

/**
 * Slices the 8-row sprite sheet according to the exact user specification:
 * 1) sprite único (pose de victoria)
 * 2) 2 sprites reposo, 1 agachado, 1 saltando (todos derecha)
 * 3) ídem fila 2 pero mirando izquierda y en orden inverso (jump, crouch, idle2, idle1)
 * 4) 2 caminar derecha, 2 caminar izquierda
 * 5) 1 piña, 1 patada, 1 piña aire, 1 patada aire (derecha)
 * 6) ídem fila 5 pero mirando izquierda y orden inverso (air kick, air punch, kick, punch)
 * 7) 2 sprites poder especial (1ro transición, 2do poder en sí) hacia derecha
 * 8) ídem 7 pero izquierda y orden inverso (poder en sí, transición)
 */
export function sliceSpriteSheet(image: HTMLImageElement): CharacterSprites {
  const totalW = image.naturalWidth || image.width;
  const totalH = image.naturalHeight || image.height;

  // First, draw the entire image to an offscreen canvas to scan rows
  const rawCanvas = document.createElement('canvas');
  rawCanvas.width = totalW;
  rawCanvas.height = totalH;
  const rawCtx = rawCanvas.getContext('2d')!;
  rawCtx.drawImage(image, 0, 0);

  const imgData = rawCtx.getImageData(0, 0, totalW, totalH);
  const data = imgData.data;

  // Detect horizontal row bands: find rows with non-white pixels
  const rowHasContent: boolean[] = new Array(totalH).fill(false);
  for (let y = 0; y < totalH; y++) {
    for (let x = 0; x < totalW; x++) {
      const idx = (y * totalW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      // If pixel is not white and not transparent
      if (a > 20 && (r < 245 || g < 245 || b < 245)) {
        rowHasContent[y] = true;
        break;
      }
    }
  }

  // Find contiguous bands
  interface Band { minY: number; maxY: number; }
  const rawBands: Band[] = [];
  let inBand = false;
  let startY = 0;

  for (let y = 0; y < totalH; y++) {
    if (rowHasContent[y] && !inBand) {
      inBand = true;
      startY = y;
    } else if (!rowHasContent[y] && inBand) {
      inBand = false;
      if (y - startY > 15) { // minimum row height
        rawBands.push({ minY: startY, maxY: y });
      }
    }
  }
  if (inBand && totalH - startY > 15) {
    rawBands.push({ minY: startY, maxY: totalH - 1 });
  }

  // Mirror canvas helper for left/right facing fallbacks
  const mirrorCanvas = (sprite: SlicedSprite): SlicedSprite => {
    if (!sprite || !sprite.image || sprite.width < 5) return createEmptySprite();
    const c = document.createElement('canvas');
    c.width = sprite.width;
    c.height = sprite.height;
    const mCtx = c.getContext('2d');
    if (!mCtx) return sprite;
    mCtx.translate(c.width, 0);
    mCtx.scale(-1, 1);
    mCtx.drawImage(sprite.image, 0, 0);
    return { image: c, width: c.width, height: c.height };
  };

  // Support 12 rows (new format with block, hurt, defeat, projectile) or legacy 8 rows
  let rowBands: Band[] = [];
  if (rawBands.length >= 11 && rawBands.length <= 15) {
    rowBands = rawBands.slice(0, 12);
  } else if (rawBands.length >= 7 && rawBands.length <= 9) {
    rowBands = rawBands.slice(0, 8);
  } else {
    // Default uniform division into 12 rows for current format
    const rowH = totalH / 12;
    for (let i = 0; i < 12; i++) {
      rowBands.push({
        minY: Math.floor(i * rowH),
        maxY: Math.floor((i + 1) * rowH)
      });
    }
  }

  // Helper to slice a sub-rectangle, remove white, and trim
  const extractRect = (x: number, y: number, w: number, h: number): SlicedSprite => {
    x = Math.max(0, Math.min(totalW - 1, x));
    y = Math.max(0, Math.min(totalH - 1, y));
    w = Math.max(1, Math.min(totalW - x, w));
    h = Math.max(1, Math.min(totalH - y, h));

    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
    const noWhite = removeWhiteBackground(c);
    return trimSprite(noWhite);
  };

  // Function to find sprite columns within a row band
  const extractRowSprites = (band: Band, expectedCount: number): SlicedSprite[] => {
    const bH = band.maxY - band.minY;
    // Scan columns in this row
    const colHasContent: boolean[] = new Array(totalW).fill(false);
    for (let x = 0; x < totalW; x++) {
      for (let y = band.minY; y <= band.maxY; y++) {
        const idx = (y * totalW + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        if (a > 20 && (r < 245 || g < 245 || b < 245)) {
          colHasContent[x] = true;
          break;
        }
      }
    }

    interface ColBand { minX: number; maxX: number; }
    const colBands: ColBand[] = [];
    let inCol = false;
    let startX = 0;

    for (let x = 0; x < totalW; x++) {
      if (colHasContent[x] && !inCol) {
        inCol = true;
        startX = x;
      } else if (!colHasContent[x] && inCol) {
        inCol = false;
        if (x - startX > 15) {
          colBands.push({ minX: startX, maxX: x });
        }
      }
    }
    if (inCol && totalW - startX > 15) {
      colBands.push({ minX: startX, maxX: totalW - 1 });
    }

    // If auto-detection matched expected count, use them
    if (colBands.length === expectedCount) {
      return colBands.map(cb => extractRect(cb.minX, band.minY, cb.maxX - cb.minX, bH));
    }

    // Otherwise slice uniformly across the active width
    const result: SlicedSprite[] = [];
    const minContentX = colBands.length > 0 ? colBands[0].minX : 0;
    const maxContentX = colBands.length > 0 ? colBands[colBands.length - 1].maxX : totalW;
    const activeW = Math.max(100, maxContentX - minContentX);
    const colW = activeW / expectedCount;

    for (let i = 0; i < expectedCount; i++) {
      result.push(extractRect(minContentX + i * colW, band.minY, colW, bH));
    }
    return result;
  };

  // Row 1: 1 sprite (Pose de victoria)
  const r1Sprites = extractRowSprites(rowBands[0], 1);
  const victory = r1Sprites[0] || createEmptySprite();

  // Row 2: 4 sprites: Idle1, Idle2, Crouch, Jump (Right)
  const r2Sprites = extractRowSprites(rowBands[1], 4);
  const idleRight = [r2Sprites[0] || createEmptySprite(), r2Sprites[1] || createEmptySprite()];
  const crouchRight = r2Sprites[2] || createEmptySprite();
  const jumpRight = r2Sprites[3] || createEmptySprite();

  // Row 3: 4 sprites: Reverse order facing Left (Jump, Crouch, Idle2, Idle1)
  const r3Sprites = extractRowSprites(rowBands[2], 4);
  const jumpLeft = r3Sprites[0] || createEmptySprite();
  const crouchLeft = r3Sprites[1] || createEmptySprite();
  const idleLeft = [r3Sprites[3] || createEmptySprite(), r3Sprites[2] || createEmptySprite()];

  // Row 4: 4 sprites: 2 Walk Right, 2 Walk Left
  const r4Sprites = extractRowSprites(rowBands[3], 4);
  const walkRight = [r4Sprites[0] || createEmptySprite(), r4Sprites[1] || createEmptySprite()];
  const walkLeft = [r4Sprites[2] || createEmptySprite(), r4Sprites[3] || createEmptySprite()];

  // Row 5: 4 sprites: Punch, Kick, AirPunch, AirKick (Right)
  const r5Sprites = extractRowSprites(rowBands[4], 4);
  const punchRight = r5Sprites[0] || createEmptySprite();
  const kickRight = r5Sprites[1] || createEmptySprite();
  const airPunchRight = r5Sprites[2] || createEmptySprite();
  const airKickRight = r5Sprites[3] || createEmptySprite();

  // Row 6: 4 sprites: Reverse order facing Left (AirKick, AirPunch, Kick, Punch)
  const r6Sprites = extractRowSprites(rowBands[5], 4);
  const airKickLeft = r6Sprites[0] || createEmptySprite();
  const airPunchLeft = r6Sprites[1] || createEmptySprite();
  const kickLeft = r6Sprites[2] || createEmptySprite();
  const punchLeft = r6Sprites[3] || createEmptySprite();

  // Row 7: 2 sprites: Special Prep, Special Blast (Right)
  const r7Sprites = extractRowSprites(rowBands[6], 2);
  const specialPrepRight = r7Sprites[0] || createEmptySprite();
  const specialBlastRight = r7Sprites[1] || createEmptySprite();

  // Row 8: 2 sprites: Reverse order facing Left (Special Blast, Special Prep)
  const r8Sprites = extractRowSprites(rowBands[7], 2);
  const specialBlastLeft = r8Sprites[0] || createEmptySprite();
  const specialPrepLeft = r8Sprites[1] || createEmptySprite();

  // Row 9: 2 sprites: Posición de bloqueo mirando a la derecha (idx 0) y a la izquierda (idx 1)
  let blockRight: SlicedSprite;
  let blockLeft: SlicedSprite;
  if (rowBands.length >= 9) {
    const r9Sprites = extractRowSprites(rowBands[8], 2);
    blockRight = r9Sprites[0] || createEmptySprite();
    blockLeft = r9Sprites[1] || createEmptySprite();
    if (blockRight.width > 5 && blockLeft.width <= 5) {
      blockLeft = mirrorCanvas(blockRight);
    } else if (blockLeft.width > 5 && blockRight.width <= 5) {
      blockRight = mirrorCanvas(blockLeft);
    }
  } else {
    blockRight = crouchRight;
    blockLeft = crouchLeft;
  }

  // Row 10: 2 sprites: Personaje recibe daño mirando a la derecha (idx 0) y a la izquierda (idx 1)
  let hurtRight: SlicedSprite;
  let hurtLeft: SlicedSprite;
  if (rowBands.length >= 10) {
    const r10Sprites = extractRowSprites(rowBands[9], 2);
    hurtRight = r10Sprites[0] || createEmptySprite();
    hurtLeft = r10Sprites[1] || createEmptySprite();
    if (hurtRight.width > 5 && hurtLeft.width <= 5) {
      hurtLeft = mirrorCanvas(hurtRight);
    } else if (hurtLeft.width > 5 && hurtRight.width <= 5) {
      hurtRight = mirrorCanvas(hurtLeft);
    }
  } else {
    hurtRight = mirrorCanvas(idleLeft[0]);
    hurtLeft = mirrorCanvas(idleRight[0]);
  }

  // Row 11: 1 sprite: Personaje derrotado cae al suelo vencido y ahí se queda
  let defeated: SlicedSprite;
  if (rowBands.length >= 11) {
    const r11Sprites = extractRowSprites(rowBands[10], 1);
    defeated = r11Sprites[0] || createEmptySprite();
  } else {
    defeated = crouchRight;
  }

  // Row 12: 1 sprite: Es el poder especial que tira el personaje (proyectil horizontal)
  let projectileSprite: SlicedSprite;
  if (rowBands.length >= 12) {
    const r12Sprites = extractRowSprites(rowBands[11], 1);
    projectileSprite = r12Sprites[0] || createEmptySprite();
  } else {
    projectileSprite = createEmptySprite();
  }

  return {
    loaded: true,
    rawImage: image,
    victory,
    idleRight,
    idleLeft,
    crouchRight,
    crouchLeft,
    jumpRight,
    jumpLeft,
    walkRight,
    walkLeft,
    punchRight,
    punchLeft,
    kickRight,
    kickLeft,
    airPunchRight,
    airPunchLeft,
    airKickRight,
    airKickLeft,
    specialPrepRight,
    specialPrepLeft,
    specialBlastRight,
    specialBlastLeft,
    blockRight,
    blockLeft,
    hurtRight,
    hurtLeft,
    defeated,
    projectileSprite,
  };
}

/**
 * Procedural Fallback Renderer:
 * If the user hasn't dropped the PNGs yet, renders stylized, high-fidelity characters
 * matching the exact descriptions of Vareta (trenchcoat, bottle, green vomit) and Caíto (glowing eyes, tank top, golden beam).
 */
export function createFallbackSprites(charId: CharacterId): CharacterSprites {
  const isVareta = charId === 'vareta';

  const renderFrame = (
    action: string,
    facing: 1 | -1,
    subframe: number
  ): SlicedSprite => {
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 180;
    const ctx = c.getContext('2d')!;

    ctx.save();
    ctx.translate(80, 150);
    if (facing === -1) {
      ctx.scale(-1, 1);
    }

    if (isVareta) {
      // Vareta: Trenchcoat, shaggy hair, beard, bottle
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Boots
      ctx.fillStyle = '#2b1e16';
      ctx.fillRect(-14, -12, 10, 12);
      ctx.fillRect(4, -12, 10, 12);

      // Pants
      ctx.fillStyle = '#37413a';
      ctx.fillRect(-12, -45, 9, 35);
      ctx.fillRect(3, -45, 9, 35);

      // Black Trenchcoat (back)
      ctx.fillStyle = '#1c1d22';
      ctx.beginPath();
      ctx.moveTo(-16, -95);
      ctx.lineTo(16, -95);
      ctx.lineTo(22, -20);
      ctx.lineTo(-22, -20);
      ctx.closePath();
      ctx.fill();

      // Shirt
      ctx.fillStyle = '#4b5548';
      ctx.fillRect(-10, -90, 20, 48);

      // Head & Hair
      ctx.fillStyle = '#d4a373';
      ctx.beginPath();
      ctx.arc(0, -108, 12, 0, Math.PI * 2);
      ctx.fill();

      // Shaggy dark hair & beard
      ctx.fillStyle = '#1e1917';
      ctx.beginPath();
      ctx.arc(0, -112, 15, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      ctx.fillRect(-10, -112, 20, 8);
      // Beard
      ctx.beginPath();
      ctx.arc(2, -104, 7, 0, Math.PI * 0.8);
      ctx.fill();

      // Trenchcoat Lapels
      ctx.fillStyle = '#15161a';
      ctx.beginPath();
      ctx.moveTo(-14, -92);
      ctx.lineTo(-4, -92);
      ctx.lineTo(-8, -40);
      ctx.lineTo(-18, -35);
      ctx.closePath();
      ctx.fill();

      // Beer Bottle
      ctx.fillStyle = '#99582a';
      ctx.fillRect(-18, -75, 7, 16);
      ctx.fillStyle = '#6f3d1b';
      ctx.fillRect(-16, -80, 3, 5);

      // Actions
      if (action === 'idle') {
        const bob = subframe === 1 ? -3 : 0;
        ctx.translate(0, bob);
        // Hands
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.arc(12, -70, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (action === 'punch') {
        // Fist thrust forward with red aura
        ctx.fillStyle = '#d4a373';
        ctx.fillRect(10, -85, 32, 8);
        // Red fire / aura
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.beginPath();
        ctx.arc(42, -81, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(252, 165, 165, 0.9)';
        ctx.beginPath();
        ctx.arc(42, -81, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (action === 'kick') {
        // High kick with red energy
        ctx.fillStyle = '#37413a';
        ctx.save();
        ctx.translate(4, -40);
        ctx.rotate(-0.8);
        ctx.fillRect(0, -5, 45, 12);
        // Red fire around boot
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.beginPath();
        ctx.arc(44, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (action === 'special_prep') {
        // Crouched holding chest/throat
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.beginPath();
        ctx.arc(12, -100, 15, 0, Math.PI * 2);
        ctx.fill();
      } else if (action === 'special_blast') {
        // Toxic green stream spewing from mouth
        const grad = ctx.createLinearGradient(12, -105, 95, -105);
        grad.addColorStop(0, '#22c55e');
        grad.addColorStop(0.5, '#84cc16');
        grad.addColorStop(1, 'rgba(101, 163, 13, 0.2)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(10, -106);
        ctx.lineTo(95, -125);
        ctx.lineTo(95, -85);
        ctx.closePath();
        ctx.fill();
        // Poison bubbles
        ctx.fillStyle = '#a3e635';
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(30 + i * 11, -105 + Math.sin(i * 2) * 8, 4 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (action === 'victory') {
        // Chugging bottle
        ctx.fillStyle = '#99582a';
        ctx.save();
        ctx.translate(2, -112);
        ctx.rotate(-0.9);
        ctx.fillRect(0, 0, 8, 22);
        ctx.restore();
      } else if (action === 'block') {
        // Defensive block stance
        ctx.fillStyle = '#d4a373';
        ctx.fillRect(6, -88, 8, 24);
        ctx.fillRect(14, -84, 8, 22);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.beginPath();
        ctx.arc(15, -75, 20, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
      } else if (action === 'hit') {
        // Recoil from damage
        ctx.translate(-12, 5);
        ctx.rotate(-0.28);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, -95, 8, 6);
      } else if (action === 'defeated') {
        // Fallen horizontally on the ground
        ctx.translate(-40, 20);
        ctx.rotate(Math.PI / 2);
      } else if (action === 'projectile') {
        // Toxic green projectile orb
        const grad = ctx.createRadialGradient(0, -75, 4, 0, -75, 28);
        grad.addColorStop(0, '#86efac');
        grad.addColorStop(0.5, '#22c55e');
        grad.addColorStop(1, 'rgba(21, 128, 61, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, -75, 28, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Caíto: Green tank top, muscular build, glowing yellow eyes
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Boots
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-14, -12, 11, 12);
      ctx.fillRect(4, -12, 11, 12);

      // Cargo Pants
      ctx.fillStyle = '#3f4e38';
      ctx.fillRect(-13, -45, 10, 35);
      ctx.fillRect(3, -45, 10, 35);

      // Green sleeveless tank top with logo
      ctx.fillStyle = '#14532d';
      ctx.fillRect(-14, -92, 28, 48);
      ctx.fillStyle = '#4ade80';
      // ZZ logo on chest
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('ZZ', -6, -72);

      // Muscular Arms (Skin)
      ctx.fillStyle = '#c68642';
      ctx.fillRect(-19, -88, 7, 30);
      ctx.fillRect(12, -88, 7, 30);

      // Head & Hair
      ctx.beginPath();
      ctx.arc(0, -108, 12, 0, Math.PI * 2);
      ctx.fill();

      // Dark curly hair
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, -113, 14, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      ctx.fillRect(-12, -113, 24, 6);

      // GLOWING YELLOW EYES
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 10;
      ctx.fillRect(1, -110, 4, 3);
      ctx.fillRect(7, -110, 4, 3);
      ctx.shadowBlur = 0; // reset

      // Actions
      if (action === 'idle') {
        const bob = subframe === 1 ? -3 : 0;
        ctx.translate(0, bob);
        // Fists
        ctx.fillStyle = '#c68642';
        ctx.beginPath();
        ctx.arc(14, -72, 6, 0, Math.PI * 2);
        ctx.arc(6, -68, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (action === 'punch') {
        // Golden punch
        ctx.fillStyle = '#c68642';
        ctx.fillRect(12, -84, 30, 9);
        // Golden energy aura
        ctx.fillStyle = 'rgba(234, 179, 8, 0.7)';
        ctx.beginPath();
        ctx.arc(42, -80, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
        ctx.beginPath();
        ctx.arc(42, -80, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (action === 'kick') {
        // Golden high kick
        ctx.fillStyle = '#3f4e38';
        ctx.save();
        ctx.translate(5, -40);
        ctx.rotate(-0.85);
        ctx.fillRect(0, -5, 46, 12);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.8)';
        ctx.beginPath();
        ctx.arc(45, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (action === 'special_prep') {
        // Golden aura burst around body
        ctx.fillStyle = 'rgba(250, 204, 21, 0.5)';
        ctx.beginPath();
        ctx.arc(0, -75, 48, 0, Math.PI * 2);
        ctx.fill();
      } else if (action === 'special_blast') {
        // Colossal Golden Ki Beam
        const grad = ctx.createLinearGradient(15, -80, 100, -80);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.3, '#eab308');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0.1)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(18, -80, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(18, -98, 80, 36);
        // Beam core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, -90, 75, 20);
      } else if (action === 'victory') {
        // Thumbs up
        ctx.fillStyle = '#c68642';
        ctx.fillRect(12, -88, 8, 20);
        ctx.beginPath();
        ctx.arc(16, -92, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (action === 'block') {
        // Muscular cross-arm guard
        ctx.fillStyle = '#c68642';
        ctx.fillRect(8, -85, 10, 22);
        ctx.fillRect(16, -82, 10, 20);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.beginPath();
        ctx.arc(16, -75, 22, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
      } else if (action === 'hit') {
        // Recoil from damage
        ctx.translate(-12, 5);
        ctx.rotate(-0.28);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(4, -95, 8, 6);
      } else if (action === 'defeated') {
        // Fallen horizontally on the ground
        ctx.translate(-40, 20);
        ctx.rotate(Math.PI / 2);
      } else if (action === 'projectile') {
        // Radiant golden ki blast orb
        const grad = ctx.createRadialGradient(0, -75, 4, 0, -75, 28);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.5, '#eab308');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, -75, 28, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    return trimSprite(c);
  };

  return {
    loaded: true,
    victory: renderFrame('victory', 1, 0),
    idleRight: [renderFrame('idle', 1, 0), renderFrame('idle', 1, 1)],
    idleLeft: [renderFrame('idle', -1, 0), renderFrame('idle', -1, 1)],
    crouchRight: renderFrame('idle', 1, 0),
    crouchLeft: renderFrame('idle', -1, 0),
    jumpRight: renderFrame('idle', 1, 1),
    jumpLeft: renderFrame('idle', -1, 1),
    walkRight: [renderFrame('idle', 1, 0), renderFrame('idle', 1, 1)],
    walkLeft: [renderFrame('idle', -1, 0), renderFrame('idle', -1, 1)],
    punchRight: renderFrame('punch', 1, 0),
    punchLeft: renderFrame('punch', -1, 0),
    kickRight: renderFrame('kick', 1, 0),
    kickLeft: renderFrame('kick', -1, 0),
    airPunchRight: renderFrame('punch', 1, 0),
    airPunchLeft: renderFrame('punch', -1, 0),
    airKickRight: renderFrame('kick', 1, 0),
    airKickLeft: renderFrame('kick', -1, 0),
    specialPrepRight: renderFrame('special_prep', 1, 0),
    specialPrepLeft: renderFrame('special_prep', -1, 0),
    specialBlastRight: renderFrame('special_blast', 1, 0),
    specialBlastLeft: renderFrame('special_blast', -1, 0),
    blockRight: renderFrame('block', 1, 0),
    blockLeft: renderFrame('block', -1, 0),
    hurtRight: renderFrame('hit', 1, 0),
    hurtLeft: renderFrame('hit', -1, 0),
    defeated: renderFrame('defeated', 1, 0),
    projectileSprite: renderFrame('projectile', 1, 0),
  };
}
