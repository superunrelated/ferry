import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ferry-vision-impaired-mode';

export function useVisionImpaired() {
  const [isVisionImpaired, setIsVisionImpaired] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEY, String(isVisionImpaired));

    const root = document.documentElement;
    if (isVisionImpaired) {
      root.classList.add('vision-impaired');
    } else {
      root.classList.remove('vision-impaired');
    }
  }, [isVisionImpaired]);

  const toggleVisionImpaired = () => {
    setIsVisionImpaired((prev) => !prev);
  };

  return {
    isVisionImpaired,
    toggleVisionImpaired,
  };
}
