import { ReactNode, forwardRef } from 'react';
import { cva, vi } from '../utils/visionImpaired';

export interface CardProps {
  children: ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children: ReactNode;
}

export interface CardContentProps {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
}

const card = cva('bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden');
const cardVisionImpaired = 'vision-impaired:bg-black vision-impaired:border-white vision-impaired:border-2';

const cardHeader = cva('px-2 py-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-700/50');
const cardHeaderVisionImpaired = 'vision-impaired:bg-black vision-impaired:border-white vision-impaired:border-b-2';

export function Card({ children, className }: CardProps) {
  return (
    <div className={vi(card(), cardVisionImpaired, className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: CardHeaderProps) {
  return (
    <div className={vi(cardHeader(), cardHeaderVisionImpaired)}>
      {children}
    </div>
  );
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent({ children, scrollable = false, className }, ref) {
    return (
      <div
        ref={ref}
        className={`${
          scrollable
            ? 'overflow-auto h-full'
            : 'overflow-x-auto'
        } ${className || ''}`}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';
