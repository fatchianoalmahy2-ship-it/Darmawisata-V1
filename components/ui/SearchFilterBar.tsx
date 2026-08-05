'use client';

import React, { useState } from 'react';
import { Search, RotateCcw, Printer, FileDown, SlidersHorizontal, X } from 'lucide-react';
import { FilterModal, FilterField } from './FilterModal';

interface FilterOption {
  key: string;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
}

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, val: any) => void;
  onClearFilters: () => void;
  onPrint?: () => void;
  onExportExcel?: () => void;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Cari...',
  filters = [],
  activeFilters,
  onFilterChange,
  onClearFilters,
  onPrint,
  onExportExcel,
}: SearchFilterBarProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const activeFiltersCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key] !== undefined && activeFilters[key] !== ''
  ).length;

  const hasAnyActive = activeFiltersCount > 0 || search.trim().length > 0;

  // Map FilterOption to FilterField
  const mappedFields: FilterField[] = filters.map((f) => ({
    key: f.key,
    label: f.label,
    placeholder: f.placeholder,
    options: f.options,
  }));

  return (
    <div className="flex flex-col gap-3 py-4" id="search-filter-bar">
      {/* Search & Actions Panel */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input with search icon */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            id="search-filter-input"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0" id="search-filter-actions">
          {filters.length > 0 && (
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs shrink-0 ${
                activeFiltersCount > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              id="action-btn-filter-modal"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-[9px] font-black bg-indigo-600 text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}

          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs shrink-0 cursor-pointer"
              id="action-btn-print"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          )}

          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs shrink-0 cursor-pointer"
              id="action-btn-excel"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          )}

          {hasAnyActive && (
            <button
              onClick={() => {
                onClearFilters();
                onSearchChange('');
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 transition-all shrink-0 cursor-pointer"
              id="action-btn-reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-1" id="active-filter-chips">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active:</span>
          {filters.map((f) => {
            const val = activeFilters[f.key];
            if (!val) return null;
            const optLabel = f.options.find((opt) => opt.value === val)?.label || val;
            return (
              <div
                key={f.key}
                className="inline-flex items-center gap-1 bg-indigo-50/60 text-indigo-700 border border-indigo-100/70 pl-2.5 pr-1.5 py-1 rounded-lg text-[10px] font-bold"
              >
                <span className="text-slate-400 font-medium">{f.label}:</span>
                <span>{optLabel}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange(f.key, '')}
                  className="p-0.5 rounded-full hover:bg-indigo-200/50 text-indigo-500 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Filter Modal */}
      {filters.length > 0 && (
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={mappedFields}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
        />
      )}
    </div>
  );
}
