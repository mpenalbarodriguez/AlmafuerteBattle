import { Fighter, KeyControls } from '../types';

export type AIDifficulty = 'facil' | 'normal' | 'dificil';

export class AIController {
  private frameCount = 0;
  private actionCooldown = 0;
  private currentAction: 'none' | 'advance' | 'retreat' | 'block' | 'attack' = 'none';

  public getControls(
    cpu: Fighter, 
    player: Fighter, 
    difficulty: AIDifficulty = 'normal'
  ): KeyControls {
    this.frameCount++;

    const controls: KeyControls = {
      left: false,
      right: false,
      up: false,
      down: false,
      block: false,
      punch: false,
      kick: false,
      special: false
    };

    if (cpu.hitStun > 0 || cpu.blockStun > 0) {
      return controls;
    }

    const dist = Math.abs(cpu.x - player.x);
    const facingPlayer = (player.x > cpu.x && cpu.facing === 1) || (player.x < cpu.x && cpu.facing === -1);
    const playerIsAttacking = [
      'punch', 'kick', 'air_punch', 'air_kick', 'special_prep', 'special_blast'
    ].includes(player.state);

    // Difficulty settings
    const blockChance = difficulty === 'facil' ? 0.2 : difficulty === 'normal' ? 0.55 : 0.88;
    const aggression = difficulty === 'facil' ? 0.4 : difficulty === 'normal' ? 0.7 : 0.95;

    // React to incoming attacks with blocking
    if (playerIsAttacking && dist < 160 && Math.random() < blockChance) {
      controls.block = true;
      // Hold back relative to player
      if (player.x < cpu.x) {
        controls.right = true;
      } else {
        controls.left = true;
      }
      // If player crouch attacks, crouch block
      if (player.state === 'crouch') {
        controls.down = true;
      }
      return controls;
    }

    // Special move trigger: when in good range and meter is ready
    if (cpu.meter >= 25 && dist > 140 && dist < 450 && Math.random() < 0.04 * aggression) {
      controls.special = true;
      return controls;
    }

    // Anti-Air: if player is jumping towards CPU and within strike range
    if (!player.isGrounded && dist < 130 && cpu.isGrounded) {
      if (Math.random() < 0.7) {
        controls.kick = true; // high kick anti-air
      } else {
        controls.up = true;
        controls.punch = true; // air to air
      }
      return controls;
    }

    // Close Range Combat (dist < 95)
    if (dist < 95) {
      const roll = Math.random();
      if (roll < 0.28 * aggression) {
        controls.punch = true;
      } else if (roll < 0.56 * aggression) {
        controls.kick = true;
      } else if (roll < 0.75 * aggression) {
        // Crouch poke
        controls.down = true;
        controls.punch = true;
      } else if (roll < 0.88) {
        // Step back
        if (player.x < cpu.x) controls.right = true;
        else controls.left = true;
      } else {
        // Jump attack
        controls.up = true;
        controls.kick = true;
      }
      return controls;
    }

    // Mid Range (95 <= dist < 220)
    if (dist >= 95 && dist < 220) {
      const roll = Math.random();
      if (roll < 0.45) {
        // Approach
        if (player.x > cpu.x) controls.right = true;
        else controls.left = true;
      } else if (roll < 0.7) {
        // Kick poke
        controls.kick = true;
      } else if (roll < 0.85) {
        // Jump in
        controls.up = true;
        if (player.x > cpu.x) controls.right = true;
        else controls.left = true;
      } else {
        // Feint back
        if (player.x < cpu.x) controls.right = true;
        else controls.left = true;
      }
      return controls;
    }

    // Far Range (dist >= 220)
    // Approach player or throw special if available
    if (player.x > cpu.x) {
      controls.right = true;
    } else {
      controls.left = true;
    }

    // Occasional forward jump
    if (Math.random() < 0.02 * aggression) {
      controls.up = true;
    }

    return controls;
  }
}
