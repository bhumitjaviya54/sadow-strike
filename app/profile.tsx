import { COLORS } from '@/constants/color';
import { MISSIONS, WEAPONS, xpForLevel } from '@/constants/gameData';
import { usePlayer } from '@/contexts/PlayerContext';
import { Award, Clock, Crosshair, Heart, Shield, Star, Target, TrendingUp, Zap } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { playerData } = usePlayer();

  const xpNeeded = xpForLevel(playerData.level);
  const xpPct = xpNeeded > 0 ? playerData.xp / xpNeeded : 0;
  const completedCount = Object.keys(playerData.completedMissions).length;
  const totalStars = Object.values(playerData.completedMissions).reduce((a, b) => a + b, 0);
  const maxStars = MISSIONS.length * 3;
  const currentWeapon = WEAPONS.find(w => w.id === playerData.currentWeaponId) ?? WEAPONS[0];

  const stats: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <Target size={16} color={COLORS.danger} />, label: 'Total Kills', value: String(playerData.totalKills) },
    { icon: <Crosshair size={16} color={COLORS.primaryLight} />, label: 'Headshots', value: String(playerData.totalHeadshots) },
    { icon: <Award size={16} color={COLORS.secondary} />, label: 'Missions Done', value: String(playerData.totalMissions) },
    { icon: <Star size={16} color={COLORS.primary} />, label: 'Stars Earned', value: `${totalStars}/${maxStars}` },
    { icon: <Clock size={16} color={COLORS.textSecondary} />, label: 'Missions Completed', value: `${completedCount}/${MISSIONS.length}` },
    {
      icon: <TrendingUp size={16} color={COLORS.success} />,
      label: 'Accuracy Rate',
      value: playerData.totalKills > 0 ? `${Math.round((playerData.totalHeadshots / playerData.totalKills) * 100)}%` : '0%',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Shield size={28} color={COLORS.primary} />
          </View>
        </View>
        <Text style={styles.agentName}>AGENT #{String(playerData.level * 1337).slice(0, 4)}</Text>
        <Text style={styles.rankText}>
          {playerData.level >= 7 ? 'ELITE OPERATIVE' :
           playerData.level >= 5 ? 'SENIOR AGENT' :
           playerData.level >= 3 ? 'FIELD AGENT' : 'RECRUIT'}
        </Text>
      </View>

      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelLabel}>LEVEL {playerData.level}</Text>
          <Text style={styles.xpText}>{playerData.xp} / {xpNeeded} XP</Text>
        </View>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${Math.min(xpPct * 100, 100)}%` }]} />
        </View>
      </View>

      <View style={styles.loadoutCard}>
        <Text style={styles.sectionTitle}>CURRENT LOADOUT</Text>
        <View style={styles.loadoutRow}>
          <Crosshair size={18} color={COLORS.primary} />
          <View style={styles.loadoutInfo}>
            <Text style={styles.loadoutName}>{currentWeapon.name}</Text>
            <Text style={styles.loadoutDetail}>
              DMG {currentWeapon.damage} | Upgrade +{playerData.weaponUpgrades[currentWeapon.id] ?? 0}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.skillsCard}>
        <Text style={styles.sectionTitle}>AGENT SKILLS</Text>
        <View style={styles.skillRow}>
          <Zap size={14} color={COLORS.secondary} />
          <Text style={styles.skillName}>Speed</Text>
          <View style={styles.skillDots}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={[styles.skillDot, {
                backgroundColor: i < playerData.skills.speed ? COLORS.secondary : COLORS.bgLight,
              }]} />
            ))}
          </View>
        </View>
        <View style={styles.skillRow}>
          <Crosshair size={14} color={COLORS.danger} />
          <Text style={styles.skillName}>Damage</Text>
          <View style={styles.skillDots}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={[styles.skillDot, {
                backgroundColor: i < playerData.skills.damage ? COLORS.danger : COLORS.bgLight,
              }]} />
            ))}
          </View>
        </View>
        <View style={styles.skillRow}>
          <Heart size={14} color={COLORS.success} />
          <Text style={styles.skillName}>Health</Text>
          <View style={styles.skillDots}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={[styles.skillDot, {
                backgroundColor: i < playerData.skills.health ? COLORS.success : COLORS.bgLight,
              }]} />
            ))}
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { paddingHorizontal: 0, marginTop: 8 }]}>COMBAT STATISTICS</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <View key={idx} style={styles.statCard}>
            {stat.icon}
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.weaponsCard}>
        <Text style={styles.sectionTitle}>ARSENAL</Text>
        {WEAPONS.map(w => {
          const owned = playerData.unlockedWeapons.includes(w.id);
          return (
            <View key={w.id} style={styles.arsenalRow}>
              <View style={[styles.arsenalDot, { backgroundColor: owned ? COLORS.success : COLORS.textDim }]} />
              <Text style={[styles.arsenalName, !owned && styles.arsenalLocked]}>{w.name}</Text>
              <Text style={styles.arsenalStatus}>{owned ? 'OWNED' : 'LOCKED'}</Text>
            </View>
          );
        })}
      </View>
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
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 12,
  },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800' as const,
    letterSpacing: 3,
  },
  rankText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginTop: 4,
  },
  levelCard: {
    backgroundColor: COLORS.bgCard,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  xpText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500' as const,
  },
  xpBarBg: {
    height: 8,
    backgroundColor: COLORS.bgLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  loadoutCard: {
    backgroundColor: COLORS.bgCard,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 10,
  },
  loadoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadoutInfo: {
    flex: 1,
  },
  loadoutName: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  loadoutDetail: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  skillsCard: {
    backgroundColor: COLORS.bgCard,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    gap: 10,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600' as const,
    width: 60,
  },
  skillDots: {
    flexDirection: 'row',
    gap: 4,
  },
  skillDot: {
    width: 20,
    height: 6,
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: COLORS.bgCard,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '48%',
    flexGrow: 1,
    gap: 4,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800' as const,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '500' as const,
  },
  weaponsCard: {
    backgroundColor: COLORS.bgCard,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  arsenalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arsenalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  arsenalName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
  },
  arsenalLocked: {
    color: COLORS.textDim,
  },
  arsenalStatus: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
});
