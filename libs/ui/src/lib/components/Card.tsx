import { ReactNode, forwardRef } from 'react';

export interface CardProps {
  children: ReactNode;
}

export interface CardHeaderProps {
  children: ReactNode;
}

export interface CardContentProps {
  children: ReactNode;
  scrollable?: boolean;
}

export function Card({ children }: CardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
      {children}
    </div>
  );
}

export function CardHeader({ children }: CardHeaderProps) {
  return (
    <div className="px-6 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-700/50">
      {children}
    </div>
  );
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent({ children, scrollable = false }, ref) {
    return (
      <div
        ref={ref}
        className={
          scrollable
            ? 'overflow-auto max-h-[calc(100vh-200px)]'
            : 'overflow-x-auto'
        }
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

