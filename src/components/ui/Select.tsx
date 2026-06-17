import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [localValue, setLocalValue] = useState<string | number>('');
    const [dropdownPosition, setDropdownPosition] = useState<{
      top: number;
      left: number;
      width: number;
      openUpward: boolean;
    }>({ top: 0, left: 0, width: 0, openUpward: false });

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

    // Calculate dropdown position when opened
    const updatePosition = useCallback(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownMaxH = 300;
      const openUpward = spaceBelow < dropdownMaxH && spaceAbove > spaceBelow;

      setDropdownPosition({
        top: openUpward ? rect.top : rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        openUpward,
      });
    }, []);

    useEffect(() => {
      if (isOpen) {
        updatePosition();
      }
    }, [isOpen, updatePosition]);

    // Click outside to close dropdown (works with portal)
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          containerRef.current && !containerRef.current.contains(target) &&
          dropdownRef.current && !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Close on scroll of any ancestor (position would become stale)
    useEffect(() => {
      if (!isOpen) return;

      const handleScroll = (e: Event) => {
        // Don't close if scrolling inside the dropdown itself
        if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      };

      // Use capture to catch scroll on any ancestor
      document.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', () => setIsOpen(false));
      return () => {
        document.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', () => setIsOpen(false));
      };
    }, [isOpen]);

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
      }

      if (selectRef.current) {
        selectRef.current.value = valStr;
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

    // Dropdown JSX rendered via portal
    const dropdownContent = isOpen ? (
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: dropdownPosition.openUpward ? undefined : dropdownPosition.top,
          bottom: dropdownPosition.openUpward
            ? window.innerHeight - dropdownPosition.top + 6
            : undefined,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
        }}
        className="z-[9999] bg-white border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[300px]"
      >
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
              const isSelected = String(option.value) === String(currentValue);
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
    ) : null;

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

        {/* Dropdown rendered via portal to avoid overflow clipping */}
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </div>
    );
  }
);

Select.displayName = 'Select';
