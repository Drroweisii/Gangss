export interface PlayerLevel {
  name: string;
  color: string;
  minBalance: number;
  maxBalance: number;
}

export const playerLevels: PlayerLevel[] = [
  {
    name: 'Bronze',
    color: 'text-amber-600',
    minBalance: 0,
    maxBalance: 1_000_000,
  },
  {
    name: 'Silver',
    color: 'text-gray-400',
    minBalance: 1_000_001,
    maxBalance: 50_000_000,
  },
  {
    name: 'Gold',
    color: 'text-yellow-500',
    minBalance: 50_000_001,
    maxBalance: 100_000_000,
  },
  {
    name: 'Platinum',
    color: 'text-cyan-400',
    minBalance: 100_000_001,
    maxBalance: 500_000_000,
  },
  {
    name: 'Diamond',
    color: 'text-blue-400',
    minBalance: 500_000_001,
    maxBalance: 1_000_000_000,
  },
  {
    name: 'Legendary',
    color: 'text-purple-500',
    minBalance: 1_000_000_001,
    maxBalance: 5_000_000_000,
  },
  {
    name: 'Mythic',
    color: 'text-rose-500',
    minBalance: 5_000_000_001,
    maxBalance: Infinity,
  },
];

export function getPlayerLevel(balance: number): PlayerLevel {
  return playerLevels.find(
    level => balance >= level.minBalance && balance <= level.maxBalance
  ) || playerLevels[0];
}