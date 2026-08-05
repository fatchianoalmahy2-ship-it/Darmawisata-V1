'use client';

import React from 'react';

export interface StandardTableProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const StandardTable: React.FC<StandardTableProps> = ({
  children,
  className = '',
  containerClassName = '',
}) => {
  return (
    <div
      className={`w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs no-scrollbar ${containerClassName}`}
    >
      <table
        className={`w-full text-left text-xs sm:text-sm text-slate-700 border-collapse ${className}`}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <thead
      className={`bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase tracking-wider font-extrabold text-slate-600 ${className}`}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <tbody className={`divide-y divide-slate-100 ${className}`}>{children}</tbody>;
};

export const TableRow: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-slate-50/80 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<{
  children?: React.ReactNode;
  isHeader?: boolean;
  className?: string;
  colSpan?: number;
}> = ({ children, isHeader = false, className = '', colSpan }) => {
  const Component = isHeader ? 'th' : 'td';
  const paddingClass = isHeader ? 'px-3 py-3' : 'px-3 py-2.5';
  return (
    <Component colSpan={colSpan} className={`${paddingClass} align-middle ${className}`}>
      {children}
    </Component>
  );
};
