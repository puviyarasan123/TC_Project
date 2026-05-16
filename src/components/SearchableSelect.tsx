import React, { useState, useRef, useEffect } from 'react';
import './SearchableSelect.css';

interface Props {
  name: string;
  value: string;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (name: string, value: string) => void;
}

const SearchableSelect: React.FC<Props> = ({ name, value, options, placeholder = '-- Select --', disabled, onChange }) => {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const wrapRef               = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (val: string) => {
    onChange(name, val);
    setOpen(false);
    setQuery('');
  };

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(name, '');
    setOpen(false);
    setQuery('');
  };

  return (
    <div className={`ss-wrap${disabled ? ' ss-disabled' : ''}`} ref={wrapRef}>
      {/* Trigger */}
      <div className={`ss-trigger${open ? ' ss-open' : ''}`} onClick={handleOpen}>
        <span className={`ss-value${!value ? ' ss-placeholder' : ''}`}>
          {value || placeholder}
        </span>
        <span className="ss-icons">
          {value && !disabled && (
            <span className="ss-clear" onClick={handleClear}>✕</span>
          )}
          <span className="ss-arrow">{open ? '▲' : '▼'}</span>
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="ss-dropdown">
          <div className="ss-search-wrap">
            <span className="ss-search-icon">🔍</span>
            <input
              ref={inputRef}
              className="ss-search"
              placeholder="Search…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <span className="ss-search-clear" onClick={() => setQuery('')}>✕</span>
            )}
          </div>
          <div className="ss-list">
            {filtered.length === 0 ? (
              <div className="ss-no-results">No results for "{query}"</div>
            ) : (
              filtered.map(opt => (
                <div
                  key={opt}
                  className={`ss-option${opt === value ? ' ss-selected' : ''}`}
                  onClick={() => select(opt)}
                >
                  {opt}
                  {opt === value && <span className="ss-check">✓</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
