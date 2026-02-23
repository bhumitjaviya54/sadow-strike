import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Crosshair, Lock, Check, ArrowUp, Zap, Shield, Heart } from 'lucide-react-native';
import { COLORS } from '@/constants/color';
import {
  WEAPONS, UPGRADE_COSTS, UPGRADE_MAX, SKILL_COSTS, SKILL_MAX,
} from '@/constants/gameData';
import { usePlayer } from '@/contexts/PlayerContext';

export default function ArmoryScreen() {
  const { playerData, buyWeapon, equipWeapon, upgradeWeapon, upgradeSkill } = usePlayer();

  const handleBuy = (weaponId: string, price: number) => {
    if (playerData.coins < price) {
      Alert.alert('Insufficient Funds', 'You need more coins to purchase this weapon.');
      return;
    }
    buyWeapon(weaponId);
  };

  const handleUpgrade = (weaponId: string) => {
    const level = playerData.weaponUpgrades[weaponId] ?? 0;
    if (level >= UPGRADE_MAX) return;
    const cost = UPGRADE_COSTS[level];
    if (playerData.coins < cost) {
      Alert.alert('Insufficient Funds', 'You need more coins to upgrade.');
      return;
    }
    upgradeWeapon(weaponId);
  };

  const handleSkill = (skill: 'speed' | 'damage' | 'health') => {
    const level = playerData.skills[skill];
    if (level >= SKILL_MAX) return;
    const cost = SKILL_COSTS[level];
    if (playerData.coins < cost) {
      Alert.alert('Insufficient Funds', 'You need more coins for this skill.');
      return;
    }
    upgradeSkill(skill);
  };

  const skills: { key: 'speed' | 'damage' | 'health'; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'speed', label: 'SPEED', icon: <Zap size={18} color={COLORS.secondary} />, color: COLORS.secondary },
    { key: 'damage', label: 'DAMAGE', icon: <Crosshair size={18} color={COLORS.danger} />, color: COLORS.danger },
    { key: 'health', label: 'HEALTH', icon: <Heart size={18} color={COLORS.success} />, color: COLORS.success },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.coinsBar}>
        <View style={styles.coinDot} />
        <Text style={styles.coinsText}>{playerData.coins.toLocaleString()} coins</Text>
      </View>

      <Text style={styles.sectionTitle}>WEAPONS</Text>
      {WEAPONS.map(weapon => {
        const owned = playerData.unlockedWeapons.includes(weapon.id);
        const equipped = playerData.currentWeaponId === weapon.id;
        const canBuy = playerData.level >= weapon.unlockLevel;
        const upgradeLevel = playerData.weaponUpgrades[weapon.id] ?? 0;

        return (
          <View key={weapon.id} style={[styles.weaponCard, equipped && styles.weaponEquipped]}>
            <View style={styles.weaponHeader}>
              <View style={styles.weaponIcon}>
                <Crosshair size={20} color={equipped ? COLORS.primary : COLORS.textSecondary} />
              </View>
              <View style={styles.weaponInfo}>
                <Text style={styles.weaponName}>{weapon.name}</Text>
                <Text style={styles.weaponDesc}>{weapon.description}</Text>
              </View>
              {equipped && (
                <View style={styles.equippedBadge}>
                  <Check size={12} color={COLORS.success} />
                </View>
              )}
            </View>

            <View style={styles.statsGrid}>
              <StatBar label="DMG" value={weapon.damage + upgradeLevel * Math.round(weapon.damage * 0.12)} max={120} color={COLORS.danger} />
              <StatBar label="RATE" value={Math.round(100 - (weapon.fireRate / 15))} max={100} color={COLORS.secondary} />
              <StatBar label="RNG" value={Math.round(weapon.range / 5)} max={100} color={COLORS.success} />
              <StatBar label="ACC" value={Math.round(weapon.accuracy * 100)} max={100} color={COLORS.primaryLight} />
            </View>

            {upgradeLevel > 0 && (
              <View style={styles.upgradeBadge}>
                <ArrowUp size={10} color={COLORS.primary} />
                <Text style={styles.upgradeText}>+{upgradeLevel}</Text>
              </View>
            )}

            <View style={styles.weaponActions}>
              {!owned && !canBuy && (
                <View style={styles.lockRow}>
                  <Lock size={12} color={COLORS.textMuted} />
                  <Text style={styles.lockText}>Unlock at LVL {weapon.unlockLevel}</Text>
                </View>
              )}
              {!owned && canBuy && (
                <Pressable
                  style={({ pressed }) => [styles.buyBtn, pressed && styles.btnPressed]}
                  onPress={() => handleBuy(weapon.id, weapon.price)}
                >
                  <View style={styles.priceDot} />
                  <Text style={styles.buyText}>{weapon.price}</Text>
                </Pressable>
              )}
              {owned && !equipped && (
                <Pressable
                  style={({ pressed }) => [styles.equipBtn, pressed && styles.btnPressed]}
                  onPress={() => equipWeapon(weapon.id)}
                >
                  <Text style={styles.equipText}>EQUIP</Text>
                </Pressable>
              )}
              {owned && upgradeLevel < UPGRADE_MAX && (
                <Pressable
                  style={({ pressed }) => [styles.upgradeBtn, pressed && styles.btnPressed]}
                  onPress={() => handleUpgrade(weapon.id)}
                >
                  <ArrowUp size={12} color={COLORS.secondary} />
                  <Text style={styles.upgradeActionText}>
                    UPGRADE ({UPGRADE_COSTS[upgradeLevel]})
                  </Text>
                </Pressable>
              )}
              {owned && upgradeLevel >= UPGRADE_MAX && (
                <Text style={styles.maxText}>MAX</Text>
              )}
            </View>
          </View>
        );
      })}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>SKILL TREE</Text>
      {skills.map(skill => {
        const level = playerData.skills[skill.key];
        const cost = level < SKILL_MAX ? SKILL_COSTS[level] : 0;
        const isMax = level >= SKILL_MAX;

        return (
          <View key={skill.key} style={styles.skillCard}>
            <View style={styles.skillHeader}>
              {skill.icon}
              <View style={styles.skillInfo}>
                <Text style={styles.skillLabel}>{skill.label}</Text>
                <View style={styles.skillDots}>
                  {Array.from({ length: SKILL_MAX }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.skillDot,
                        { backgroundColor: i < level ? skill.color : COLORS.bgLight },
                      ]}
                    />
                  ))}
                </View>
              </View>
              {!isMax ? (
                <Pressable
                  style={({ pressed }) => [styles.skillBtn, pressed && styles.btnPressed]}
                  onPress={() => handleSkill(skill.key)}
                >
                  <View style={styles.priceDot} />
                  <Text style={styles.skillCostText}>{cost}</Text>
                </Pressable>
              ) : (
                <Text style={styles.maxText}>MAX</Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View style={statStyles.container}>
      <Text style={statStyles.label}>{label}</Text>
      <View style={statStyles.barBg}>
        <View style={[statStyles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  barBg: {
    height: 4,
    backgroundColor: COLORS.bgLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  coinsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  coinsText: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 10,
  },
  weaponCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weaponEquipped: {
    borderColor: COLORS.primary,
  },
  weaponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  weaponIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weaponInfo: {
    flex: 1,
  },
  weaponName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  weaponDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  equippedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(34,197,94,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  upgradeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  upgradeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  weaponActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  priceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryDark,
  },
  buyText: {
    color: COLORS.bg,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  equipBtn: {
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  equipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6,182,212,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    gap: 4,
  },
  upgradeActionText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '700' as const,
  },
  maxText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  btnPressed: {
    opacity: 0.7,
  },
  skillCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skillInfo: {
    flex: 1,
    gap: 4,
  },
  skillLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 1,
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
  skillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  skillCostText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '700' as const,
  },
});