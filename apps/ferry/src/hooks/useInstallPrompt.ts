import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if already shown prompt in this session
    const promptShown = sessionStorage.getItem('install-prompt-shown');
    if (promptShown || isStandaloneMode) {
      return;
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      // We'll show our custom banner instead and call prompt() when user clicks Install
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Show our custom prompt banner after a delay
      // The browser warning is expected - we're intentionally preventing default
      // to show our custom UI, and will call prompt() when user clicks Install
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
    };

    // For iOS, show prompt after a delay if not already installed
    if (iOS && !isStandaloneMode) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // Show the native browser install prompt
        // This is called when user clicks our custom "Install" button
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          setShowPrompt(false);
          setIsInstallable(false);
        }
      } catch (error) {
        // Prompt may have already been shown or user dismissed it
        console.log('Install prompt error:', error);
      } finally {
        // Clear the deferred prompt after use
        setDeferredPrompt(null);
      }
    }

    // Mark as shown in session
    sessionStorage.setItem('install-prompt-shown', 'true');
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('install-prompt-shown', 'true');
    setShowPrompt(false);
  };

  return {
    isInstallable,
    isIOS,
    isStandalone,
    showPrompt,
    handleInstallClick,
    handleDismiss,
  };
}
