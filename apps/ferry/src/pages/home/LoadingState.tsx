import { cva, vi } from '@ferry/ui';

const spinner = cva('inline-block animate-spin rounded-full', {
  variants: {
    base: {
      default: 'h-8 w-8 border-4 border-slate-600 border-t-cyan-400',
    },
  },
  defaultVariants: {
    base: 'default',
  },
});

const spinnerVisionImpaired =
  'vision-impaired:h-12 vision-impaired:w-12 vision-impaired:border-white vision-impaired:border-t-cyan-500 vision-impaired:border-4';

const text = cva('mt-4', {
  variants: {
    base: {
      default: 'text-slate-400',
    },
  },
  defaultVariants: {
    base: 'default',
  },
});

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
