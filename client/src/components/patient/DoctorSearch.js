import React, { useState } from 'react';
import { useDoctors } from '../../hooks/useDoctors';
import DoctorCard from './DoctorCard';
import SearchFilters from './SearchFilters';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/Patient.css';

const DoctorSearch = () => {
  const { doctors, loading, error, filters, searchDoctors, clearFilters } = useDoctors();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
    searchDoctors({ ...filters, search: query });
  };

  const handleFilterChange = (newFilters) => {
    searchDoctors(newFilters);
  };

  return (
    <div className="doctor-search-page">
      <div className="search-header">
        <h1>Find the Right Doctor</h1>
        <p>Book appointments with trusted healthcare professionals</p>
      </div>

      <SearchFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <div className="search-results">
        {loading && <LoadingSpinner text="Searching doctors..." />}
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => searchDoctors(filters)} className="btn btn-outline">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="results-header">
              <h2>
                {doctors.length} Doctor{doctors.length !== 1 ? 's' : ''} Found
                {filters.specialization && ` in ${filters.specialization}`}
              </h2>
            </div>

            <div className="doctors-grid">
              {doctors.map(doctor => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onBookAppointment={(doctorId) => {
                    // This function can be used for quick booking
                    console.log('Quick book for doctor:', doctorId);
                  }}
                />
              ))}
            </div>

            {doctors.length === 0 && (
              <div className="empty-state">
                <h3>No doctors found</h3>
                <p>Try adjusting your search filters or search in a different location.</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorSearch;