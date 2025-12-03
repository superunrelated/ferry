import { FerryCompany } from '../types/timetable';
import { cva, vi, type VariantProps } from '../utils/visionImpaired';

export interface CompanyBadgeProps {
  company: FerryCompany;
  slow?: boolean;
  variant?: 'rounded' | 'square';
  as?: 'span' | 'div';
}

const badge = cva('inline-flex items-center text-xs font-semibold', {
  variants: {
    variant: {
      rounded: 'px-3 py-1 rounded-full',
      square: 'px-2.5 py-1 rounded-md',
    },
    company: {
      fullers: 'bg-fullers/20 text-fullers border border-fullers/40',
      'island-direct':
        'bg-island-direct/20 text-island-direct border border-island-direct/40',
    },
  },
  defaultVariants: {
    variant: 'rounded',
  },
});

const badgeVisionImpaired = cva('', {
  variants: {
    company: {
      fullers:
        'vision-impaired:text-sm vision-impaired:font-bold vision-impaired:bg-fullers vision-impaired:text-white vision-impaired:border-fullers vision-impaired:border-2',
      'island-direct':
        'vision-impaired:text-sm vision-impaired:font-bold vision-impaired:bg-island-direct vision-impaired:text-white vision-impaired:border-island-direct vision-impaired:border-2',
    },
  },
});

const asterisk = cva('ml-1.5 text-orange-400 text-[10px]');
const asteriskVisionImpaired =
  'vision-impaired:text-xs vision-impaired:text-orange-300 vision-impaired:font-bold';

export function CompanyBadge({
  company,
  slow = false,
  variant = 'rounded',
  as: Component = 'span',
}: CompanyBadgeProps) {
  const companyKey = company === 'Fullers' ? 'fullers' : 'island-direct';

  return (
    <Component
      className={vi(
        badge({ variant, company: companyKey }),
        badgeVisionImpaired({ company: companyKey })
      )}
    >
      {company}
      {slow && company === 'Fullers' && (
        <span className={vi(asterisk(), asteriskVisionImpaired)}>*</span>
      )}
    </Component>
  );
}
