'use client';

import React from 'react';
import { Modal } from './Modal';
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

export interface FilterFieldOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  placeholder: string;
  options: FilterFieldOption[];
  type?: 'select' | 'button-group';
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  filters: FilterField[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, val: any) => void;
  onClearFilters: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  title = 'Filter Data',
  subtitle = 'Saring dan cari data secara dinamis berdasarkan parameter pilihan Anda.',
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters = Object.keys(activeFilters).some(
    (key) => activeFilters[key] !== undefined && activeFilters[key] !== ''
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="md"
    >
      <div className="space-y-6" id="dynamic-filter-modal-content">
        <div className="grid grid-cols-1 gap-5">
          {filters.map((f) => {
            const currentValue = activeFilters[f.key] || '';
            const isButtonGroup = f.type === 'button-group' || f.options.length <= 4;

            return (
              <div key={f.key} className="space-y-2 flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {f.label}
                </label>

                {isButtonGroup ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onFilterChange(f.key, '')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        currentValue === ''
                          ? 'bg-slate-900 border-slate-950 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {f.placeholder}
                    </button>
                    {f.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onFilterChange(f.key, opt.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                          currentValue === opt.value
                            ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {currentValue === opt.value && <Check className="w-3.5 h-3.5" />}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <select
                    className="block w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                    value={currentValue}
                    onChange={(e) => onFilterChange(f.key, e.target.value)}
                    id={`filter-modal-select-${f.key}`}
                  >
                    <option value="">{f.placeholder}</option>
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions inside Modal */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4">
          <button
            type="button"
            onClick={() => {
              onClearFilters();
              onClose();
            }}
            disabled={!hasActiveFilters}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              hasActiveFilters
                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Semua Filter</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </Modal>
  );
};
