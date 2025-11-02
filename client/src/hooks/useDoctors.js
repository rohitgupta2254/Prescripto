import { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';

export const useDoctors = (initialFilters = {}) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const searchDoctors = async (searchFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const response = await patientAPI.searchDoctors(searchFilters);
      setDoctors(response.data.data.doctors || []);
      setFilters(searchFilters);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search doctors');
      console.error('Error searching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      searchDoctors();
    }
  }, []);

  const clearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    searchDoctors(clearedFilters);
  };

  return {
    doctors,
    loading,
    error,
    filters,
    searchDoctors,
    clearFilters
  };
};