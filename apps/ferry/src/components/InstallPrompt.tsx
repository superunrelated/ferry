import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function InstallPrompt() {
  const { isInstallable, isIOS, showPrompt, handleInstallClick, handleDismiss } = useInstallPrompt();

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md animate-in slide-in-from-bottom-4">
      <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              Install Ferry App
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              {isIOS
                ? 'Add to your home screen for quick access and a better experience.'
                : 'Add to your home screen for quick access and offline support.'}
            </p>
            {isIOS ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-300 bg-slate-900/50 rounded-lg p-2">
                  <p className="font-medium mb-1">Tap the share button</p>
                  <p className="text-slate-400">Then select "Add to Home Screen"</p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Got it
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
                >
                  Later
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Dismiss"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

