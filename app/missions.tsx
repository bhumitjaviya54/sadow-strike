import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Star, ChevronRight, Zap } from 'lucide-react-native';
import { COLORS } from '@/constants/color';
import { MISSIONS, ENV_COLORS } from '@/constants/gameData';
import { usePlayer } from '@/contexts/PlayerContext';

export default function MissionsScreen() {
  const router = useRouter();
  const { playerData } = usePlayer();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {MISSIONS.map((mission, idx) => {
        const isLocked = playerData.level < mission.unlockLevel;
        const stars = playerData.completedMissions[mission.id] ?? 0;
        const envColor = ENV_COLORS[mission.environment];

        return (
          <Pressable
            key={mission.id}
            style={({ pressed }) => [
              styles.card,
              pressed && !isLocked && styles.cardPressed,
              isLocked && styles.cardLocked,
            ]}
            onPress={() => {
              if (!isLocked) {
                router.push(`/briefing?missionId=${mission.id}` as any);
              }
            }}
            disabled={isLocked}
          >
            <View style={[styles.envStripe, { backgroundColor: isLocked ? COLORS.textDim : envColor.accent }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <View style={styles.missionNumBadge}>
                  <Text style={styles.missionNum}>{String(idx + 1).padStart(2, '0')}</Text>
                </View>
                <View style={styles.envBadge}>
                  <Text style={[styles.envText, { color: isLocked ? COLORS.textDim : envColor.accent }]}>
                    {mission.environment.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.missionName, isLocked && styles.textLocked]}>{mission.name}</Text>
              <Text style={[styles.missionDesc, isLocked && styles.textLocked]}>{mission.description}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.difficultyRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.diffDot,
                        {
                          backgroundColor: i < mission.difficulty
                            ? (mission.difficulty >= 4 ? COLORS.danger : COLORS.primary)
                            : COLORS.bgLight,
                        },
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.rewardsRow}>
                  <View style={styles.rewardItem}>
                    <Zap size={11} color={COLORS.secondary} />
                    <Text style={styles.rewardText}>{mission.xpReward}</Text>
                  </View>
                  <View style={styles.rewardItem}>
                    <View style={styles.coinMini} />
                    <Text style={styles.rewardText}>{mission.coinReward}</Text>
                  </View>
                </View>

                {isLocked ? (
                  <View style={styles.lockBadge}>
                    <Lock size={12} color={COLORS.textMuted} />
                    <Text style={styles.lockText}>LVL {mission.unlockLevel}</Text>
                  </View>
                ) : stars > 0 ? (
                  <View style={styles.starsRow}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color={i < stars ? COLORS.primary : COLORS.textDim}
                        fill={i < stars ? COLORS.primary : 'transparent'}
                      />
                    ))}
                  </View>
                ) : (
                  <ChevronRight size={18} color={COLORS.textMuted} />
                )}
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardLocked: {
    opacity: 0.5,
  },
  envStripe: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  missionNumBadge: {
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  missionNum: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  envBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  envText: {
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  missionName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 3,
  },
  missionDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  textLocked: {
    color: COLORS.textDim,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 4,
  },
  diffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  coinMini: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  rewardText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
});
