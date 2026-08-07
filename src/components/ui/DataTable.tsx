import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from './Input';
import { cn } from '../../utils/cn';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T, index: number) => React.ReactNode);
  className?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKey?: (item: T) => string;
  pageSize?: number;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "Cari data...",
  searchKey,
  pageSize = 10,
  actions,
  emptyMessage = "Tidak ada data ditemukan."
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter((item) => {
      if (searchKey) return searchKey(item).toLowerCase().includes(lowerQuery);
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerQuery)
      );
    });
  }, [data, searchQuery, searchKey]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  
  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) range.push(i);
    return range;
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
      {/* Table Header / Toolbar */}
      <div className="p-6 border-b border-border bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-11 h-11 rounded-xl bg-white border-border shadow-none focus:ring-accent/10 transition-all font-medium py-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-border">
            Total: <span className="text-accent">{filteredData.length}</span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-border">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "px-6 py-4 text-xs font-semibold text-text-muted tracking-wide",
                    col.className
                  )}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-xs font-semibold text-text-muted tracking-wide text-right">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="p-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <p className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest">Memuat Data...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="p-20 text-center">
                   <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-2">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="text-[0.8rem] text-text-muted font-medium italic">{emptyMessage}</p>
                   </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <motion.tr 
                  key={item.id} 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIdx * 0.03 }}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={cn("px-6 py-5", col.className)}>
                      {typeof col.accessor === 'function' 
                        ? col.accessor(item, (currentPage - 1) * pageSize + rowIdx + 1) 
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 transition-all duration-300">
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredData.length > 0 && (
        <div className="px-6 py-5 border-t border-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <p className="text-[0.75rem] font-bold text-text-muted">
            Menampilkan{' '}
            <span className="text-text-header">{Math.min((currentPage - 1) * pageSize + 1, filteredData.length)}</span>
            {' '}–{' '}
            <span className="text-text-header">{Math.min(currentPage * pageSize, filteredData.length)}</span>
            {' '}dari{' '}
            <span className="text-accent font-black">{filteredData.length}</span> data
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-text-muted font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers()[0] > 1 && (
              <>
                <button onClick={() => setCurrentPage(1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-text-muted text-sm font-bold hover:border-accent hover:text-accent hover:bg-accent/5 transition-all">1</button>
                {getPageNumbers()[0] > 2 && <span className="w-9 h-9 flex items-center justify-center text-text-muted text-sm">…</span>}
              </>
            )}

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-bold transition-all",
                  page === currentPage
                    ? 'bg-accent border-accent text-white shadow-lg shadow-accent/25'
                    : 'border-border bg-white text-text-muted hover:border-accent hover:text-accent hover:bg-accent/5'
                )}
              >
                {page}
              </button>
            ))}

            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <>
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <span className="w-9 h-9 flex items-center justify-center text-text-muted text-sm">…</span>}
                <button onClick={() => setCurrentPage(totalPages)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-text-muted text-sm font-bold hover:border-accent hover:text-accent hover:bg-accent/5 transition-all">{totalPages}</button>
              </>
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-text-muted font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
