import { useState, useMemo } from 'react';

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
}

export interface TableQueryOptions<T> {
  initialSort?: SortConfig;
  initialPageSize?: number;
  searchFields: (keyof T)[];
  filterFn?: (item: T, filters: Record<string, any>) => boolean;
}

export function useTableQuery<T>(data: T[], options: TableQueryOptions<T>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig>(
    options.initialSort || { field: '', direction: 'asc' }
  );
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [pagination, setPagination] = useState<PaginationConfig>({
    currentPage: 1,
    pageSize: options.initialPageSize || 10,
  });

  // Reset pagination when search or filters change
  const handleSearchChange = (term: string) => {
    setSearch(term);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (value === '' || value === undefined || value === null) {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      return updated;
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSort = (field: string) => {
    setSort((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { field, direction: 'asc' };
    });
  };

  // Process data: search -> filter -> sort -> paginate
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Search
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((item) =>
        options.searchFields.some((field) => {
          const val = item[field];
          if (val === undefined || val === null) return false;
          return String(val).toLowerCase().includes(lowerSearch);
        })
      );
    }

    // 2. Filter
    if (options.filterFn && Object.keys(filters).length > 0) {
      result = result.filter((item) => options.filterFn!(item, filters));
    }

    // 3. Sort
    if (sort.field) {
      result.sort((a, b) => {
        const aVal = a[sort.field as keyof T];
        const bVal = b[sort.field as keyof T];

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sort.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Fallback to string comparison
        return sort.direction === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [data, search, filters, sort, options]);

  // Paginated chunk
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    return processedData.slice(startIndex, startIndex + pagination.pageSize);
  }, [processedData, pagination]);

  const totalPages = Math.ceil(processedData.length / pagination.pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
  };

  return {
    search,
    setSearch: handleSearchChange,
    sort,
    setSort,
    handleSort,
    filters,
    setFilters: handleFilterChange,
    handleClearFilters,
    pagination,
    setPagination,
    processedData, // filtered & sorted (all matching items)
    paginatedData, // current page slice
    totalPages,
    handlePageChange,
  };
}
