import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/color';
import { GameState, WORLD_SIZE } from '@/constants/gameData';

interface GameHUDProps {
  gameState: GameState;
  weaponName: string;
  topInset: number;
}

function GameHUD({ gameState, weaponName, topInset }: GameHUDProps) {
  const { player, enemies, score, kills, combo, comboTimer, timeElapsed, objectiveProgress, objectiveTotal, surviveTimer } = gameState;
  const healthPct = Math.max(0, player.health / player.maxHealth);
  const healthColor = healthPct > 0.5 ? COLORS.success : healthPct > 0.25 ? COLORS.primaryLight : COLORS.danger;
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);

  return (
    <View style={[styles.container, { paddingTop: topInset + 4 }]} pointerEvents="none">
      <View style={styles.topRow}>
        <View style={styles.healthBlock}>
          <View style={styles.healthBarBg}>
            <View style={[styles.healthBarFill, { width: `${healthPct * 100}%`, backgroundColor: healthColor }]} />
          </View>
          <View style={styles.healthInfoRow}>
            <Text style={styles.healthText}>{Math.ceil(player.health)}/{player.maxHealth}</Text>
            <Text style={styles.healthLabel}>HP</Text>
          </View>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreText}>{score}</Text>
          {combo > 1 && comboTimer > 0 && (
            <View style={styles.comboBadge}>
              <Text style={styles.comboText}>x{combo}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.weaponBlock}>
          <View style={styles.weaponIcon}>
            <View style={styles.gunBarrel} />
            <View style={styles.gunBody} />
          </View>
          <View>
            <Text style={styles.weaponName}>{weaponName}</Text>
            <Text style={styles.ammoNumber}>{player.ammo}/{player.maxAmmo}</Text>
          </View>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeText}>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</Text>
        </View>
        <View style={styles.objectiveBlock}>
          {surviveTimer > 0 ? (
            <Text style={styles.objectiveText}>SURVIVE {Math.ceil(surviveTimer)}s</Text>
          ) : (
            <Text style={styles.objectiveText}>{objectiveProgress}/{objectiveTotal}</Text>
          )}
          <Text style={styles.killsText}>{kills} kills</Text>
        </View>
      </View>

      <View style={styles.miniMapContainer}>
        <View style={styles.miniMap}>
          <View style={styles.miniMapBorder} />
          <View
            style={[
              styles.miniDot,
              {
                backgroundColor: COLORS.playerColor,
                left: (player.x / WORLD_SIZE) * 74 - 3,
                top: (player.y / WORLD_SIZE) * 74 - 3,
                width: 6,
                height: 6,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.5)',
              },
            ]}
          />
          {enemies.filter(e => e.state !== 'dead').map(e => (
            <View
              key={e.id}
              style={[
                styles.miniDot,
                {
                  backgroundColor: e.state === 'chase' || e.state === 'attack' ? COLORS.danger : '#AA4444',
                  left: (e.x / WORLD_SIZE) * 74 - 2,
                  top: (e.y / WORLD_SIZE) * 74 - 2,
                  width: 4,
                  height: 4,
                },
              ]}
            />
          ))}
          {gameState.obstacles.slice(0, 20).map(obs => (
            obs.health > 0 ? (
              <View
                key={obs.id}
                style={[
                  styles.miniDot,
                  {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    left: (obs.x / WORLD_SIZE) * 74 - 1,
                    top: (obs.y / WORLD_SIZE) * 74 - 1,
                    width: 2,
                    height: 2,
                    borderRadius: 0,
                  },
                ]}
              />
            ) : null
          ))}
        </View>
      </View>

      {combo > 2 && comboTimer > 0 && (
        <View style={styles.comboOverlay}>
          <Text style={styles.comboOverlayText}>COMBO x{combo}</Text>
        </View>
      )}
    </View>
  );
}

export default React.memo(GameHUD);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  healthBlock: {
    flex: 1,
    marginRight: 12,
  },
  healthBarBg: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  healthInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  healthText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  healthLabel: {
    color: COLORS.textDim,
    fontSize: 8,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800' as const,
  },
  comboBadge: {
    backgroundColor: 'rgba(239,68,68,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  comboText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '800' as const,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weaponBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weaponIcon: {
    width: 22,
    height: 14,
    justifyContent: 'center',
  },
  gunBarrel: {
    width: 14,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  gunBody: {
    width: 10,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
    marginTop: 1,
  },
  weaponName: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '500' as const,
  },
  ammoNumber: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  timeBlock: {},
  timeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  objectiveBlock: {
    alignItems: 'flex-end',
  },
  objectiveText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  killsText: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
  miniMapContainer: {
    position: 'absolute',
    top: 80,
    right: 12,
  },
  miniMap: {
    width: 78,
    height: 78,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    padding: 2,
  },
  miniMapBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 5,
  },
  miniDot: {
    position: 'absolute',
    borderRadius: 3,
  },
  comboOverlay: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  comboOverlayText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '900' as const,
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
