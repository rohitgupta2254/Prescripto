import React, { useState } from 'react';
import DoctorProfileForm from '../../components/doctor/DoctorProfileForm';
import AvailabilityManager from '../../components/doctor/AvailabilityManager';
import '../../styles/Doctor.css';

const DoctorProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProfileUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="doctor-profile-page">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your professional information and availability</p>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button
          className={`tab-button ${activeTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          Availability
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <DoctorProfileForm onUpdate={handleProfileUpdate} />
        )}
        {activeTab === 'availability' && (
          <AvailabilityManager key={refreshKey} />
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;