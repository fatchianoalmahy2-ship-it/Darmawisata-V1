'use client';

import React from 'react';

interface ActionButton {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  actions?: ActionButton[];
}

export function PageHeader({ title, subtitle, badgeText, actions = [] }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between" id="core-page-header">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight" id="core-page-title">
            {title}
          </h1>
          {badgeText && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
              id="core-page-badge"
            >
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed" id="core-page-subtitle">
            {subtitle}
          </p>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" id="core-page-actions">
          {actions.map((act, index) => {
            const btnColor =
              act.variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                : act.variant === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500'
                : act.variant === 'secondary'
                ? 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-indigo-500'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';

            return (
              <button
                key={index}
                id={`core-header-btn-${index}`}
                onClick={act.onClick}
                disabled={act.disabled}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${btnColor}`}
              >
                {act.icon}
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
