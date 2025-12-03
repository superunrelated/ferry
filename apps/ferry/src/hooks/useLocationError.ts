import { useState, useEffect } from 'react';

export function useLocationError(error: string | null) {
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  return {
    showErrorDialog,
    setShowErrorDialog,
  };
}
