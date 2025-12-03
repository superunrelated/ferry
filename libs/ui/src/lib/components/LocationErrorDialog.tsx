import * as AlertDialog from '@radix-ui/react-alert-dialog';

export interface LocationErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  onRetry: () => void;
}

export function LocationErrorDialog({
  open,
  onOpenChange,
  error,
  onRetry,
}: LocationErrorDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 max-w-md w-full z-50 vision-impaired:bg-black vision-impaired:border-white vision-impaired:border-2">
          <AlertDialog.Title className="text-lg font-bold text-slate-100 mb-2 vision-impaired:text-xl vision-impaired:text-white">
            Location Error
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-slate-300 mb-6 vision-impaired:text-base vision-impaired:text-white">
            {error?.includes('denied')
              ? 'Location access denied. Please enable location services to see ferries from your location.'
              : 'Unable to get your location.'}
          </AlertDialog.Description>
          <div className="flex gap-3 justify-end">
            <AlertDialog.Cancel asChild>
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors vision-impaired:text-base vision-impaired:font-bold vision-impaired:bg-gray-900 vision-impaired:text-white vision-impaired:border-2 vision-impaired:border-white vision-impaired:hover:bg-gray-800"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={() => {
                  onOpenChange(false);
                  onRetry();
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20 vision-impaired:text-base vision-impaired:font-bold vision-impaired:bg-cyan-600 vision-impaired:border-2 vision-impaired:border-white"
              >
                Try again
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

