import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Search, ChevronDown, X } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, value, onChange, disabled, id, name }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);
    const [localValue, setLocalValue] = useState<string | number>('');

    // Merge forwarded ref with local ref
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(selectRef.current);
      } else {
        (ref as React.MutableRefObject<HTMLSelectElement | null>).current = selectRef.current;
      }
    }, [ref]);

    // Sync search query reset when closed
    useEffect(() => {
      if (!isOpen) {
        setSearchQuery('');
      }
    }, [isOpen]);

    // Click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Sync local state when the DOM value is modified programmatically (e.g., by React Hook Form)
    useEffect(() => {
      const el = selectRef.current;
      if (!el || value !== undefined) return;

      const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
      if (!descriptor || !descriptor.set) return;

      const originalSet = descriptor.set;

      Object.defineProperty(el, 'value', {
        set: function (val) {
          originalSet.call(this, val);
          setLocalValue(val);
        },
        get: descriptor.get,
        configurable: true,
      });

      // Set initial/default value
      setLocalValue(el.value);

      return () => {
        Object.defineProperty(el, 'value', descriptor);
      };
    }, [value]);

    const currentValue = value !== undefined ? value : localValue;

    // Find the currently selected option to show its label
    const selectedOption = useMemo(() => {
      return options.find((opt) => String(opt.value) === String(currentValue));
    }, [options, currentValue]);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return options;
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery]);

    // Helper to simulate React's select change event
    const handleSelectOption = (optValue: string | number) => {
      const valStr = String(optValue);
      
      if (value === undefined) {
        setLocalValue(optValue);
        if (selectRef.current) {
          selectRef.current.value = valStr;
        }
      }

      if (onChange) {
        // Build a fake change event matching standard React select behavior
        const fakeEvent = {
          target: selectRef.current || {
            value: valStr,
            name: name,
            id: id,
          },
          currentTarget: selectRef.current || {
            value: valStr,
            name: name,
            id: id,
          },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(fakeEvent);
      }
      setIsOpen(false);
    };

    const handleClearSelection = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleSelectOption('');
    };

    return (
      <div
        ref={containerRef}
        className="relative w-full text-[0.8125rem] text-text-main"
      >
        {/* Fake Select Box */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 border border-border rounded-xl bg-white cursor-pointer select-none transition-all focus:outline-none focus:border-accent min-h-[2.75rem] font-semibold text-left',
            isOpen && 'border-accent ring-2 ring-accent/10',
            disabled && 'cursor-not-allowed opacity-50 bg-slate-50 border-border',
            className
          )}
        >
          <span className={cn('truncate', !selectedOption && 'text-text-muted font-normal')}>
            {selectedOption ? selectedOption.label : placeholder || '-- Pilih --'}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 text-text-muted ml-2">
            {/* Show reset/clear button if there is a selected value and it is not empty */}
            {selectedOption && String(selectedOption.value) !== '' && !disabled && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-0.5 rounded-md hover:bg-slate-100 hover:text-text-header transition-colors"
                title="Reset pilihan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown className={cn('w-4 h-4 transition-transform duration-200 shrink-0', isOpen && 'rotate-180')} />
          </div>
        </div>

        {/* Hidden select field for HTML form compatibility / refs / validation libraries */}
        <select
          ref={selectRef}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt, idx) => (
            <option key={`${opt.value}-${idx}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-[999] left-0 right-0 mt-1.5 bg-white border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[300px]">
            {/* Search Input Box */}
            <div className="p-3 border-b border-border bg-slate-50/50 flex items-center gap-2">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="w-full bg-transparent border-none p-0 text-[0.8125rem] font-semibold text-text-header placeholder:text-text-muted focus:outline-none focus:ring-0"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-md hover:bg-slate-100 text-text-muted transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="overflow-y-auto py-1.5 divide-y divide-slate-50">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, idx) => {
                  const isSelected = String(option.value) === String(value);
                  if (option.disabled) {
                    return (
                      <div
                        key={`${option.value}-${idx}`}
                        className="px-4 py-2 text-[0.7rem] font-extrabold uppercase tracking-widest text-text-muted bg-slate-50/50 select-none italic"
                      >
                        {option.label}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`${option.value}-${idx}`}
                      onClick={() => handleSelectOption(option.value)}
                      className={cn(
                        'px-4 py-2.5 font-semibold cursor-pointer select-none hover:bg-accent/5 hover:text-accent transition-colors text-left flex items-center justify-between',
                        isSelected && 'bg-accent/10 text-accent font-extrabold'
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-4 text-center text-text-muted italic">
                  Tidak ditemukan
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
