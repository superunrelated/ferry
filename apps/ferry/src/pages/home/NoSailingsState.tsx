import { cva, vi } from '@ferry/ui';

const text = cva('text-slate-400');
const textVisionImpaired =
  'vision-impaired:text-base vision-impaired:text-white vision-impaired:font-bold';

export function NoSailingsState() {
  return (
    <div className="text-center py-12">
      <div className={vi(text(), textVisionImpaired)}>
        No more sailings today
      </div>
    </div>
  );
}
