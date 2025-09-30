import React from 'react';
import { Progress } from './ui/progress';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

export function Timer({ timeLeft, totalTime }: TimerProps) {
  const percentage = (timeLeft / totalTime) * 100;
  const isWarning = percentage <= 25;
  const isCritical = percentage <= 10;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2 ${
        isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-blue-600'
      }`}>
        {isCritical ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <span className="font-mono text-sm">
          {formatTime(timeLeft)}
        </span>
      </div>
      
      <div className="w-24">
        <Progress 
          value={percentage} 
          className={`h-2 ${
            isCritical ? '[&>div]:bg-red-500' : 
            isWarning ? '[&>div]:bg-yellow-500' : 
            '[&>div]:bg-blue-500'
          }`}
        />
      </div>
      
      <span className="text-xs text-muted-foreground">
        {formatTime(totalTime)}
      </span>
    </div>
  );
}