'use client';

import React from 'react';

export interface InfoCardProps {
  title: string;
  badge?: string;
  value?: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const variantCardStyles: Record<NonNullable<InfoCardProps['variant']>, string> = {
  default: 'bg-white border-slate-200 text-slate-900',
  success: 'bg-emerald-50/50 border-emerald-200 text-emerald-950',
  warning: 'bg-amber-50/60 border-amber-200 text-amber-950',
  danger: 'bg-rose-50/60 border-rose-200 text-rose-950',
  info: 'bg-sky-50/50 border-sky-200 text-sky-950',
};

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  badge,
  value,
  subtitle,
  icon,
  variant = 'default',
  footer,
  children,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${variantCardStyles[variant]} ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
            {title}
          </span>
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 border border-current/20 shadow-2xs">
              {badge}
            </span>
          )}
        </div>

        {value !== undefined && (
          <div className="flex items-baseline justify-between gap-3 mt-1.5">
            <h4 className="text-2xl font-black tracking-tight">{value}</h4>
            {icon && <div className="text-xl opacity-80">{icon}</div>}
          </div>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>

      {(subtitle || footer) && (
        <div className="mt-3 pt-2.5 border-t border-current/10 text-[11px] font-semibold opacity-80 flex items-center justify-between">
          {subtitle && <span>{subtitle}</span>}
          {footer && <div>{footer}</div>}
        </div>
      )}
    </div>
  );
};

export interface InfoCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const InfoCardGrid: React.FC<InfoCardGridProps> = ({
  children,
  columns = 2,
  className = '',
}) => {
  const colClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : columns === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return <div className={`grid ${colClass} gap-4 lg:gap-5 ${className}`}>{children}</div>;
};
