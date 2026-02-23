import { isAdMobRuntimeSupported, ADMOB_UNIT_IDS } from '@/constants/admob';
import { COLORS } from '@/constants/color';
import { ENV_COLORS, MISSIONS, WEAPONS } from '@/constants/gameData';
import { usePlayer } from '@/contexts/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, Clock, Crosshair, Target, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BriefingScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playerData } = usePlayer();
  const [deploying, setDeploying] = useState(false);
  const interstitialRef = useRef<any>(null);
  const interstitialReadyRef = useRef(false);

  const mission = MISSIONS.find(m => m.id === missionId);

  useEffect(() => {
    if (!isAdMobRuntimeSupported) return;
    let mounted = true;
    let cleanup = () => {};

    const loadInterstitial = async () => {
      try {
        const ads = await import('react-native-google-mobile-ads');
        if (!mounted) return;

        const interstitial = ads.InterstitialAd.createForAdRequest(ADMOB_UNIT_IDS.interstitial, {
          requestNonPersonalizedAdsOnly: true,
        });
        interstitialRef.current = interstitial;

        const unsubLoaded = interstitial.addAdEventListener(ads.AdEventType.LOADED, () => {
          interstitialReadyRef.current = true;
        });

        const resetAndReload = () => {
          interstitialReadyRef.current = false;
          interstitial.load();
        };

        const unsubClosed = interstitial.addAdEventListener(ads.AdEventType.CLOSED, resetAndReload);
        const unsubError = interstitial.addAdEventListener(ads.AdEventType.ERROR, resetAndReload);

        interstitial.load();

        cleanup = () => {
          unsubLoaded();
          unsubClosed();
          unsubError();
          interstitialRef.current = null;
          interstitialReadyRef.current = false;
        };
      } catch {
        // Keep app functional if ads runtime is unavailable.
      }
    };

    void loadInterstitial();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  const deployMission = useCallback(async () => {
    if (!mission || deploying) return;
    setDeploying(true);
    try {
      if (isAdMobRuntimeSupported && interstitialRef.current && interstitialReadyRef.current) {
        await interstitialRef.current.show();
      }
    } catch {
      // Ignore ad failures and continue to gameplay.
    } finally {
      router.push(`/game?missionId=${mission.id}` as any);
      setDeploying(false);
    }
  }, [deploying, mission, router]);

  if (!mission) return <View style={styles.container}><Text style={styles.errorText}>Mission not found</Text></View>;

  const envColors = ENV_COLORS[mission.environment];
  const weapon = WEAPONS.find(w => w.id === playerData.currentWeaponId) ?? WEAPONS[0];

  const objectiveLabel =
    mission.objective === 'eliminate' ? 'ELIMINATE ALL HOSTILES' :
    mission.objective === 'survive' ? `SURVIVE ${mission.timeLimit}s` :
    'DEFEAT THE BOSS';

  const enemyBreakdown: Record<string, number> = {};
  for (const e of mission.enemies) {
    enemyBreakdown[e.type] = (enemyBreakdown[e.type] ?? 0) + 1;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
      <View style={[styles.envHeader, { borderLeftColor: envColors.accent }]}>
        <Text style={[styles.envLabel, { color: envColors.accent }]}>
          {mission.environment.toUpperCase()} ZONE
        </Text>
        <Text style={styles.missionName}>{mission.name}</Text>
      </View>

      <View style={styles.briefingCard}>
        <Text style={styles.sectionTitle}>INTELLIGENCE BRIEFING</Text>
        <Text style={styles.briefingText}>{mission.briefing}</Text>
      </View>

      <View style={styles.objectiveCard}>
        <View style={styles.objectiveHeader}>
          <Target size={16} color={COLORS.danger} />
          <Text style={styles.objectiveLabel}>PRIMARY OBJECTIVE</Text>
        </View>
        <Text style={styles.objectiveText}>{objectiveLabel}</Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <AlertTriangle size={14} color={COLORS.primary} />
          <Text style={styles.infoLabel}>THREAT LEVEL</Text>
          <View style={styles.diffRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.diffBar,
                  { backgroundColor: i < mission.difficulty ? COLORS.danger : COLORS.bgLight },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.infoItem}>
          <Crosshair size={14} color={COLORS.secondary} />
          <Text style={styles.infoLabel}>HOSTILES</Text>
          <Text style={styles.infoValue}>{mission.enemies.length}</Text>
        </View>

        {mission.timeLimit && (
          <View style={styles.infoItem}>
            <Clock size={14} color={COLORS.primaryLight} />
            <Text style={styles.infoLabel}>TIME LIMIT</Text>
            <Text style={styles.infoValue}>{mission.timeLimit}s</Text>
          </View>
        )}

        <View style={styles.infoItem}>
          <Zap size={14} color={COLORS.success} />
          <Text style={styles.infoLabel}>REWARDS</Text>
          <Text style={styles.infoValue}>{mission.xpReward} XP + {mission.coinReward} coins</Text>
        </View>
      </View>

      <View style={styles.enemySection}>
        <Text style={styles.sectionTitle}>ENEMY COMPOSITION</Text>
        <View style={styles.enemyList}>
          {Object.entries(enemyBreakdown).map(([type, count]) => (
            <View key={type} style={styles.enemyRow}>
              <View style={[styles.enemyDot, {
                backgroundColor:
                  type === 'grunt' ? COLORS.enemyGrunt :
                  type === 'heavy' ? COLORS.enemyHeavy :
                  type === 'sniper' ? COLORS.enemySniper :
                  COLORS.enemyBoss,
              }]} />
              <Text style={styles.enemyType}>{type.toUpperCase()}</Text>
              <Text style={styles.enemyCount}>x{count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.loadoutCard}>
        <Text style={styles.sectionTitle}>YOUR LOADOUT</Text>
        <Text style={styles.weaponName}>{weapon.name}</Text>
        <Text style={styles.weaponDesc}>DMG {weapon.damage} | RATE {weapon.fireRate}ms | AMMO {weapon.ammo}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.deployBtn, pressed && styles.deployPressed, deploying && styles.deployDisabled]}
        onPress={() => {
          void deployMission();
        }}
        disabled={deploying}
      >
        <LinearGradient
          colors={[COLORS.danger, COLORS.dangerDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.deployGradient}
        >
          <Crosshair size={20} color={COLORS.white} />
          <Text style={styles.deployText}>{deploying ? 'PREPARING...' : 'DEPLOY AGENT'}</Text>
        </LinearGradient>
      </Pressable>
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
    gap: 14,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 40,
  },
  envHeader: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  envLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 2,
  },
  missionName: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800' as const,
  },
  briefingCard: {
    backgroundColor: COLORS.bgCard,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 8,
  },
  briefingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  objectiveCard: {
    backgroundColor: COLORS.bgCard,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  objectiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  objectiveLabel: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  objectiveText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: {
    backgroundColor: COLORS.bgCard,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: '45%',
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
  },
  diffBar: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  enemySection: {
    backgroundColor: COLORS.bgCard,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  enemyList: {
    gap: 8,
  },
  enemyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  enemyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  enemyType: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 1,
    flex: 1,
  },
  enemyCount: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  loadoutCard: {
    backgroundColor: COLORS.bgCard,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weaponName: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  weaponDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 1,
  },
  deployBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  deployPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  deployDisabled: {
    opacity: 0.7,
  },
  deployGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  deployText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900' as const,
    letterSpacing: 3,
  },
});
