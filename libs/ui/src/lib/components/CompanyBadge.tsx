import { FerryCompany } from '../types/timetable';

export interface CompanyBadgeProps {
  company: FerryCompany;
  slow?: boolean;
  variant?: 'rounded' | 'square';
  as?: 'span' | 'div';
}

export function CompanyBadge({
  company,
  slow = false,
  variant = 'rounded',
  as: Component = 'span',
}: CompanyBadgeProps) {
  const isFullers = company === 'Fullers';
  const roundedClass = variant === 'rounded' ? 'rounded-full' : 'rounded-md';
  const paddingClass = variant === 'rounded' ? 'px-3 py-1' : 'px-2.5 py-1';

  return (
    <Component
      className={`inline-flex items-center ${paddingClass} ${roundedClass} text-xs font-semibold vision-impaired:text-sm vision-impaired:font-bold ${
        isFullers
          ? 'bg-fullers/20 text-fullers border border-fullers/40 vision-impaired:bg-fullers vision-impaired:text-white vision-impaired:border-fullers vision-impaired:border-2'
          : 'bg-island-direct/20 text-island-direct border border-island-direct/40 vision-impaired:bg-island-direct vision-impaired:text-white vision-impaired:border-island-direct vision-impaired:border-2'
      }`}
    >
      {company}
      {slow && isFullers && (
        <span className="ml-1.5 text-orange-400 text-[10px] vision-impaired:text-xs vision-impaired:text-orange-300 vision-impaired:font-bold">*</span>
      )}
    </Component>
  );
}

