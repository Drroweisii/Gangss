import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missions } from '../data/missions';
import { Mission, Player, MissionResult } from '../types/game';
import { loadGameData, saveGameData } from '../services/api';
import { getMissionSuccessProbability } from '../utils/missionProbability';
import { getPlayerLevel } from '../utils/playerLevel';
import { gameLogger } from '../utils/logger';

const PRISON_TIME = 5 * 60 * 1000; // 5 minutes

export function useGame() {
  const queryClient = useQueryClient();
  const [inPrison, setInPrison] = useState(false);
  const [missionCooldowns, setMissionCooldowns] = useState<Record<string, number>>({});

  // Load game data
  const { data: player = { balance: 0, completedMissions: [], prisonTime: null } } = useQuery({
    queryKey: ['gameData'],
    queryFn: loadGameData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Save game data mutation
  const saveGameMutation = useMutation({
    mutationFn: saveGameData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameData'] });
    },
  });

  // Check prison status
  useEffect(() => {
    if (player.prisonTime) {
      const releaseTime = new Date(player.prisonTime).getTime();
      if (Date.now() < releaseTime) {
        setInPrison(true);
      }
    }
  }, [player.prisonTime]);

  // Update cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setMissionCooldowns(prev => {
        const now = Date.now();
        const updated: Record<string, number> = {};
        let hasChanges = false;

        Object.entries(prev).forEach(([missionId, endTime]) => {
          const remaining = Math.max(0, endTime - now);
          if (remaining > 0) {
            updated[missionId] = endTime;
          } else {
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Execute mission
  const executeMission = useCallback((missionId: string): MissionResult => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    gameLogger.log('mission_attempt', `Attempting mission: ${mission.name}`);

    // Check cooldown
    if (missionCooldowns[missionId]) {
      throw new Error('Mission is on cooldown');
    }

    // Check if already completed
    if (player.completedMissions.includes(missionId)) {
      throw new Error('Mission already completed');
    }

    // Check if in prison
    if (inPrison) {
      throw new Error('Cannot execute missions while in prison');
    }

    const playerLevel = getPlayerLevel(player.balance);
    const successProbability = getMissionSuccessProbability(mission, playerLevel);
    const roll = Math.random();
    const success = roll <= successProbability;

    gameLogger.log('mission_result', `Mission ${success ? 'succeeded' : 'failed'}`, {
      missionId,
      roll,
      probability: successProbability
    });

    if (success) {
      // Update game state
      const updatedPlayer = {
        ...player,
        balance: player.balance + mission.reward,
        completedMissions: [...player.completedMissions, missionId]
      };

      // Start cooldown
      setMissionCooldowns(prev => ({
        ...prev,
        [missionId]: Date.now() + mission.cooldown
      }));

      // Save to database
      saveGameMutation.mutate(updatedPlayer);

      return {
        success: true,
        reward: mission.reward,
        message: `Successfully completed ${mission.name} and earned $${mission.reward.toLocaleString()}!`
      };
    } else {
      // Player goes to prison
      const prisonTime = Date.now() + PRISON_TIME;
      const updatedPlayer = {
        ...player,
        prisonTime
      };

      setInPrison(true);
      saveGameMutation.mutate(updatedPlayer);

      return {
        success: false,
        reward: 0,
        message: 'Mission failed! You got caught and sent to prison!',
        imprisoned: true
      };
    }
  }, [player, missionCooldowns, inPrison, saveGameMutation]);

  // Get available missions with cooldowns
  const availableMissions = missions.map(mission => ({
    ...mission,
    cooldown: missionCooldowns[mission.id] ? Math.max(0, missionCooldowns[mission.id] - Date.now()) : 0
  }));

  return {
    player,
    inPrison,
    executeMission,
    availableMissions
  };
}
