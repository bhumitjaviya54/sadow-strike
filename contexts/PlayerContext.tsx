import {
  DEFAULT_PLAYER_DATA,
  PlayerData,
  SKILL_COSTS,
  SKILL_MAX,
  UPGRADE_COSTS,
  UPGRADE_MAX,
  WEAPONS,
  xpForLevel,
} from '@/constants/gameData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'shadow_strike_player';

type PlayerContextValue = {
  playerData: PlayerData;
  isLoading: boolean;
  save: (data: PlayerData) => void;
  addCoins: (coins: number) => void;
  addXpAndCoins: (xp: number, coins: number, kills: number, headshots: number) => void;
  completeMission: (missionId: string, stars: number) => void;
  buyWeapon: (weaponId: string) => boolean;
  equipWeapon: (weaponId: string) => void;
  upgradeWeapon: (weaponId: string) => boolean;
  upgradeSkill: (skill: 'speed' | 'damage' | 'health') => boolean;
  claimDailyReward: () => boolean;
  canClaimDaily: boolean;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerData, setPlayerData] = useState<PlayerData>(DEFAULT_PLAYER_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && mounted) {
          const parsed = JSON.parse(stored) as PlayerData;
          setPlayerData({ ...DEFAULT_PLAYER_DATA, ...parsed });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (data: PlayerData) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const save = useCallback((data: PlayerData) => {
    setPlayerData(data);
    void persist(data);
  }, [persist]);

  const addCoins = useCallback((coins: number) => {
    if (coins <= 0) return;
    setPlayerData(prev => {
      const updated: PlayerData = {
        ...prev,
        coins: prev.coins + coins,
      };
      void persist(updated);
      return updated;
    });
  }, [persist]);

  const addXpAndCoins = useCallback((xp: number, coins: number, kills: number, headshots: number) => {
    setPlayerData(prev => {
      let newXp = prev.xp + xp;
      let newLevel = prev.level;
      let needed = xpForLevel(newLevel);
      while (newXp >= needed) {
        newXp -= needed;
        newLevel += 1;
        needed = xpForLevel(newLevel);
      }
      const updated: PlayerData = {
        ...prev,
        xp: newXp,
        level: newLevel,
        coins: prev.coins + coins,
        totalKills: prev.totalKills + kills,
        totalHeadshots: prev.totalHeadshots + headshots,
        totalMissions: prev.totalMissions + 1,
      };
      void persist(updated);
      return updated;
    });
  }, [persist]);

  const completeMission = useCallback((missionId: string, stars: number) => {
    setPlayerData(prev => {
      const currentStars = prev.completedMissions[missionId] ?? 0;
      if (stars <= currentStars) return prev;
      const updated: PlayerData = {
        ...prev,
        completedMissions: { ...prev.completedMissions, [missionId]: stars },
      };
      void persist(updated);
      return updated;
    });
  }, [persist]);

  const buyWeapon = useCallback((weaponId: string): boolean => {
    const weapon = WEAPONS.find(w => w.id === weaponId);
    if (!weapon) return false;
    let success = false;
    setPlayerData(prev => {
      if (prev.coins < weapon.price || prev.unlockedWeapons.includes(weaponId)) return prev;
      success = true;
      const updated: PlayerData = {
        ...prev,
        coins: prev.coins - weapon.price,
        unlockedWeapons: [...prev.unlockedWeapons, weaponId],
      };
      void persist(updated);
      return updated;
    });
    return success;
  }, [persist]);

  const equipWeapon = useCallback((weaponId: string) => {
    setPlayerData(prev => {
      if (!prev.unlockedWeapons.includes(weaponId)) return prev;
      const updated: PlayerData = { ...prev, currentWeaponId: weaponId };
      void persist(updated);
      return updated;
    });
  }, [persist]);

  const upgradeWeapon = useCallback((weaponId: string): boolean => {
    let success = false;
    setPlayerData(prev => {
      const currentLevel = prev.weaponUpgrades[weaponId] ?? 0;
      if (currentLevel >= UPGRADE_MAX) return prev;
      const cost = UPGRADE_COSTS[currentLevel];
      if (prev.coins < cost) return prev;
      success = true;
      const updated: PlayerData = {
        ...prev,
        coins: prev.coins - cost,
        weaponUpgrades: { ...prev.weaponUpgrades, [weaponId]: currentLevel + 1 },
      };
      void persist(updated);
      return updated;
    });
    return success;
  }, [persist]);

  const upgradeSkill = useCallback((skill: 'speed' | 'damage' | 'health'): boolean => {
    let success = false;
    setPlayerData(prev => {
      const currentLevel = prev.skills[skill];
      if (currentLevel >= SKILL_MAX) return prev;
      const cost = SKILL_COSTS[currentLevel];
      if (prev.coins < cost) return prev;
      success = true;
      const updated: PlayerData = {
        ...prev,
        coins: prev.coins - cost,
        skills: { ...prev.skills, [skill]: currentLevel + 1 },
      };
      void persist(updated);
      return updated;
    });
    return success;
  }, [persist]);

  const claimDailyReward = useCallback((): boolean => {
    const today = new Date().toISOString().split('T')[0];
    let success = false;
    setPlayerData(prev => {
      if (prev.lastDailyReward === today) return prev;
      success = true;
      const updated: PlayerData = {
        ...prev,
        coins: prev.coins + 150,
        lastDailyReward: today,
      };
      void persist(updated);
      return updated;
    });
    return success;
  }, [persist]);

  const canClaimDaily = playerData.lastDailyReward !== new Date().toISOString().split('T')[0];

  const value = useMemo<PlayerContextValue>(() => ({
    playerData,
    isLoading,
    save,
    addCoins,
    addXpAndCoins,
    completeMission,
    buyWeapon,
    equipWeapon,
    upgradeWeapon,
    upgradeSkill,
    claimDailyReward,
    canClaimDaily,
  }), [
    playerData,
    isLoading,
    save,
    addCoins,
    addXpAndCoins,
    completeMission,
    buyWeapon,
    equipWeapon,
    upgradeWeapon,
    upgradeSkill,
    claimDailyReward,
    canClaimDaily,
  ]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
