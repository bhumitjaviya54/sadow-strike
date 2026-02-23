export const WORLD_SIZE = 1500;
export const TICK_MS = 33;
export const PLAYER_SIZE = 24;
export const BULLET_SIZE = 6;
export const PICKUP_SIZE = 16;

export const ENEMY_SIZES: Record<EnemyType, number> = {
  grunt: 20,
  heavy: 28,
  sniper: 22,
  boss: 36,
};

export type EnemyType = 'grunt' | 'heavy' | 'sniper' | 'boss';
export type EnemyState = 'patrol' | 'chase' | 'attack' | 'dead';
export type Environment = 'city' | 'jungle' | 'desert' | 'military';
export type ObjectiveType = 'eliminate' | 'survive' | 'boss';
export type PickupType = 'health' | 'ammo' | 'coin';
export type EffectType = 'blood' | 'muzzle_flash' | 'shell_casing' | 'impact';
export type GameStatus = 'playing' | 'won' | 'lost' | 'paused';

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  ammo: number;
  range: number;
  accuracy: number;
  price: number;
  unlockLevel: number;
  description: string;
}

export interface MissionEnemy {
  type: EnemyType;
  x: number;
  y: number;
  patrolRadius: number;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  briefing: string;
  environment: Environment;
  objective: ObjectiveType;
  enemies: MissionEnemy[];
  difficulty: number;
  xpReward: number;
  coinReward: number;
  unlockLevel: number;
  timeLimit?: number;
}

export interface PlayerData {
  level: number;
  xp: number;
  coins: number;
  currentWeaponId: string;
  unlockedWeapons: string[];
  weaponUpgrades: Record<string, number>;
  completedMissions: Record<string, number>;
  totalKills: number;
  totalHeadshots: number;
  totalMissions: number;
  skills: {
    speed: number;
    damage: number;
    health: number;
  };
  lastDailyReward: string | null;
}

export interface GamePlayer {
  x: number;
  y: number;
  rotation: number;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  speed: number;
}

export interface GameEnemy {
  id: string;
  x: number;
  y: number;
  rotation: number;
  health: number;
  maxHealth: number;
  type: EnemyType;
  state: EnemyState;
  speed: number;
  damage: number;
  attackRange: number;
  alertRange: number;
  patrolCenterX: number;
  patrolCenterY: number;
  patrolRadius: number;
  patrolTargetX: number;
  patrolTargetY: number;
  lastAttackTime: number;
  attackCooldown: number;
}

export interface GameBullet {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  damage: number;
  isPlayer: boolean;
  lifetime: number;
}

export interface GamePickup {
  id: string;
  x: number;
  y: number;
  type: PickupType;
  value: number;
}

export interface GameEffect {
  id: string;
  x: number;
  y: number;
  type: EffectType;
  life: number;
  maxLife: number;
  rotation: number;
  size: number;
  dx: number;
  dy: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'crate' | 'barrel' | 'wall' | 'sandbag' | 'vehicle';
  color: string;
  health: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface GameState {
  player: GamePlayer;
  enemies: GameEnemy[];
  bullets: GameBullet[];
  pickups: GamePickup[];
  effects: GameEffect[];
  obstacles: Obstacle[];
  floatingTexts: FloatingText[];
  animFrame: number;
  score: number;
  kills: number;
  headshots: number;
  combo: number;
  comboTimer: number;
  timeElapsed: number;
  status: GameStatus;
  missionId: string;
  objectiveProgress: number;
  objectiveTotal: number;
  lastShotTime: number;
  surviveTimer: number;
}

export function xpForLevel(level: number): number {
  return level * 120;
}

export const DEFAULT_PLAYER_DATA: PlayerData = {
  level: 1,
  xp: 0,
  coins: 200,
  currentWeaponId: 'pistol',
  unlockedWeapons: ['pistol'],
  weaponUpgrades: {},
  completedMissions: {},
  totalKills: 0,
  totalHeadshots: 0,
  totalMissions: 0,
  skills: { speed: 0, damage: 0, health: 0 },
  lastDailyReward: null,
};

export const WEAPONS: Weapon[] = [
  {
    id: 'pistol',
    name: 'M9 Pistol',
    damage: 18,
    fireRate: 380,
    ammo: 30,
    range: 260,
    accuracy: 0.85,
    price: 0,
    unlockLevel: 1,
    description: 'Standard issue sidearm. Reliable and accurate.',
  },
  {
    id: 'rifle',
    name: 'M4A1 Rifle',
    damage: 22,
    fireRate: 180,
    ammo: 60,
    range: 340,
    accuracy: 0.72,
    price: 600,
    unlockLevel: 3,
    description: 'Fully automatic assault rifle. High fire rate.',
  },
  {
    id: 'shotgun',
    name: 'SPAS-12',
    damage: 45,
    fireRate: 750,
    ammo: 16,
    range: 140,
    accuracy: 0.55,
    price: 900,
    unlockLevel: 5,
    description: 'Devastating at close range. Spread shot pattern.',
  },
  {
    id: 'sniper',
    name: 'AWP Sniper',
    damage: 90,
    fireRate: 1100,
    ammo: 10,
    range: 500,
    accuracy: 0.95,
    price: 1400,
    unlockLevel: 7,
    description: 'One shot, one kill. Extreme range precision.',
  },
];

export const MISSIONS: Mission[] = [
  {
    id: 'mission_1',
    name: 'Training Ground',
    description: 'Eliminate all hostiles in the training facility.',
    briefing: 'Welcome, Agent. This is your first deployment. Intel reports 5 hostiles in the training sector. Neutralize all targets to prove your readiness.',
    environment: 'city',
    objective: 'eliminate',
    difficulty: 1,
    xpReward: 80,
    coinReward: 100,
    unlockLevel: 1,
    enemies: [
      { type: 'grunt', x: 400, y: 300, patrolRadius: 120 },
      { type: 'grunt', x: 1100, y: 400, patrolRadius: 100 },
      { type: 'grunt', x: 600, y: 1100, patrolRadius: 130 },
      { type: 'grunt', x: 1050, y: 950, patrolRadius: 100 },
      { type: 'grunt', x: 300, y: 700, patrolRadius: 110 },
    ],
  },
  {
    id: 'mission_2',
    name: 'Urban Assault',
    description: 'Clear enemy forces from the downtown district.',
    briefing: 'Hostile forces have fortified downtown. We need you to sweep the area. Expect heavier resistance — some enemies are armored.',
    environment: 'city',
    objective: 'eliminate',
    difficulty: 2,
    xpReward: 140,
    coinReward: 180,
    unlockLevel: 2,
    enemies: [
      { type: 'grunt', x: 350, y: 250, patrolRadius: 100 },
      { type: 'grunt', x: 900, y: 300, patrolRadius: 120 },
      { type: 'grunt', x: 500, y: 800, patrolRadius: 100 },
      { type: 'heavy', x: 1100, y: 600, patrolRadius: 80 },
      { type: 'grunt', x: 700, y: 1100, patrolRadius: 110 },
      { type: 'heavy', x: 400, y: 1000, patrolRadius: 90 },
      { type: 'grunt', x: 1000, y: 1000, patrolRadius: 100 },
      { type: 'grunt', x: 200, y: 500, patrolRadius: 120 },
    ],
  },
  {
    id: 'mission_3',
    name: 'Jungle Recon',
    description: 'Hunt down enemy patrols in dense jungle terrain.',
    briefing: 'Deep jungle operations. Enemy snipers have been spotted among the trees. Move carefully and eliminate all threats.',
    environment: 'jungle',
    objective: 'eliminate',
    difficulty: 3,
    xpReward: 200,
    coinReward: 250,
    unlockLevel: 3,
    enemies: [
      { type: 'grunt', x: 300, y: 200, patrolRadius: 140 },
      { type: 'sniper', x: 1100, y: 300, patrolRadius: 60 },
      { type: 'grunt', x: 500, y: 600, patrolRadius: 120 },
      { type: 'heavy', x: 800, y: 400, patrolRadius: 80 },
      { type: 'grunt', x: 1000, y: 800, patrolRadius: 100 },
      { type: 'sniper', x: 400, y: 1100, patrolRadius: 50 },
      { type: 'grunt', x: 700, y: 1000, patrolRadius: 130 },
      { type: 'heavy', x: 200, y: 800, patrolRadius: 90 },
      { type: 'grunt', x: 1200, y: 1100, patrolRadius: 100 },
      { type: 'grunt', x: 600, y: 300, patrolRadius: 110 },
    ],
  },
  {
    id: 'mission_4',
    name: 'Desert Storm',
    description: 'Survive incoming waves of enemies in the scorching desert.',
    briefing: 'You are surrounded. Enemy forces are converging on your position. Hold your ground for 60 seconds until extraction arrives.',
    environment: 'desert',
    objective: 'survive',
    difficulty: 3,
    xpReward: 250,
    coinReward: 300,
    unlockLevel: 4,
    timeLimit: 60,
    enemies: [
      { type: 'grunt', x: 200, y: 200, patrolRadius: 150 },
      { type: 'grunt', x: 1300, y: 200, patrolRadius: 150 },
      { type: 'grunt', x: 200, y: 1300, patrolRadius: 150 },
      { type: 'grunt', x: 1300, y: 1300, patrolRadius: 150 },
      { type: 'heavy', x: 750, y: 200, patrolRadius: 100 },
      { type: 'heavy', x: 750, y: 1300, patrolRadius: 100 },
      { type: 'grunt', x: 400, y: 750, patrolRadius: 130 },
      { type: 'grunt', x: 1100, y: 750, patrolRadius: 130 },
    ],
  },
  {
    id: 'mission_5',
    name: 'Base Infiltration',
    description: 'Breach the enemy military base and eliminate all personnel.',
    briefing: 'This is it, Agent. Full-scale assault on the enemy base. Heavy armor and snipers are confirmed. Bring your best gear.',
    environment: 'military',
    objective: 'eliminate',
    difficulty: 4,
    xpReward: 350,
    coinReward: 400,
    unlockLevel: 5,
    enemies: [
      { type: 'grunt', x: 300, y: 300, patrolRadius: 100 },
      { type: 'grunt', x: 600, y: 200, patrolRadius: 120 },
      { type: 'heavy', x: 1000, y: 300, patrolRadius: 80 },
      { type: 'sniper', x: 1200, y: 500, patrolRadius: 50 },
      { type: 'grunt', x: 400, y: 700, patrolRadius: 110 },
      { type: 'heavy', x: 800, y: 600, patrolRadius: 90 },
      { type: 'grunt', x: 1100, y: 800, patrolRadius: 100 },
      { type: 'sniper', x: 300, y: 1000, patrolRadius: 60 },
      { type: 'heavy', x: 700, y: 1100, patrolRadius: 80 },
      { type: 'grunt', x: 1000, y: 1100, patrolRadius: 120 },
      { type: 'grunt', x: 500, y: 500, patrolRadius: 100 },
      { type: 'grunt', x: 900, y: 900, patrolRadius: 110 },
    ],
  },
  {
    id: 'mission_6',
    name: 'Final Showdown',
    description: 'Confront the enemy commander in a final boss battle.',
    briefing: 'The enemy commander awaits. This is the most dangerous mission yet. The commander is heavily armored with elite guards. Good luck, Agent.',
    environment: 'military',
    objective: 'boss',
    difficulty: 5,
    xpReward: 500,
    coinReward: 600,
    unlockLevel: 7,
    enemies: [
      { type: 'grunt', x: 400, y: 400, patrolRadius: 100 },
      { type: 'grunt', x: 1100, y: 400, patrolRadius: 100 },
      { type: 'heavy', x: 400, y: 1000, patrolRadius: 80 },
      { type: 'heavy', x: 1100, y: 1000, patrolRadius: 80 },
      { type: 'sniper', x: 300, y: 700, patrolRadius: 50 },
      { type: 'sniper', x: 1200, y: 700, patrolRadius: 50 },
      { type: 'boss', x: 750, y: 400, patrolRadius: 60 },
    ],
  },
];

export const ENV_COLORS: Record<Environment, { bg: string; grid: string; accent: string; ground: string; obstacleColor: string }> = {
  city: { bg: '#0D1117', grid: '#1B2230', accent: '#3B82F6', ground: '#161D2A', obstacleColor: '#2A3444' },
  jungle: { bg: '#0A1510', grid: '#15261D', accent: '#22C55E', ground: '#0D1A12', obstacleColor: '#1A3020' },
  desert: { bg: '#1A1408', grid: '#2A2210', accent: '#F59E0B', ground: '#1E1A0E', obstacleColor: '#3A3018' },
  military: { bg: '#0F1210', grid: '#1A201C', accent: '#6B7280', ground: '#141816', obstacleColor: '#252C28' },
};

export function generateObstacles(env: Environment, missionId: string): Obstacle[] {
  const colors = ENV_COLORS[env];
  const seed = missionId.charCodeAt(missionId.length - 1) || 42;
  const obstacles: Obstacle[] = [];
  const pseudoRandom = (i: number) => {
    const x = Math.sin(seed * 9301 + i * 4973) * 10000;
    return x - Math.floor(x);
  };

  const types: Array<'crate' | 'barrel' | 'wall' | 'sandbag' | 'vehicle'> = ['crate', 'barrel', 'wall', 'sandbag', 'vehicle'];
  const count = 12 + Math.floor(pseudoRandom(0) * 8);

  for (let i = 0; i < count; i++) {
    const t = types[Math.floor(pseudoRandom(i * 3 + 1) * types.length)];
    let w = 30, h = 30;
    if (t === 'wall') { w = 60 + pseudoRandom(i * 7) * 80; h = 12; }
    else if (t === 'vehicle') { w = 60; h = 30; }
    else if (t === 'sandbag') { w = 50; h = 16; }
    else if (t === 'barrel') { w = 20; h = 20; }

    const ox = 100 + pseudoRandom(i * 5 + 2) * (WORLD_SIZE - 200);
    const oy = 100 + pseudoRandom(i * 5 + 3) * (WORLD_SIZE - 200);
    const centerDist = Math.sqrt((ox - WORLD_SIZE / 2) ** 2 + (oy - WORLD_SIZE / 2) ** 2);
    if (centerDist < 80) continue;

    obstacles.push({
      id: `obs_${i}`,
      x: ox, y: oy,
      width: w, height: h,
      type: t,
      color: colors.obstacleColor,
      health: t === 'barrel' ? 30 : 999,
    });
  }
  return obstacles;
}

export const ENEMY_STATS: Record<EnemyType, {
  health: number;
  speed: number;
  damage: number;
  attackRange: number;
  alertRange: number;
  attackCooldown: number;
  xpValue: number;
}> = {
  grunt: { health: 40, speed: 3.2, damage: 8, attackRange: 30, alertRange: 220, attackCooldown: 1000, xpValue: 10 },
  heavy: { health: 90, speed: 2.0, damage: 15, attackRange: 35, alertRange: 200, attackCooldown: 1500, xpValue: 25 },
  sniper: { health: 30, speed: 1.6, damage: 20, attackRange: 320, alertRange: 380, attackCooldown: 1800, xpValue: 20 },
  boss: { health: 300, speed: 2.6, damage: 25, attackRange: 40, alertRange: 320, attackCooldown: 800, xpValue: 100 },
};

export const SKILL_COSTS = [100, 250, 500, 800, 1200];
export const SKILL_MAX = 5;
export const UPGRADE_COSTS = [200, 400, 700, 1100];
export const UPGRADE_MAX = 4;
