export interface Mission {
  id: string;
  name: string;
  type: 'bike' | 'car' | 'house' | 'special';
  class: 'C' | 'B' | 'A' | 'S';
  reward: number;
  cooldown: number;
  description: string;
  image: string;
}

export interface Player {
  balance: number;
  completedMissions: string[];
  prisonTime?: number; // Timestamp when prison sentence ends
}

export interface MissionResult {
  success: boolean;
  reward: number;
  message: string;
  imprisoned?: boolean;
}