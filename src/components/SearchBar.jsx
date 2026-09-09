import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search…', label = 'Search' }) {
  return (
    <label className="search-field">
      <span className="sr-only">{label}</span>
      <Search size={17} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search">
          <X size={15} />
        </button>
      )}
    </label>
  );
}
