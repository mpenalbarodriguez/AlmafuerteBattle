import { 
  Fighter, 
  CharacterId, 
  Hitbox, 
  Hurtbox, 
  Projectile, 
  ParticleEffect, 
  FloatingText,
  KeyControls,
  GameMode
} from '../types';
import { sounds } from '../audio/soundEffects';

export const ARENA_WIDTH = 1000;
export const ARENA_HEIGHT = 560;
export const GROUND_Y = 460;
export const GRAVITY = 0.85;

export function createFighter(
  id: CharacterId, 
  isPlayer1: boolean, 
  isCPU: boolean
): Fighter {
  return {
    id,
    name: id === 'vareta' ? 'Vareta' : id === 'caito' ? 'Caíto' : 'Dr. Telmo',
    isPlayer1,
    isCPU,
    x: isPlayer1 ? 240 : 760,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    facing: isPlayer1 ? 1 : -1,
    state: 'idle',
    stateTimer: 0,
    stateDuration: 0,
    animFrame: 0,
    health: 100,
    maxHealth: 100,
    displayHealth: 100,
    meter: 35, // starting partial meter
    isGrounded: true,
    isCrouching: false,
    isBlocking: false,
    hasHitThisAttack: false,
    comboCount: 0,
    comboTimer: 0,
    hitStun: 0,
    blockStun: 0,
    invincibleTimer: 0,
    roundsWon: 0,
  };
}

export function updateFighter(
  fighter: Fighter,
  opponent: Fighter,
  controls: KeyControls,
  projectiles: Projectile[],
  particles: ParticleEffect[],
  floatingTexts: FloatingText[],
  isMatchActive: boolean
) {
  // Smooth display health (yellow trailing bar)
  if (fighter.displayHealth > fighter.health) {
    fighter.displayHealth = Math.max(fighter.health, fighter.displayHealth - 0.45);
  }

  // Invincibility countdown
  if (fighter.invincibleTimer > 0) {
    fighter.invincibleTimer--;
  }

  // Combo timer decay
  if (fighter.comboTimer > 0) {
    fighter.comboTimer--;
    if (fighter.comboTimer <= 0) {
      fighter.comboCount = 0;
    }
  }

  // Apply gravity
  if (!fighter.isGrounded) {
    fighter.vy += GRAVITY;
    fighter.y += fighter.vy;
    if (fighter.y >= GROUND_Y) {
      fighter.y = GROUND_Y;
      fighter.vy = 0;
      fighter.isGrounded = true;
      sounds.playJump();
    }
  }

  // Apply horizontal movement with drag
  fighter.x += fighter.vx;
  fighter.vx *= 0.85;

  // Arena boundaries
  const margin = 40;
  if (fighter.x < margin) fighter.x = margin;
  if (fighter.x > ARENA_WIDTH - margin) fighter.x = ARENA_WIDTH - margin;

  // Prevent walking through each other unless jumping over
  const dist = Math.abs(fighter.x - opponent.x);
  if (dist < 56 && fighter.isGrounded && opponent.isGrounded) {
    const push = (56 - dist) / 2;
    if (fighter.x < opponent.x) {
      fighter.x -= push;
      opponent.x += push;
    } else {
      fighter.x += push;
      opponent.x -= push;
    }
  }

  // State timers
  fighter.stateTimer++;

  // Knockdown / Defeated state
  if (fighter.health <= 0) {
    fighter.state = 'knockdown';
    return;
  }

  // Handle Hit Stun
  if (fighter.hitStun > 0) {
    fighter.hitStun--;
    fighter.state = 'hit';
    return;
  }

  // Handle Block Stun
  if (fighter.blockStun > 0) {
    fighter.blockStun--;
    fighter.state = 'block';
    return;
  }

  if (!isMatchActive) {
    return;
  }

  // Auto face opponent when grounded and not in an attack lock
  const isAttacking = [
    'punch', 'kick', 'air_punch', 'air_kick', 'special_prep', 'special_blast'
  ].includes(fighter.state);

  if (fighter.isGrounded && !isAttacking) {
    fighter.facing = fighter.x < opponent.x ? 1 : -1;
  }

  // Attack animations duration logic
  if (isAttacking) {
    if (fighter.state === 'punch') {
      if (fighter.stateTimer > 18) {
        fighter.state = 'idle';
        fighter.hasHitThisAttack = false;
      }
    } else if (fighter.state === 'kick') {
      if (fighter.stateTimer > 24) {
        fighter.state = 'idle';
        fighter.hasHitThisAttack = false;
      }
    } else if (fighter.state === 'air_punch') {
      if (fighter.isGrounded || fighter.stateTimer > 22) {
        fighter.state = fighter.isGrounded ? 'idle' : 'jump';
        fighter.hasHitThisAttack = false;
      }
    } else if (fighter.state === 'air_kick') {
      if (fighter.isGrounded || fighter.stateTimer > 26) {
        fighter.state = fighter.isGrounded ? 'idle' : 'jump';
        fighter.hasHitThisAttack = false;
      }
    } else if (fighter.state === 'special_prep') {
      // 1st sprite transition
      if (fighter.stateTimer > 20) {
        fighter.state = 'special_blast';
        fighter.stateTimer = 0;
        
        // Unleash the power!
        if (fighter.id === 'vareta') {
          sounds.playVomitBlast();
          // Toxic vomit projectile stream
          projectiles.push({
            id: 'vomit_' + Date.now(),
            ownerId: 'vareta',
            x: fighter.x + (fighter.facing === 1 ? 50 : -140),
            y: fighter.y - 75,
            vx: fighter.facing * 9,
            vy: 0,
            width: 140,
            height: 60,
            facing: fighter.facing,
            life: 0,
            maxLife: 55,
            damage: 28,
            type: 'vomit',
            hitCount: 0,
            maxHits: 4
          });
        } else if (fighter.id === 'caito') {
          sounds.playKiBlast();
          // Golden Ki blast beam
          projectiles.push({
            id: 'ki_' + Date.now(),
            ownerId: 'caito',
            x: fighter.x + (fighter.facing === 1 ? 60 : -220),
            y: fighter.y - 95,
            vx: fighter.facing * 12,
            vy: 0,
            width: 220,
            height: 70,
            facing: fighter.facing,
            life: 0,
            maxLife: 55,
            damage: 32,
            type: 'ki_blast',
            hitCount: 0,
            maxHits: 4
          });
        } else {
          sounds.playPillBlast();
          // Doctor Telmo: Medicine Blister Pack
          projectiles.push({
            id: 'pills_' + Date.now(),
            ownerId: 'telmo',
            x: fighter.x + (fighter.facing === 1 ? 40 : -130),
            y: fighter.y - 85,
            vx: fighter.facing * 10,
            vy: 0,
            width: 130,
            height: 65,
            facing: fighter.facing,
            life: 0,
            maxLife: 60,
            damage: 30,
            type: 'pills',
            hitCount: 0,
            maxHits: 4
          });
        }
      }
    } else if (fighter.state === 'special_blast') {
      // 2nd sprite lasts longer
      if (fighter.stateTimer > 50) {
        fighter.state = 'idle';
        fighter.hasHitThisAttack = false;
      }
    }
    return;
  }

  // Blocking check: dedicated block button/key only (backward arrow moves backward)
  fighter.isBlocking = Boolean(controls.block) && fighter.isGrounded;

  // BLOCK INPUT (dedicated block button / key)
  if (fighter.isBlocking && fighter.isGrounded) {
    fighter.state = 'block';
    fighter.vx *= 0.4;
    return;
  }

  // SPECIAL MOVE INPUT
  if (controls.special && fighter.isGrounded && fighter.meter >= 25) {
    fighter.state = 'special_prep';
    fighter.stateTimer = 0;
    fighter.meter = Math.max(0, fighter.meter - 25);
    sounds.playSpecialPrep(fighter.id === 'vareta');
    // Spawn charging particles
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: fighter.x + (Math.random() * 40 - 20),
        y: fighter.y - 50 + (Math.random() * 60 - 30),
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 5 - 2,
        life: 0,
        maxLife: 30,
        color: fighter.id === 'vareta' ? '#22c55e' : '#eab308',
        size: Math.random() * 5 + 3,
        type: fighter.id === 'vareta' ? 'toxic' : 'ki'
      });
    }
    return;
  }

  // PUNCH INPUT
  if (controls.punch) {
    if (fighter.isGrounded) {
      fighter.state = 'punch';
      fighter.stateTimer = 0;
      fighter.hasHitThisAttack = false;
      sounds.playPunch();
    } else {
      fighter.state = 'air_punch';
      fighter.stateTimer = 0;
      fighter.hasHitThisAttack = false;
      sounds.playPunch();
    }
    return;
  }

  // KICK INPUT
  if (controls.kick) {
    if (fighter.isGrounded) {
      fighter.state = 'kick';
      fighter.stateTimer = 0;
      fighter.hasHitThisAttack = false;
      sounds.playKick();
    } else {
      fighter.state = 'air_kick';
      fighter.stateTimer = 0;
      fighter.hasHitThisAttack = false;
      sounds.playKick();
    }
    return;
  }

  // CROUCH INPUT
  if (controls.down && fighter.isGrounded) {
    fighter.state = 'crouch';
    fighter.isCrouching = true;
    return;
  } else {
    fighter.isCrouching = false;
  }

  // JUMP INPUT
  if (controls.up && fighter.isGrounded) {
    fighter.vy = -16;
    fighter.isGrounded = false;
    fighter.state = 'jump';
    sounds.playJump();
    return;
  }

  // WALKING
  if (fighter.isGrounded) {
    if (controls.left) {
      fighter.vx = -4.2;
      fighter.state = fighter.facing === 1 ? 'walk_back' : 'walk_fwd';
    } else if (controls.right) {
      fighter.vx = 4.2;
      fighter.state = fighter.facing === 1 ? 'walk_fwd' : 'walk_back';
    } else {
      fighter.state = 'idle';
    }
  } else {
    // Air drift
    if (controls.left) fighter.vx = -3.5;
    if (controls.right) fighter.vx = 3.5;
  }
}

export function getFighterHurtbox(fighter: Fighter): Hurtbox {
  const isCrouched = fighter.state === 'crouch';
  const h = isCrouched ? 88 : 162;
  const w = 68;
  return {
    x: fighter.x - w / 2,
    y: fighter.y - h,
    width: w,
    height: h
  };
}

export function getFighterHitbox(fighter: Fighter): Hitbox | null {
  if (fighter.hasHitThisAttack) return null;

  const f = fighter.facing;

  if (fighter.state === 'punch' && fighter.stateTimer >= 4 && fighter.stateTimer <= 11) {
    return {
      x: fighter.x + (f === 1 ? 18 : -82),
      y: fighter.y - 130,
      width: 62,
      height: 44,
      damage: 9,
      hitStun: 16,
      knockbackX: f * 6,
      knockbackY: -2,
      type: 'punch'
    };
  }

  if (fighter.state === 'kick' && fighter.stateTimer >= 6 && fighter.stateTimer <= 15) {
    return {
      x: fighter.x + (f === 1 ? 22 : -94),
      y: fighter.y - 118,
      width: 75,
      height: 56,
      damage: 15,
      hitStun: 22,
      knockbackX: f * 9,
      knockbackY: -3,
      type: 'kick'
    };
  }

  if (fighter.state === 'air_punch' && fighter.stateTimer >= 3 && fighter.stateTimer <= 14) {
    return {
      x: fighter.x + (f === 1 ? 18 : -75),
      y: fighter.y - 112,
      width: 60,
      height: 44,
      damage: 10,
      hitStun: 18,
      knockbackX: f * 6,
      knockbackY: 0,
      type: 'air_punch'
    };
  }

  if (fighter.state === 'air_kick' && fighter.stateTimer >= 4 && fighter.stateTimer <= 17) {
    return {
      x: fighter.x + (f === 1 ? 22 : -94),
      y: fighter.y - 94,
      width: 72,
      height: 56,
      damage: 16,
      hitStun: 24,
      knockbackX: f * 9,
      knockbackY: 2,
      type: 'air_kick'
    };
  }

  return null;
}

export function checkAABB(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function applyHit(
  attacker: Fighter,
  defender: Fighter,
  hitbox: Hitbox,
  particles: ParticleEffect[],
  floatingTexts: FloatingText[]
): { hit: boolean; blocked: boolean } {
  if (defender.invincibleTimer > 0) {
    return { hit: false, blocked: false };
  }

  attacker.hasHitThisAttack = true;
  attacker.meter = Math.min(100, attacker.meter + 10);

  const blocked = defender.isBlocking;
  const actualDamage = blocked ? Math.max(1, Math.floor(hitbox.damage * 0.2)) : hitbox.damage;

  defender.health = Math.max(0, defender.health - actualDamage);
  defender.meter = Math.min(100, defender.meter + 6);

  if (blocked) {
    sounds.playBlock();
    defender.blockStun = 10;
    defender.vx = hitbox.knockbackX * 0.4;
    floatingTexts.push({
      id: 'txt_' + Math.random(),
      text: '¡BLOQUEO!',
      x: defender.x,
      y: defender.y - 120,
      color: '#93c5fd',
      size: 18,
      life: 0,
      maxLife: 35
    });
    // Blue sparks
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: defender.x,
        y: defender.y - 80,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 7,
        life: 0,
        maxLife: 15,
        color: '#60a5fa',
        size: Math.random() * 4 + 2,
        type: 'spark'
      });
    }
    return { hit: false, blocked: true };
  } else {
    sounds.playHit(hitbox.damage > 12);
    defender.hitStun = hitbox.hitStun;
    defender.vx = hitbox.knockbackX;
    defender.vy = hitbox.knockbackY;
    if (hitbox.knockbackY !== 0) {
      defender.isGrounded = false;
    }

    // Attacker combo increment
    attacker.comboCount++;
    attacker.comboTimer = 75; // frames to keep combo alive

    const comboLabel = attacker.comboCount > 1 ? `${attacker.comboCount} HITS! -${actualDamage}` : `-${actualDamage}`;
    floatingTexts.push({
      id: 'txt_' + Math.random(),
      text: comboLabel,
      x: defender.x + (Math.random() * 20 - 10),
      y: defender.y - 110,
      color: attacker.comboCount > 2 ? '#ef4444' : '#fbbf24',
      size: attacker.comboCount > 2 ? 24 : 20,
      life: 0,
      maxLife: 40
    });

    // Hit sparks
    const sparkColor = attacker.id === 'vareta' ? '#f87171' : '#fde047';
    for (let i = 0; i < 14; i++) {
      particles.push({
        x: defender.x + (Math.random() * 20 - 10),
        y: defender.y - 85 + (Math.random() * 30 - 15),
        vx: (Math.random() - 0.5) * 11,
        vy: (Math.random() - 0.5) * 11,
        life: 0,
        maxLife: 20,
        color: sparkColor,
        size: Math.random() * 5 + 3,
        type: 'spark'
      });
    }

    return { hit: true, blocked: false };
  }
}

export function updateProjectiles(
  projectiles: Projectile[],
  f1: Fighter,
  f2: Fighter,
  particles: ParticleEffect[],
  floatingTexts: FloatingText[]
) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life++;
    p.x += p.vx;

    // Spawn projectile trail particles
    if (p.life % 2 === 0) {
      particles.push({
        x: p.x + (p.facing === 1 ? 20 : p.width - 20),
        y: p.y + Math.random() * p.height,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3,
        life: 0,
        maxLife: 25,
        color: p.type === 'vomit' ? '#84cc16' : p.type === 'ki_blast' ? '#fde047' : '#38bdf8',
        size: Math.random() * 6 + 3,
        type: p.type === 'vomit' ? 'toxic' : 'ki'
      });
    }

    // Check collision against opponent
    const target = p.ownerId === f1.id ? f2 : f1;
    const attacker = p.ownerId === f1.id ? f1 : f2;
    const hurtbox = getFighterHurtbox(target);

    if (checkAABB(p, hurtbox) && p.hitCount < p.maxHits && target.hitStun <= 5) {
      p.hitCount++;
      const blocked = target.isBlocking;
      const dmg = blocked ? 4 : Math.floor(p.damage / p.maxHits);
      target.health = Math.max(0, target.health - dmg);

      if (blocked) {
        sounds.playBlock();
        target.blockStun = 14;
        target.vx = p.facing * 3;
      } else {
        sounds.playHit(true);
        target.hitStun = 22;
        target.vx = p.facing * 7;
        target.vy = -3;
        target.isGrounded = false;
        attacker.comboCount++;
        attacker.comboTimer = 75;

        const projLabel = p.type === 'vomit' ? '¡VENENO! -' + dmg : p.type === 'ki_blast' ? '¡ENERGÍA! -' + dmg : '¡PASTILLAS! -' + dmg;
        const projColor = p.type === 'vomit' ? '#4ade80' : p.type === 'ki_blast' ? '#facc15' : '#38bdf8';

        floatingTexts.push({
          id: 'proj_txt_' + Math.random(),
          text: projLabel,
          x: target.x,
          y: target.y - 120,
          color: projColor,
          size: 22,
          life: 0,
          maxLife: 35
        });
      }

      // Splash particles
      for (let j = 0; j < 12; j++) {
        particles.push({
          x: target.x,
          y: target.y - 70,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 0,
          maxLife: 20,
          color: p.type === 'vomit' ? '#22c55e' : '#f59e0b',
          size: Math.random() * 6 + 3,
          type: p.type === 'vomit' ? 'toxic' : 'ki'
        });
      }
    }

    if (p.life >= p.maxLife || p.x < -100 || p.x > ARENA_WIDTH + 100) {
      projectiles.splice(i, 1);
    }
  }
}

export function updateParticles(particles: ParticleEffect[]) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.life++;
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.vy += 0.15; // subtle particle gravity
    if (pt.life >= pt.maxLife) {
      particles.splice(i, 1);
    }
  }
}

export function updateFloatingTexts(texts: FloatingText[]) {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    t.life++;
    t.y -= 0.8;
    if (t.life >= t.maxLife) {
      texts.splice(i, 1);
    }
  }
}
