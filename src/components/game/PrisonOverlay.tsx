import React from 'react';
import { Lock } from 'lucide-react';

interface PrisonOverlayProps {
  releaseTime: number | string | Date;
}

export default function PrisonOverlay({ releaseTime }: PrisonOverlayProps) {
  const [timeLeft, setTimeLeft] = React.useState<number>(0);

  React.useEffect(() => {
    // Convert releaseTime to number if it's a string or Date
    const releaseTimestamp = typeof releaseTime === 'number' 
      ? releaseTime 
      : new Date(releaseTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, releaseTimestamp - now);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        window.location.reload();
      }
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [releaseTime]);

  const formatTime = (ms: number): string => {
    if (ms <= 0) return '0:00';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-red-500">You're in Prison!</h2>
        <p className="text-gray-400">
          Your mission failed and you got caught. You'll be released in:
        </p>
        <div className="text-4xl font-mono text-red-400">
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
}
