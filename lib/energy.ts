import { differenceInMinutes } from 'date-fns';

export function getMaxEnergy(level: number): number {
  if (level >= 41) return 500;
  if (level >= 31) return 400;
  if (level >= 21) return 300;
  return 200;
}

export function getCurrentEnergy(storedEnergy: number, lastUpdate: Date | string, level: number): number {
  const maxEnergy = getMaxEnergy(level);
  
  if (storedEnergy >= maxEnergy) {
    return maxEnergy;
  }

  const minsPassed = differenceInMinutes(new Date(), new Date(lastUpdate));
  if (minsPassed <= 0) return storedEnergy;

  const generatedEnergy = Math.floor(minsPassed / 8);
  const currentEnergy = storedEnergy + generatedEnergy;
  
  return currentEnergy > maxEnergy ? maxEnergy : currentEnergy;
}

export function getTimeUntilFull(storedEnergy: number, lastUpdate: Date | string, level: number): { hours: number, minutes: number } | null {
  const maxEnergy = getMaxEnergy(level);
  const currentEnergy = getCurrentEnergy(storedEnergy, lastUpdate, level);
  
  if (currentEnergy >= maxEnergy) return null; // Already full

  // Energy needed to reach max
  const energyNeeded = maxEnergy - currentEnergy;
  
  // Calculate remaining minutes from the current 8-minute cycle
  const minsPassedThisCycle = differenceInMinutes(new Date(), new Date(lastUpdate)) % 8;
  const minsToNextEnergy = 8 - minsPassedThisCycle;
  
  const totalMinutesNeeded = ((energyNeeded - 1) * 8) + minsToNextEnergy;

  const hours = Math.floor(totalMinutesNeeded / 60);
  const minutes = totalMinutesNeeded % 60;
  
  return { hours, minutes };
}

export function formatTimeRemaining(time: { hours: number, minutes: number } | null): string {
  if (!time) return "Full";
  if (time.hours > 0) {
    return `${time.hours}h ${time.minutes}m`;
  }
  return `${time.minutes}m`;
}
