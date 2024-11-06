import React, { memo } from 'react';
import { Mission } from '../../types/game';
import { Timer, DollarSign, BarChart2, Bike, Car, Home, Skull } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { getPlayerLevel } from '../../utils/playerLevel';
import { getMissionSuccessProbability } from '../../utils/missionProbability';

interface MissionCardProps {
  mission: Mission & { cooldown: number };
  onExecute: (missionId: string) => void;
  disabled: boolean;
}

const MissionIcons = {
  bike: Bike,
  car: Car,
  house: Home,
  special: Skull,
} as const;

function formatTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function MissionCard({ mission, onExecute, disabled }: MissionCardProps) {
  const { player } = useGame();
  const playerLevel = getPlayerLevel(player.balance);
  const successProbability = getMissionSuccessProbability(mission, playerLevel);
  const Icon = MissionIcons[mission.type as keyof typeof MissionIcons];
  const isOnCooldown = mission.cooldown > 0;

  const handleExecute = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && !isOnCooldown) {
      onExecute(mission.id);
    }
  };

  const difficultyColor = {
    'C': 'from-green-500 to-emerald-600',
    'B': 'from-blue-500 to-indigo-600',
    'A': 'from-purple-500 to-pink-600',
    'S': 'from-red-500 to-rose-600',
  }[mission.class];

  return (
    <div className="group relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-red-900/30 transition-all duration-300 hover:scale-[1.02] hover:border-red-700/50">
      <div className="absolute inset-0 bg-black/60 z-10"/>
      <div className="relative h-40">
        <img
          src={mission.image}
          alt={mission.name}
          className="w-full h-full object-cover opacity-40 group-hover:opacity-30 transition-opacity"
        />
        <div className={`absolute top-2 right-2 bg-gradient-to-r ${difficultyColor} text-white px-2 py-0.5 rounded text-xs font-medium z-20`}>
          Class {mission.class}
        </div>
        <div className="absolute bottom-2 left-2 bg-black/75 text-white p-1.5 rounded z-20">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="relative p-4 z-20">
        <h3 className="text-base font-bold text-white mb-1">{mission.name}</h3>
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{mission.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-emerald-400">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="font-bold">{mission.reward.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-blue-400" title="Success Rate">
              <BarChart2 className="h-4 w-4 mr-1" />
              <span className="text-sm">{(successProbability * 100).toFixed(1)}%</span>
            </div>
          </div>
          
          {isOnCooldown ? (
            <div className="flex items-center justify-center text-amber-400 py-1.5 bg-amber-950/20 rounded border border-amber-900/50 text-sm">
              <Timer className="h-4 w-4 mr-2" />
              <span>{formatTime(mission.cooldown)}</span>
            </div>
          ) : (
            <button
              onClick={handleExecute}
              disabled={disabled}
              className={`
                w-full py-1.5 px-4 rounded font-medium text-sm transition-all duration-300
                ${disabled
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white'
                }
              `}
            >
              Execute Mission
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(MissionCard);