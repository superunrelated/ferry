import { cva, vi } from '@ferry/ui';

const spinner = cva(
  'inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-600 border-t-cyan-400'
);
const spinnerVisionImpaired =
  'vision-impaired:h-12 vision-impaired:w-12 vision-impaired:border-white vision-impaired:border-t-cyan-500 vision-impaired:border-4';

const text = cva('text-slate-400 mt-4');
const textVisionImpaired =
  'vision-impaired:text-base vision-impaired:text-white vision-impaired:font-bold';

export function LoadingState() {
  return (
    <div className="text-center py-12">
      <div className={vi(spinner(), spinnerVisionImpaired)}></div>
      <div className={vi(text(), textVisionImpaired)}>Loading...</div>
    </div>
  );
}
