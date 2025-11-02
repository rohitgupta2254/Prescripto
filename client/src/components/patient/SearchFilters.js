import React from 'react';
import { SPECIALIZATIONS } from '../../utils/constants';
import '../../styles/Patient.css';

const SearchFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 0);

  return (
    <div className="search-filters">
      <div className="filters-header">
        <h3>Filter Doctors</h3>
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="btn btn-text">
            Clear All
          </button>
        )}
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label className="filter-label">Specialization</label>
          <select
            value={filters.specialization || ''}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            className="filter-select"
          >
            <option value="">All Specializations</option>
            {SPECIALIZATIONS.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Location</label>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="filter-input"
            placeholder="City or area"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Minimum Rating</label>
          <select
            value={filters.minRating || 0}
            onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
            className="filter-select"
          >
            <option value={0}>Any Rating</option>
            <option value={4}>4+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Max Fee ($)</label>
          <input
            type="number"
            value={filters.maxFees || ''}
            onChange={(e) => handleFilterChange('maxFees', e.target.value ? parseInt(e.target.value) : '')}
            className="filter-input"
            placeholder="No limit"
            min="0"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span>Active filters:</span>
          {filters.specialization && (
            <span className="filter-tag">
              {filters.specialization}
              <button onClick={() => handleFilterChange('specialization', '')}>×</button>
            </span>
          )}
          {filters.location && (
            <span className="filter-tag">
              {filters.location}
              <button onClick={() => handleFilterChange('location', '')}>×</button>
            </span>
          )}
          {filters.minRating > 0 && (
            <span className="filter-tag">
              {filters.minRating}+ Stars
              <button onClick={() => handleFilterChange('minRating', 0)}>×</button>
            </span>
          )}
          {filters.maxFees && (
            <span className="filter-tag">
              Under ${filters.maxFees}
              <button onClick={() => handleFilterChange('maxFees', '')}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;