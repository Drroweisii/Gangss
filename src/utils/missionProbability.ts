import { Mission } from '../types/game';
import { PlayerLevel } from './playerLevel';

interface MissionProbability {
  class: Mission['class'];
  probability: number;
}

const levelProbabilities: Record<string, MissionProbability[]> = {
  Bronze: [
    { class: 'C', probability: 0.95 },
    { class: 'B', probability: 0.04 },
    { class: 'A', probability: 0.009 },
    { class: 'S', probability: 0.001 },
  ],
  Silver: [
    { class: 'C', probability: 0.85 },
    { class: 'B', probability: 0.10 },
    { class: 'A', probability: 0.04 },
    { class: 'S', probability: 0.01 },
  ],
  Gold: [
    { class: 'C', probability: 0.75 },
    { class: 'B', probability: 0.15 },
    { class: 'A', probability: 0.08 },
    { class: 'S', probability: 0.02 },
  ],
  Platinum: [
    { class: 'C', probability: 0.60 },
    { class: 'B', probability: 0.25 },
    { class: 'A', probability: 0.10 },
    { class: 'S', probability: 0.05 },
  ],
  Diamond: [
    { class: 'C', probability: 0.50 },
    { class: 'B', probability: 0.30 },
    { class: 'A', probability: 0.15 },
    { class: 'S', probability: 0.05 },
  ],
  Legendary: [
    { class: 'C', probability: 0.40 },
    { class: 'B', probability: 0.30 },
    { class: 'A', probability: 0.20 },
    { class: 'S', probability: 0.10 },
  ],
  Mythic: [
    { class: 'C', probability: 0.30 },
    { class: 'B', probability: 0.30 },
    { class: 'A', probability: 0.25 },
    { class: 'S', probability: 0.15 },
  ],
};

export function getMissionSuccessProbability(mission: Mission, playerLevel: PlayerLevel): number {
  const levelProbs = levelProbabilities[playerLevel.name];
  const missionProb = levelProbs.find(prob => prob.class === mission.class);
  return missionProb?.probability || 0;
}