export function getMinutesUntil(time: string): number {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const [hours, minutes] = time.split(':').map(Number);
  const target = hours * 60 + minutes;
  if (target >= nowMinutes) {
    return target - nowMinutes;
  }
  // If time has passed, it's tomorrow
  return 24 * 60 - nowMinutes + target;
}

export function formatMinutesUntil(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}
