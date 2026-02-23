import { COLORS } from '@/constants/color';
import { xpForLevel } from '@/constants/gameData';
import { usePlayer } from '@/contexts/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight, Crosshair, Gift, Shield, User } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playerData, canClaimDaily, claimDailyReward } = usePlayer();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const xpNeeded = xpForLevel(playerData.level);
  const xpPct = xpNeeded > 0 ? playerData.xp / xpNeeded : 0;

  return (
    <LinearGradient colors={['#0B0F15', '#131B27', '#0B0F15']} style={styles.container}>
      <View style={[styles.inner, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.topBar}>
          <View style={styles.coinBadge}>
            <View style={styles.coinDot} />
            <Text style={styles.coinText}>{playerData.coins.toLocaleString()}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>LVL</Text>
            <Text style={styles.levelNumber}>{playerData.level}</Text>
          </View>
        </View>

        <View style={styles.decoLineTop} />
        <View style={styles.decoLineBottom} />

        <Animated.View style={[styles.titleSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.titleTop}>SHADOW</Text>
          <Text style={styles.titleBottom}>STRIKE</Text>
          <View style={styles.titleAccent} />
          <View style={styles.subtitleRow}>
            <View style={styles.subtitleDash} />
            <Text style={styles.subtitleText}>TACTICAL OPS</Text>
            <View style={styles.subtitleDash} />
          </View>
        </Animated.View>

        <View style={styles.xpSection}>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${Math.min(xpPct * 100, 100)}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {playerData.xp} / {xpNeeded} XP
          </Text>
          <Text style={styles.agentText}>AGENT LEVEL {playerData.level}</Text>
        </View>

        <View style={styles.buttonsSection}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              style={({ pressed }) => [styles.deployBtn, pressed && styles.btnPressed]}
              onPress={() => router.push('/missions' as any)}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.deployGradient}
              >
                <Crosshair size={22} color={COLORS.bg} />
                <Text style={styles.deployText}>DEPLOY</Text>
                <ChevronRight size={20} color={COLORS.bg} />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <View style={styles.secondaryRow}>
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
              onPress={() => router.push('/armory' as any)}
            >
              <Shield size={18} color={COLORS.primary} />
              <Text style={styles.secondaryText}>ARMORY</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
              onPress={() => router.push('/profile' as any)}
            >
              <User size={18} color={COLORS.secondary} />
              <Text style={styles.secondaryText}>PROFILE</Text>
            </Pressable>
          </View>

          {canClaimDaily && (
            <Pressable
              style={({ pressed }) => [styles.dailyBtn, pressed && styles.btnPressed]}
              onPress={() => claimDailyReward()}
            >
              <Gift size={18} color={COLORS.secondary} />
              <View style={styles.dailyInfo}>
                <Text style={styles.dailyTitle}>DAILY REWARD</Text>
                <Text style={styles.dailySubtitle}>Claim +150 coins</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </Pressable>
          )}
        </View>

        <Text style={styles.versionText}>v1.0 â€” CLASSIFIED</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  coinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  coinText: {
    color: COLORS.primaryLight,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  levelLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  levelNumber: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: '800' as const,
  },
  decoLineTop: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.3,
  },
  decoLineBottom: {
    position: 'absolute',
    top: '58%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.15,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  titleTop: {
    fontSize: 42,
    fontWeight: '300' as const,
    color: COLORS.text,
    letterSpacing: 18,
  },
  titleBottom: {
    fontSize: 52,
    fontWeight: '900' as const,
    color: COLORS.primary,
    letterSpacing: 8,
    marginTop: -8,
  },
  titleAccent: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginTop: 8,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  subtitleDash: {
    width: 20,
    height: 1,
    backgroundColor: COLORS.textMuted,
  },
  subtitleText: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '500' as const,
  },
  xpSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  xpBarBg: {
    width: '80%',
    height: 6,
    backgroundColor: COLORS.bgLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  xpText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 5,
    fontWeight: '500' as const,
  },
  agentText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 3,
    marginTop: 4,
  },
  buttonsSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
  },
  deployBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  deployGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  deployText: {
    color: COLORS.bg,
    fontSize: 20,
    fontWeight: '900' as const,
    letterSpacing: 4,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  secondaryText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  dailyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgAccent,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondaryDark,
    gap: 12,
  },
  dailyInfo: {
    flex: 1,
  },
  dailyTitle: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  dailySubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  versionText: {
    color: COLORS.textDim,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 2,
    paddingBottom: 4,
  },
});
