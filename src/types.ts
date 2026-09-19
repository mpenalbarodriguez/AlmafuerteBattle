export type CharacterId = 'vareta' | 'caito' | 'telmo';

export type AnimationState = 
  | 'idle'
  | 'walk_fwd'
  | 'walk_back'
  | 'crouch'
  | 'jump'
  | 'block'
  | 'punch'
  | 'kick'
  | 'air_punch'
  | 'air_kick'
  | 'special_prep'
  | 'special_blast'
  | 'hit'
  | 'knockdown'
  | 'victory';

export interface Fighter {
  id: CharacterId;
  name: string;
  isPlayer1: boolean;
  isCPU: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1; // 1 = right, -1 = left
  state: AnimationState;
  stateTimer: number; // in frames (60fps)
  stateDuration: number;
  animFrame: number; // 0, 1, etc.
  
  health: number;
  maxHealth: number;
  displayHealth: number;
  meter: number; // 0 to 100
  
  isGrounded: boolean;
  isCrouching: boolean;
  isBlocking: boolean;
  
  hasHitThisAttack: boolean;
  comboCount: number;
  comboTimer: number;
  hitStun: number;
  blockStun: number;
  invincibleTimer: number;
  
  roundsWon: number;
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  hitStun: number;
  knockbackX: number;
  knockbackY: number;
  type: 'punch' | 'kick' | 'air_punch' | 'air_kick' | 'special';
}

export interface Hurtbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Projectile {
  id: string;
  ownerId: CharacterId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  life: number;
  maxLife: number;
  damage: number;
  type: 'vomit' | 'ki_blast' | 'pills';
  hitCount: number;
  maxHits: number;
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'smoke' | 'toxic' | 'ki' | 'blood' | 'glass';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export type GameMode = 'vs_cpu' | 'vs_p2' | 'training';

export type MatchPhase = 
  | 'select'
  | 'intro'       // "ROUND 1 - FIGHT!"
  | 'fighting'
  | 'ko'          // "K.O.!" freeze
  | 'round_end'   // Victory pose
  | 'match_end';  // Game over screen

export interface KeyControls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  block: boolean;
  punch: boolean;
  kick: boolean;
  special: boolean;
}

export interface SlicedSprite {
  image: HTMLCanvasElement;
  width: number;
  height: number;
}

export interface CharacterSprites {
  loaded: boolean;
  rawImage?: HTMLImageElement;
  
  // Row 1: 1 sprite (Victory)
  victory: SlicedSprite;
  
  // Row 2 & 3: [idle1, idle2, crouch, jump]
  idleRight: SlicedSprite[];
  idleLeft: SlicedSprite[];
  crouchRight: SlicedSprite;
  crouchLeft: SlicedSprite;
  jumpRight: SlicedSprite;
  jumpLeft: SlicedSprite;
  
  // Row 4: 2 walk right, 2 walk left
  walkRight: SlicedSprite[];
  walkLeft: SlicedSprite[];
  
  // Row 5 & 6: punch, kick, air_punch, air_kick
  punchRight: SlicedSprite;
  punchLeft: SlicedSprite;
  kickRight: SlicedSprite;
  kickLeft: SlicedSprite;
  airPunchRight: SlicedSprite;
  airPunchLeft: SlicedSprite;
  airKickRight: SlicedSprite;
  airKickLeft: SlicedSprite;
  
  // Row 7 & 8: special prep, special blast
  specialPrepRight: SlicedSprite;
  specialPrepLeft: SlicedSprite;
  specialBlastRight: SlicedSprite;
  specialBlastLeft: SlicedSprite;

  // Row 9: Posición de bloqueo mirando a la derecha y a la izquierda
  blockRight: SlicedSprite;
  blockLeft: SlicedSprite;

  // Row 10: Personaje recibe daño mirando a la derecha y a la izquierda
  hurtRight: SlicedSprite;
  hurtLeft: SlicedSprite;

  // Row 11: Personaje derrotado cae al suelo vencido y ahí se queda
  defeated: SlicedSprite;

  // Row 12: Es el poder especial que tira el personaje (proyectil horizontal)
  projectileSprite: SlicedSprite;
}
