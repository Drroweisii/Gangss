import { Mission } from '../types/game';

export interface GameLog {
  timestamp: number;
  type: 'mission_attempt' | 'mission_error' | 'mission_result' | 
        'cooldown_start' | 'cooldown_check' | 'cooldown_clear' | 
        'cooldown_save';
  missionId?: string;
  details: string;
  data?: Record<string, any>;
}

class Logger {
  private logs: GameLog[] = [];
  private readonly MAX_LOGS = 1000;

  log(type: GameLog['type'], details: string, data?: Record<string, any>, missionId?: string) {
    const logEntry: GameLog = {
      timestamp: Date.now(),
      type,
      details,
      data,
      missionId,
    };

    this.logs.unshift(logEntry);
    
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Format the data for better console readability
    const formattedData = data ? 
      '\n' + JSON.stringify(data, null, 2) : 
      '';

    console.log(
      `[${new Date(logEntry.timestamp).toISOString()}] ${type}: ${details}${formattedData}`
    );
  }

  getLogs(type?: GameLog['type'], missionId?: string): GameLog[] {
    return this.logs.filter(log => 
      (!type || log.type === type) && 
      (!missionId || log.missionId === missionId)
    );
  }

  getMissionLogs(missionId: string): GameLog[] {
    return this.getLogs(undefined, missionId);
  }

  getCooldownLogs(): GameLog[] {
    return this.logs.filter(log => 
      log.type.startsWith('cooldown_')
    );
  }

  clear() {
    this.logs = [];
    console.log('[Logger] Cleared all logs');
  }
}

export const gameLogger = new Logger();