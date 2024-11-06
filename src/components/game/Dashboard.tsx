import React, { useState, useCallback, useEffect } from 'react';
import { useGame } from '../../hooks/useGame';
import MissionCard from './MissionCard';
import PrisonOverlay from './PrisonOverlay';
import { Wallet, AlertCircle, Skull, Globe2, Users, Shield, Crosshair, History } from 'lucide-react';
import { getPlayerLevel } from '../../utils/playerLevel';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { player, executeMission, availableMissions, inPrison } = useGame();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const playerLevel = getPlayerLevel(player.balance);

  // Get 5 random missions that haven't been completed
  const mainMissions = availableMissions
    .filter(mission => !player.completedMissions.includes(mission.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  const handleExecuteMission = useCallback((missionId: string) => {
    try {
      const result = executeMission(missionId);
      setNotification({
        message: result.message,
        type: result.success && !result.imprisoned ? 'success' : 'error'
      });
    } catch (error) {
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to execute mission',
        type: 'error'
      });
    }
  }, [executeMission]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 overflow-hidden">
      {inPrison && player.prisonTime && (
        <PrisonOverlay releaseTime={player.prisonTime} />
      )}

      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-red-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Globe2 className="h-8 w-8 text-red-600" />
              <div className="hidden sm:flex space-x-4 text-sm">
                <Link 
                  to="/history"
                  className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors flex items-center"
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Link>
                <button className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Users className="h-4 w-4 inline mr-2" />
                  Players
                </button>
                <button className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Shield className="h-4 w-4 inline mr-2" />
                  Missions
                </button>
                <button className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Crosshair className="h-4 w-4 inline mr-2" />
                  Combat
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-black/50 px-4 py-2 rounded-lg border border-red-900/30">
                <div className="text-xs text-red-500">LOCATION</div>
                <div className="font-bold">Cairo, Egypt</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        <div className="w-full lg:w-64 bg-black/30 border-r border-red-900/30 p-4">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-red-900/30">
              <div className="text-xs text-red-500 mb-1">STREET CRED</div>
              <div className="flex items-center space-x-3">
                <Skull className={`h-6 w-6 ${playerLevel.color}`} />
                <span className={`text-xl font-bold ${playerLevel.color}`}>
                  {playerLevel.name}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-red-900/30">
              <div className="text-xs text-emerald-500 mb-1">BALANCE</div>
              <div className="flex items-center space-x-3">
                <Wallet className="h-6 w-6 text-emerald-400" />
                <span className="text-xl font-bold text-emerald-400">
                  ${player.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {notification && (
            <div className={`
              fixed top-16 right-4 p-4 rounded-lg shadow-2xl z-50
              ${notification.type === 'success' ? 'bg-emerald-900/90 border border-emerald-500/50' : 'bg-red-900/90 border border-red-500/50'}
              text-white
            `}>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <p>{notification.message}</p>
              </div>
            </div>
          )}

          <div className="p-6 h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-red-500">
                  Available Missions
                </h2>
                <div className="text-sm text-gray-500">
                  {mainMissions.length} missions available
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mainMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onExecute={handleExecuteMission}
                    disabled={player.completedMissions.includes(mission.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
