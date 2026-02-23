import GameHUD from '@/components/game/GameHUD';
import HumanFigure from '@/components/game/HumanFigure';
import VirtualJoystick from '@/components/game/VirtualJoystick';
import { COLORS } from '@/constants/color';
import {
    BULLET_SIZE,
    ENEMY_SIZES,
    ENEMY_STATS,
    EnemyType,
    ENV_COLORS,
    GameEffect,
    GameEnemy,
    GameState,
    GameStatus, generateObstacles,
    Mission,
    MISSIONS,
    Obstacle,
    PICKUP_SIZE,
    PLAYER_SIZE,
    TICK_MS,
    Weapon,
    WEAPONS,
    WORLD_SIZE,
} from '@/constants/gameData';
import { usePlayer } from '@/contexts/PlayerContext';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

let bulletCounter = 0;
let floatCounter = 0;
let pickupCounter = 0;
let effectCounter = 0;

const ENEMY_BODY_COLORS: Record<EnemyType, string> = {
  grunt: '#5C3A2E',
  heavy: '#3B3B3B',
  sniper: '#2E4A3A',
  boss: '#4A1A1A',
};

const ENEMY_GUN_COLORS: Record<EnemyType, string> = {
  grunt: '#555',
  heavy: '#444',
  sniper: '#3A3A3A',
  boss: '#2A2A2A',
};

function createEnemy(type: EnemyType, x: number, y: number, patrolRadius: number, index: number): GameEnemy {
  const stats = ENEMY_STATS[type];
  return {
    id: `e_${index}`,
    x, y,
    rotation: Math.random() * Math.PI * 2,
    health: stats.health,
    maxHealth: stats.health,
    type,
    state: 'patrol',
    speed: stats.speed,
    damage: stats.damage,
    attackRange: stats.attackRange,
    alertRange: stats.alertRange,
    patrolCenterX: x,
    patrolCenterY: y,
    patrolRadius,
    patrolTargetX: x + (Math.random() - 0.5) * patrolRadius,
    patrolTargetY: y + (Math.random() - 0.5) * patrolRadius,
    lastAttackTime: 0,
    attackCooldown: stats.attackCooldown,
  };
}

function createInitialState(
  mission: Mission,
  skills: { speed: number; damage: number; health: number },
  weapon: Weapon,
): GameState {
  const maxHp = 100 + skills.health * 20;
  return {
    player: {
      x: WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
      rotation: 0,
      health: maxHp,
      maxHealth: maxHp,
      ammo: weapon.ammo,
      maxAmmo: weapon.ammo,
      speed: 5.5 + skills.speed * 0.5,
    },
    enemies: mission.enemies.map((e, i) => createEnemy(e.type, e.x, e.y, e.patrolRadius, i)),
    bullets: [],
    pickups: [],
    effects: [],
    obstacles: generateObstacles(mission.environment, mission.id),
    floatingTexts: [],
    animFrame: 0,
    score: 0,
    kills: 0,
    headshots: 0,
    combo: 0,
    comboTimer: 0,
    timeElapsed: 0,
    status: 'playing',
    missionId: mission.id,
    objectiveProgress: 0,
    objectiveTotal: mission.enemies.length,
    lastShotTime: 0,
    surviveTimer: mission.timeLimit ?? 0,
  };
}

function updateEnemyAI(enemy: GameEnemy, px: number, py: number, obstacles: Obstacle[]): GameEnemy {
  if (enemy.state === 'dead') return enemy;

  const d = dist(enemy.x, enemy.y, px, py);

  if (d < enemy.attackRange + PLAYER_SIZE) {
    const angle = Math.atan2(py - enemy.y, px - enemy.x);
    let nx = enemy.x;
    let ny = enemy.y;
    if (enemy.type !== 'sniper') {
      nx = enemy.x + Math.cos(angle) * enemy.speed * 0.5;
      ny = enemy.y + Math.sin(angle) * enemy.speed * 0.5;
    }
    nx = clamp(nx, 15, WORLD_SIZE - 15);
    ny = clamp(ny, 15, WORLD_SIZE - 15);
    for (const obs of obstacles) {
      if (nx > obs.x - obs.width / 2 - 10 && nx < obs.x + obs.width / 2 + 10 &&
          ny > obs.y - obs.height / 2 - 10 && ny < obs.y + obs.height / 2 + 10) {
        nx = enemy.x;
        ny = enemy.y;
        break;
      }
    }
    return { ...enemy, x: nx, y: ny, rotation: angle, state: 'attack' };
  }

  if (d < enemy.alertRange) {
    const angle = Math.atan2(py - enemy.y, px - enemy.x);
    let nx = clamp(enemy.x + Math.cos(angle) * enemy.speed, 15, WORLD_SIZE - 15);
    let ny = clamp(enemy.y + Math.sin(angle) * enemy.speed, 15, WORLD_SIZE - 15);
    for (const obs of obstacles) {
      if (nx > obs.x - obs.width / 2 - 10 && nx < obs.x + obs.width / 2 + 10 &&
          ny > obs.y - obs.height / 2 - 10 && ny < obs.y + obs.height / 2 + 10) {
        nx = enemy.x + Math.cos(angle + 0.7) * enemy.speed;
        ny = enemy.y + Math.sin(angle + 0.7) * enemy.speed;
        nx = clamp(nx, 15, WORLD_SIZE - 15);
        ny = clamp(ny, 15, WORLD_SIZE - 15);
        break;
      }
    }
    return { ...enemy, x: nx, y: ny, rotation: angle, state: 'chase' };
  }

  const dTarget = dist(enemy.x, enemy.y, enemy.patrolTargetX, enemy.patrolTargetY);
  let tx = enemy.patrolTargetX;
  let ty = enemy.patrolTargetY;
  if (dTarget < 15) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * enemy.patrolRadius;
    tx = clamp(enemy.patrolCenterX + Math.cos(a) * r, 20, WORLD_SIZE - 20);
    ty = clamp(enemy.patrolCenterY + Math.sin(a) * r, 20, WORLD_SIZE - 20);
  }
  const angle = Math.atan2(ty - enemy.y, tx - enemy.x);
  const spd = enemy.speed * 0.35;
  return {
    ...enemy,
    x: clamp(enemy.x + Math.cos(angle) * spd, 15, WORLD_SIZE - 15),
    y: clamp(enemy.y + Math.sin(angle) * spd, 15, WORLD_SIZE - 15),
    rotation: angle,
    state: 'patrol',
    patrolTargetX: tx,
    patrolTargetY: ty,
  };
}

function spawnBloodEffect(x: number, y: number, count: number): GameEffect[] {
  const effects: GameEffect[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 2;
    effectCounter++;
    effects.push({
      id: `fx${effectCounter}`,
      x, y,
      type: 'blood',
      life: 18 + Math.floor(Math.random() * 10),
      maxLife: 28,
      rotation: angle,
      size: 3 + Math.random() * 4,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
    });
  }
  return effects;
}

function spawnMuzzleFlash(x: number, y: number, angle: number): GameEffect {
  effectCounter++;
  return {
    id: `fx${effectCounter}`,
    x: x + Math.cos(angle) * 18,
    y: y + Math.sin(angle) * 18,
    type: 'muzzle_flash',
    life: 4,
    maxLife: 4,
    rotation: angle,
    size: 12,
    dx: 0, dy: 0,
  };
}

function spawnShellCasing(x: number, y: number, angle: number): GameEffect {
  effectCounter++;
  const ejectAngle = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
  return {
    id: `fx${effectCounter}`,
    x, y,
    type: 'shell_casing',
    life: 20,
    maxLife: 20,
    rotation: ejectAngle,
    size: 3,
    dx: Math.cos(ejectAngle) * 2,
    dy: Math.sin(ejectAngle) * 2,
  };
}

function spawnImpact(x: number, y: number): GameEffect {
  effectCounter++;
  return {
    id: `fx${effectCounter}`,
    x, y,
    type: 'impact',
    life: 8,
    maxLife: 8,
    rotation: Math.random() * Math.PI * 2,
    size: 6,
    dx: 0, dy: 0,
  };
}

export default function GameScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { playerData, addXpAndCoins, completeMission } = usePlayer();

  const mission = MISSIONS.find(m => m.id === missionId) ?? MISSIONS[0];
  const baseWeapon = WEAPONS.find(w => w.id === playerData.currentWeaponId) ?? WEAPONS[0];
  const upgradeLevel = playerData.weaponUpgrades[baseWeapon.id] ?? 0;
  const dmgMult = 1 + upgradeLevel * 0.12 + playerData.skills.damage * 0.1;
  const fireRate = Math.max(80, baseWeapon.fireRate * (1 - upgradeLevel * 0.05));
  const actualDamage = Math.round(baseWeapon.damage * dmgMult);

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(mission, playerData.skills, baseWeapon)
  );
  const [resultsShown, setResultsShown] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);

  const joystickRef = useRef({ x: 0, y: 0 });
  const isShootingRef = useRef(false);
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const handleJoystick = useCallback((x: number, y: number) => {
    joystickRef.current = { x, y };
  }, []);

  useEffect(() => {
    bulletCounter = 0;
    floatCounter = 0;
    pickupCounter = 0;
    effectCounter = 0;

    const interval = setInterval(() => {
      const now = Date.now();
      setGameState(prev => {
        if (prev.status !== 'playing') return prev;
        const dt = TICK_MS / 1000;
        const joy = joystickRef.current;
        const shooting = isShootingRef.current;

        let px = prev.player.x + joy.x * prev.player.speed;
        let py = prev.player.y + joy.y * prev.player.speed;
        px = clamp(px, PLAYER_SIZE, WORLD_SIZE - PLAYER_SIZE);
        py = clamp(py, PLAYER_SIZE, WORLD_SIZE - PLAYER_SIZE);

        for (const obs of prev.obstacles) {
          if (obs.health <= 0) continue;
          const halfW = obs.width / 2 + PLAYER_SIZE * 0.6;
          const halfH = obs.height / 2 + PLAYER_SIZE * 0.6;
          if (px > obs.x - halfW && px < obs.x + halfW && py > obs.y - halfH && py < obs.y + halfH) {
            const overlapLeft = px - (obs.x - halfW);
            const overlapRight = (obs.x + halfW) - px;
            const overlapTop = py - (obs.y - halfH);
            const overlapBottom = (obs.y + halfH) - py;
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            if (minOverlap === overlapLeft) px = obs.x - halfW;
            else if (minOverlap === overlapRight) px = obs.x + halfW;
            else if (minOverlap === overlapTop) py = obs.y - halfH;
            else py = obs.y + halfH;
          }
        }

        let nearestEnemy: GameEnemy | null = null;
        let nearestDist = Infinity;
        for (const e of prev.enemies) {
          if (e.state === 'dead') continue;
          const d = dist(px, py, e.x, e.y);
          if (d < baseWeapon.range && d < nearestDist) {
            nearestDist = d;
            nearestEnemy = e;
          }
        }

        let rotation = prev.player.rotation;
        if (nearestEnemy) {
          rotation = Math.atan2(nearestEnemy.y - py, nearestEnemy.x - px);
        } else if (joy.x !== 0 || joy.y !== 0) {
          rotation = Math.atan2(joy.y, joy.x);
        }

        let bullets = [...prev.bullets];
        let ammo = prev.player.ammo;
        let lastShot = prev.lastShotTime;
        let newEffects: GameEffect[] = [];

        if (shooting && ammo > 0 && now - lastShot > fireRate) {
          lastShot = now;
          ammo--;
          let bdx: number, bdy: number;
          let shootAngle = rotation;
          if (nearestEnemy) {
            const a = Math.atan2(nearestEnemy.y - py, nearestEnemy.x - px);
            const spread = (1 - baseWeapon.accuracy) * 0.5;
            const fa = a + (Math.random() - 0.5) * spread;
            bdx = Math.cos(fa);
            bdy = Math.sin(fa);
            shootAngle = fa;
          } else {
            bdx = Math.cos(rotation);
            bdy = Math.sin(rotation);
          }

          if (baseWeapon.id === 'shotgun') {
            for (let pellet = 0; pellet < 5; pellet++) {
              const spreadAngle = shootAngle + (Math.random() - 0.5) * 0.4;
              bulletCounter++;
              bullets.push({
                id: `b${bulletCounter}`,
                x: px + Math.cos(spreadAngle) * PLAYER_SIZE,
                y: py + Math.sin(spreadAngle) * PLAYER_SIZE,
                dx: Math.cos(spreadAngle),
                dy: Math.sin(spreadAngle),
                speed: 12 + Math.random() * 3,
                damage: Math.round(actualDamage / 5),
                isPlayer: true,
                lifetime: 25,
              });
            }
          } else {
            bulletCounter++;
            bullets.push({
              id: `b${bulletCounter}`,
              x: px + bdx * PLAYER_SIZE,
              y: py + bdy * PLAYER_SIZE,
              dx: bdx,
              dy: bdy,
              speed: baseWeapon.id === 'sniper' ? 22 : 14,
              damage: actualDamage,
              isPlayer: true,
              lifetime: baseWeapon.id === 'sniper' ? 70 : 55,
            });
          }

          newEffects.push(spawnMuzzleFlash(px, py, shootAngle));
          newEffects.push(spawnShellCasing(px, py, shootAngle));
        }

        let enemies = prev.enemies.map(e => updateEnemyAI(e, px, py, prev.obstacles));

        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (e.type !== 'sniper') continue;
          if (e.state === 'dead') continue;
          if (e.state === 'attack' && now - e.lastAttackTime > e.attackCooldown) {
            const a = Math.atan2(py - e.y, px - e.x);
            bulletCounter++;
            bullets.push({
              id: `eb${bulletCounter}`,
              x: e.x + Math.cos(a) * 15,
              y: e.y + Math.sin(a) * 15,
              dx: Math.cos(a),
              dy: Math.sin(a),
              speed: 10,
              damage: e.damage,
              isPlayer: false,
              lifetime: 40,
            });
            enemies[i] = { ...e, lastAttackTime: now };
            newEffects.push(spawnMuzzleFlash(e.x, e.y, a));
          }
        }

        bullets = bullets.map(b => ({
          ...b,
          x: b.x + b.dx * b.speed,
          y: b.y + b.dy * b.speed,
          lifetime: b.lifetime - 1,
        })).filter(b => b.lifetime > 0 && b.x > -20 && b.x < WORLD_SIZE + 20 && b.y > -20 && b.y < WORLD_SIZE + 20);

        let score = prev.score;
        let kills = prev.kills;
        let headshots = prev.headshots;
        let combo = prev.combo;
        let comboTimer = prev.comboTimer - dt;
        let playerHealth = prev.player.health;
        let floatingTexts = [...prev.floatingTexts];
        let pickups = [...prev.pickups];
        let obstacles = [...prev.obstacles];

        const removeBullets = new Set<string>();

        for (const b of bullets) {
          if (!b.isPlayer) continue;
          for (let oi = 0; oi < obstacles.length; oi++) {
            const obs = obstacles[oi];
            if (obs.health <= 0) continue;
            if (b.x > obs.x - obs.width / 2 && b.x < obs.x + obs.width / 2 &&
                b.y > obs.y - obs.height / 2 && b.y < obs.y + obs.height / 2) {
              removeBullets.add(b.id);
              newEffects.push(spawnImpact(b.x, b.y));
              if (obs.type === 'barrel') {
                obstacles[oi] = { ...obs, health: obs.health - b.damage };
              }
              break;
            }
          }
        }

        for (const b of bullets) {
          if (!b.isPlayer || removeBullets.has(b.id)) continue;
          for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (e.state === 'dead') continue;
            const sz = ENEMY_SIZES[e.type];
            if (dist(b.x, b.y, e.x, e.y) < sz + BULLET_SIZE) {
              removeBullets.add(b.id);
              const isHS = Math.random() < 0.18;
              const dmg = isHS ? b.damage * 2.5 : b.damage;
              enemies[i] = { ...e, health: e.health - dmg };
              if (comboTimer > 0) { combo++; } else { combo = 1; }
              comboTimer = 2.5;
              score += 10 * combo + (isHS ? 25 : 0);

              newEffects.push(...spawnBloodEffect(e.x, e.y, isHS ? 6 : 3));

              floatCounter++;
              floatingTexts.push({
                id: `f${floatCounter}`,
                x: e.x, y: e.y - 12,
                text: isHS ? `HEADSHOT! -${Math.round(dmg)}` : `-${Math.round(dmg)}`,
                color: isHS ? '#FFD700' : '#FFFFFF',
                life: 28,
              });
              if (enemies[i].health <= 0) {
                enemies[i] = { ...enemies[i], state: 'dead' };
                kills++;
                if (isHS) headshots++;
                score += 50 * combo;
                newEffects.push(...spawnBloodEffect(e.x, e.y, 8));
                const roll = Math.random();
                if (roll < 0.45) {
                  pickupCounter++;
                  pickups.push({
                    id: `p${pickupCounter}`,
                    x: e.x + (Math.random() - 0.5) * 20,
                    y: e.y + (Math.random() - 0.5) * 20,
                    type: roll < 0.15 ? 'health' : roll < 0.3 ? 'ammo' : 'coin',
                    value: roll < 0.15 ? 25 : roll < 0.3 ? 10 : 20,
                  });
                }
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
              }
              break;
            }
          }
        }

        let gotHit = false;
        for (const b of bullets) {
          if (b.isPlayer || removeBullets.has(b.id)) continue;
          if (dist(b.x, b.y, px, py) < PLAYER_SIZE + BULLET_SIZE) {
            removeBullets.add(b.id);
            playerHealth -= b.damage;
            gotHit = true;
            newEffects.push(...spawnBloodEffect(px, py, 2));
            floatCounter++;
            floatingTexts.push({
              id: `f${floatCounter}`,
              x: px, y: py - 15,
              text: `-${b.damage}`,
              color: '#EF4444',
              life: 22,
            });
          }
        }

        for (const e of enemies) {
          if (e.state === 'dead' || e.state !== 'attack' || e.type === 'sniper') continue;
          if (dist(e.x, e.y, px, py) < e.attackRange + PLAYER_SIZE) {
            if (now - e.lastAttackTime > e.attackCooldown) {
              e.lastAttackTime = now;
              playerHealth -= e.damage;
              gotHit = true;
              newEffects.push(...spawnBloodEffect(px, py, 3));
              floatCounter++;
              floatingTexts.push({
                id: `f${floatCounter}`,
                x: px, y: py - 18,
                text: `-${e.damage}`,
                color: '#EF4444',
                life: 22,
              });
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
            }
          }
        }

        if (gotHit) {
          setHitFlash(true);
          setTimeout(() => setHitFlash(false), 120);
        }

        bullets = bullets.filter(b => !removeBullets.has(b.id));

        pickups = pickups.filter(p => {
          if (dist(px, py, p.x, p.y) < PLAYER_SIZE + PICKUP_SIZE / 2) {
            if (p.type === 'health') playerHealth = Math.min(prev.player.maxHealth, playerHealth + p.value);
            else if (p.type === 'ammo') ammo = Math.min(prev.player.maxAmmo, ammo + p.value);
            else score += p.value;
            return false;
          }
          return true;
        });

        floatingTexts = floatingTexts
          .map(ft => ({ ...ft, y: ft.y - 0.6, life: ft.life - 1 }))
          .filter(ft => ft.life > 0);

        let effects = [...prev.effects, ...newEffects]
          .map(fx => ({
            ...fx,
            x: fx.x + fx.dx,
            y: fx.y + fx.dy,
            dx: fx.dx * 0.92,
            dy: fx.dy * 0.92,
            life: fx.life - 1,
          }))
          .filter(fx => fx.life > 0);

        let status: GameStatus = 'playing';
        const alive = enemies.filter(e => e.state !== 'dead').length;
        const progress = prev.objectiveTotal - alive;

        if (playerHealth <= 0) {
          status = 'lost';
          playerHealth = 0;
        }

        let surviveTimer = prev.surviveTimer;
        if (mission.objective === 'survive') {
          surviveTimer = Math.max(0, surviveTimer - dt);
          if (surviveTimer <= 0 && status === 'playing') status = 'won';
        } else {
          if (alive === 0 && status === 'playing') status = 'won';
        }

        return {
          ...prev,
          player: { ...prev.player, x: px, y: py, rotation, health: playerHealth, ammo },
          enemies,
          bullets,
          pickups,
          effects,
          obstacles,
          floatingTexts,
          animFrame: prev.animFrame + 1,
          score,
          kills,
          headshots,
          combo,
          comboTimer,
          timeElapsed: prev.timeElapsed + dt,
          status,
          objectiveProgress: Math.max(0, progress),
          lastShotTime: lastShot,
          surviveTimer,
        };
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if ((gameState.status === 'won' || gameState.status === 'lost') && !resultsShown) {
      setResultsShown(true);
      if (gameState.status === 'won') {
        const healthPct = gameState.player.health / gameState.player.maxHealth;
        const stars = healthPct > 0.75 ? 3 : healthPct > 0.4 ? 2 : 1;
        addXpAndCoins(mission.xpReward, mission.coinReward, gameState.kills, gameState.headshots);
        completeMission(mission.id, stars);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      } else {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      }
    }
  }, [gameState.status, resultsShown]);

  const cameraX = gameState.player.x - width / 2;
  const cameraY = gameState.player.y - height / 2;
  const envColors = ENV_COLORS[mission.environment];
  const isPlayerMoving = joystickRef.current.x !== 0 || joystickRef.current.y !== 0;

  const GRID_SIZE = 100;
  const healthPct = gameState.player.maxHealth > 0 ? gameState.player.health / gameState.player.maxHealth : 0;
  const resultStars = healthPct > 0.75 ? 3 : healthPct > 0.4 ? 2 : 1;

  return (
    <View style={[styles.container, { backgroundColor: envColors.bg }]}>
      <View style={styles.worldContainer}>
        {(() => {
          const lines: React.ReactNode[] = [];
          const sx = Math.floor(cameraX / GRID_SIZE) * GRID_SIZE;
          for (let x = sx; x < cameraX + width + GRID_SIZE; x += GRID_SIZE) {
            lines.push(
              <View
                key={`gv${x}`}
                style={{
                  position: 'absolute' as const,
                  left: x - cameraX,
                  top: 0,
                  width: 1,
                  height,
                  backgroundColor: envColors.grid,
                }}
              />
            );
          }
          const sy = Math.floor(cameraY / GRID_SIZE) * GRID_SIZE;
          for (let y = sy; y < cameraY + height + GRID_SIZE; y += GRID_SIZE) {
            lines.push(
              <View
                key={`gh${y}`}
                style={{
                  position: 'absolute' as const,
                  left: 0,
                  top: y - cameraY,
                  width,
                  height: 1,
                  backgroundColor: envColors.grid,
                }}
              />
            );
          }
          return lines;
        })()}

        {gameState.obstacles.map(obs => {
          if (obs.health <= 0) return null;
          const sx = obs.x - cameraX;
          const sy = obs.y - cameraY;
          if (sx < -obs.width - 20 || sx > width + obs.width + 20 || sy < -obs.height - 20 || sy > height + obs.height + 20) return null;

          const baseColor = obs.color;
          const borderClr = obs.type === 'barrel' ? '#8B4513' : obs.type === 'vehicle' ? '#555' : 'rgba(255,255,255,0.08)';
          const rad = obs.type === 'barrel' ? obs.width / 2 : obs.type === 'crate' ? 3 : 2;

          return (
            <View key={obs.id} style={{
              position: 'absolute' as const,
              left: sx - obs.width / 2,
              top: sy - obs.height / 2,
              width: obs.width,
              height: obs.height,
              backgroundColor: baseColor,
              borderRadius: rad,
              borderWidth: 1,
              borderColor: borderClr,
            }}>
              {obs.type === 'crate' && (
                <View style={{
                  position: 'absolute' as const,
                  left: 3, top: 3, right: 3, bottom: 3,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 1,
                }} />
              )}
              {obs.type === 'barrel' && (
                <View style={{
                  position: 'absolute' as const,
                  top: obs.height * 0.3,
                  left: 2, right: 2,
                  height: 2,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }} />
              )}
              {obs.type === 'vehicle' && (
                <>
                  <View style={{
                    position: 'absolute' as const,
                    top: 2, left: obs.width * 0.15,
                    width: obs.width * 0.7, height: obs.height * 0.4,
                    backgroundColor: 'rgba(100,150,200,0.15)',
                    borderRadius: 2,
                  }} />
                  <View style={{
                    position: 'absolute' as const,
                    bottom: -4, left: 6,
                    width: 8, height: 8,
                    borderRadius: 4,
                    backgroundColor: '#333',
                    borderWidth: 1,
                    borderColor: '#555',
                  }} />
                  <View style={{
                    position: 'absolute' as const,
                    bottom: -4, right: 6,
                    width: 8, height: 8,
                    borderRadius: 4,
                    backgroundColor: '#333',
                    borderWidth: 1,
                    borderColor: '#555',
                  }} />
                </>
              )}
            </View>
          );
        })}

        {gameState.pickups.map(p => {
          const sx = p.x - cameraX;
          const sy = p.y - cameraY;
          if (sx < -30 || sx > width + 30 || sy < -30 || sy > height + 30) return null;
          const color =
            p.type === 'health' ? COLORS.pickupHealth :
            p.type === 'ammo' ? COLORS.pickupAmmo :
            COLORS.pickupCoin;
          return (
            <View key={p.id} style={{
              position: 'absolute' as const,
              left: sx - PICKUP_SIZE / 2,
              top: sy - PICKUP_SIZE / 2,
              width: PICKUP_SIZE,
              height: PICKUP_SIZE,
              borderRadius: 3,
              backgroundColor: color,
              opacity: 0.85,
              transform: [{ rotate: '45deg' }],
            }} />
          );
        })}

        {gameState.effects.map(fx => {
          const sx = fx.x - cameraX;
          const sy = fx.y - cameraY;
          if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) return null;
          const opacity = Math.min(1, fx.life / (fx.maxLife * 0.3));

          if (fx.type === 'blood') {
            return (
              <View key={fx.id} style={{
                position: 'absolute' as const,
                left: sx - fx.size / 2,
                top: sy - fx.size / 2,
                width: fx.size,
                height: fx.size,
                borderRadius: fx.size / 2,
                backgroundColor: '#8B0000',
                opacity: opacity * 0.9,
              }} />
            );
          }
          if (fx.type === 'muzzle_flash') {
            return (
              <View key={fx.id} style={{
                position: 'absolute' as const,
                left: sx - fx.size / 2,
                top: sy - fx.size / 2,
                width: fx.size,
                height: fx.size,
                borderRadius: fx.size / 2,
                backgroundColor: '#FFDD44',
                opacity: opacity,
                shadowColor: '#FFAA00',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 8,
              }}>
                <View style={{
                  position: 'absolute' as const,
                  left: fx.size * 0.2,
                  top: fx.size * 0.2,
                  width: fx.size * 0.6,
                  height: fx.size * 0.6,
                  borderRadius: fx.size * 0.3,
                  backgroundColor: '#FFFFFF',
                }} />
              </View>
            );
          }
          if (fx.type === 'shell_casing') {
            return (
              <View key={fx.id} style={{
                position: 'absolute' as const,
                left: sx - 1.5,
                top: sy - 1.5,
                width: 3,
                height: 5,
                borderRadius: 1,
                backgroundColor: '#C8A84E',
                opacity: opacity * 0.7,
                transform: [{ rotate: `${fx.rotation}rad` }],
              }} />
            );
          }
          if (fx.type === 'impact') {
            return (
              <View key={fx.id} style={{
                position: 'absolute' as const,
                left: sx - fx.size / 2,
                top: sy - fx.size / 2,
                width: fx.size,
                height: fx.size,
                borderRadius: fx.size / 2,
                backgroundColor: 'rgba(200,200,200,0.3)',
                opacity,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }} />
            );
          }
          return null;
        })}

        {gameState.enemies.map(e => {
          const sx = e.x - cameraX;
          const sy = e.y - cameraY;
          const size = ENEMY_SIZES[e.type];
          const figSize = size * 1.3;
          if (sx < -figSize * 3 || sx > width + figSize * 3 || sy < -figSize * 3 || sy > height + figSize * 3) return null;

          const hpPct = e.health / e.maxHealth;
          const bodyColor = ENEMY_BODY_COLORS[e.type];
          const gunColor = ENEMY_GUN_COLORS[e.type];

          return (
            <View key={e.id} style={{
              position: 'absolute' as const,
              left: sx - figSize * 1.3,
              top: sy - figSize * 1.3,
            }}>
              <HumanFigure
                size={figSize}
                color={bodyColor}
                rotation={e.rotation}
                isMoving={e.state === 'chase' || e.state === 'patrol'}
                isDead={e.state === 'dead'}
                gunColor={gunColor}
                animFrame={gameState.animFrame}
              />
              {e.state !== 'dead' && hpPct < 1 && (
                <View style={{
                  position: 'absolute' as const,
                  top: -4,
                  left: figSize * 1.3 - 15,
                  width: 30,
                  height: 3,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 2,
                  overflow: 'hidden' as const,
                }}>
                  <View style={{
                    width: `${hpPct * 100}%` as any,
                    height: '100%' as any,
                    backgroundColor: hpPct > 0.5 ? '#EF4444' : '#FF6B35',
                    borderRadius: 2,
                  }} />
                </View>
              )}
              {e.state !== 'dead' && (e.state === 'chase' || e.state === 'attack') && (
                <View style={{
                  position: 'absolute' as const,
                  top: -10,
                  left: figSize * 1.3 - 3,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: e.state === 'attack' ? '#EF4444' : '#F59E0B',
                }} />
              )}
            </View>
          );
        })}

        {gameState.bullets.map(b => {
          const sx = b.x - cameraX;
          const sy = b.y - cameraY;
          if (sx < -10 || sx > width + 10 || sy < -10 || sy > height + 10) return null;
          const angle = Math.atan2(b.dy, b.dx);
          const trailLen = b.isPlayer ? 10 : 6;
          return (
            <View key={b.id}>
              <View style={{
                position: 'absolute' as const,
                left: sx - trailLen / 2,
                top: sy - 1,
                width: trailLen,
                height: 2,
                backgroundColor: b.isPlayer ? 'rgba(251,191,36,0.4)' : 'rgba(239,68,68,0.4)',
                borderRadius: 1,
                transform: [{ rotate: `${angle}rad` }],
              }} />
              <View style={{
                position: 'absolute' as const,
                left: sx - BULLET_SIZE / 2,
                top: sy - BULLET_SIZE / 2,
                width: BULLET_SIZE,
                height: BULLET_SIZE,
                borderRadius: BULLET_SIZE / 2,
                backgroundColor: b.isPlayer ? COLORS.bulletPlayer : COLORS.bulletEnemy,
                shadowColor: b.isPlayer ? '#FBBF24' : '#EF4444',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
              }} />
            </View>
          );
        })}

        <View style={{
          position: 'absolute' as const,
          left: width / 2 - PLAYER_SIZE * 1.6,
          top: height / 2 - PLAYER_SIZE * 1.6,
        }}>
          <HumanFigure
            size={PLAYER_SIZE * 1.3}
            color="#1B3A4B"
            rotation={gameState.player.rotation}
            isMoving={isPlayerMoving}
            isPlayer
            gunColor="#555"
            animFrame={gameState.animFrame}
          />
        </View>

        {gameState.floatingTexts.map(ft => {
          const sx = ft.x - cameraX;
          const sy = ft.y - cameraY;
          if (sx < -60 || sx > width + 60 || sy < -30 || sy > height + 30) return null;
          return (
            <Text
              key={ft.id}
              style={[styles.floatingText, {
                left: sx - 40,
                top: sy,
                color: ft.color,
                opacity: Math.min(1, ft.life / 10),
              }]}
            >
              {ft.text}
            </Text>
          );
        })}
      </View>

      {hitFlash && (
        <View style={styles.hitFlashOverlay} pointerEvents="none" />
      )}

      <GameHUD gameState={gameState} weaponName={baseWeapon.name} topInset={insets.top} />

      <View style={[styles.controlsRow, { bottom: insets.bottom + 20 }]}>
        <VirtualJoystick onMove={handleJoystick} />
        <View style={styles.rightControls}>
          <Pressable
            style={[styles.fireBtn, isShootingRef.current && styles.fireBtnActive]}
            onPressIn={() => { isShootingRef.current = true; }}
            onPressOut={() => { isShootingRef.current = false; }}
          >
            <View style={styles.fireCrosshair}>
              <View style={styles.fireH} />
              <View style={styles.fireV} />
              <View style={styles.fireCenter} />
            </View>
          </Pressable>
          <View style={styles.ammoIndicator}>
            <Text style={styles.ammoText}>{gameState.player.ammo}</Text>
          </View>
        </View>
      </View>

      {resultsShown && (
        <View style={styles.overlay}>
          <View style={styles.resultCard}>
            <Text style={[styles.resultTitle, {
              color: gameState.status === 'won' ? COLORS.success : COLORS.danger,
            }]}>
              {gameState.status === 'won' ? 'MISSION COMPLETE' : 'MISSION FAILED'}
            </Text>

            {gameState.status === 'won' && (
              <View style={styles.starsRow}>
                {[1, 2, 3].map(i => (
                  <Star
                    key={i}
                    size={28}
                    color={i <= resultStars ? COLORS.primary : COLORS.textDim}
                    fill={i <= resultStars ? COLORS.primary : 'transparent'}
                  />
                ))}
              </View>
            )}

            <View style={styles.resultStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Score</Text>
                <Text style={styles.statValue}>{gameState.score}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Kills</Text>
                <Text style={styles.statValue}>{gameState.kills}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Headshots</Text>
                <Text style={styles.statValue}>{gameState.headshots}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={styles.statValue}>{Math.floor(gameState.timeElapsed)}s</Text>
              </View>
            </View>

            {gameState.status === 'won' && (
              <View style={styles.rewardsBlock}>
                <Text style={styles.rewardLine}>+{mission.xpReward} XP</Text>
                <Text style={styles.rewardLine}>+{mission.coinReward} Coins</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.8 }]}
              onPress={() => {
                router.replace('/' as any);
              }}
            >
              <Text style={styles.continueText}>CONTINUE</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  worldContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  floatingText: {
    position: 'absolute',
    width: 80,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800' as const,
  },
  hitFlashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 4,
    borderColor: 'rgba(239,68,68,0.5)',
  },
  controlsRow: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rightControls: {
    alignItems: 'center',
    gap: 6,
  },
  fireBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(239,68,68,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireBtnActive: {
    backgroundColor: 'rgba(239,68,68,0.45)',
    borderColor: 'rgba(239,68,68,0.8)',
  },
  fireCrosshair: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireH: {
    position: 'absolute',
    width: 24,
    height: 2,
    backgroundColor: COLORS.danger,
    borderRadius: 1,
  },
  fireV: {
    position: 'absolute',
    width: 2,
    height: 24,
    backgroundColor: COLORS.danger,
    borderRadius: 1,
  },
  fireCenter: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF6666',
  },
  ammoIndicator: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ammoText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '900' as const,
    letterSpacing: 2,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  resultStats: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  rewardsBlock: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  rewardLine: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
  },
  continueText: {
    color: COLORS.bg,
    fontSize: 15,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
});
