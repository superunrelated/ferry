import { useState, useEffect, createContext, useContext } from 'react';

export type TimeFormat = '24h' | '12h';

const STORAGE_KEY = 'ferry-time-format';

export function useTimeFormat() {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() => {
    if (typeof window === 'undefined') return '24h';

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === '12h' ? '12h' : '24h';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEY, timeFormat);
  }, [timeFormat]);

  const toggleTimeFormat = () => {
    setTimeFormat((prev) => (prev === '24h' ? '12h' : '24h'));
  };

  const formatTime = (time24: string): string => {
    if (timeFormat === '24h') return time24;

    const [hoursStr, minutes] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const period = hours >= 12 ? 'pm' : 'am';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes}${period}`;
  };

  return {
    timeFormat,
    toggleTimeFormat,
    formatTime,
  };
}

const TimeFormatContext = createContext<{
  timeFormat: TimeFormat;
  toggleTimeFormat: () => void;
  formatTime: (time24: string) => string;
} | null>(null);

export const TimeFormatProvider = TimeFormatContext.Provider;

export function useTimeFormatContext() {
  const context = useContext(TimeFormatContext);
  if (!context) {
    throw new Error(
      'useTimeFormatContext must be used within a TimeFormatProvider'
    );
  }
  return context;
}
