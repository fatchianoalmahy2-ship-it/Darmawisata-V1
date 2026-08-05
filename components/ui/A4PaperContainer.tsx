'use client';

import React from 'react';

export interface A4PaperContainerProps {
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  title?: string;
  className?: string;
}

export const A4PaperContainer: React.FC<A4PaperContainerProps> = ({
  children,
  headerActions,
  title,
  className = '',
}) => {
  return (
    <div className="space-y-4">
      {/* Non-printable Action Toolbar */}
      {headerActions && (
        <div className="no-print bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
          {title && <h3 className="font-bold text-sm text-slate-100">{title}</h3>}
          <div className="flex items-center gap-2.5 ml-auto">{headerActions}</div>
        </div>
      )}

      {/* A4 Paper Box Preview */}
      <div className="overflow-x-auto pb-6 pt-2 flex justify-center bg-slate-100/80 rounded-2xl p-2 sm:p-6 no-scrollbar">
        <div
          className={`printable-area bg-white shadow-xl border border-slate-300 mx-auto rounded-xs p-[15mm] w-[210mm] min-h-[297mm] max-w-full text-slate-900 font-serif leading-relaxed text-sm box-border relative transition-all ${className}`}
          id="printable-a4-document"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
