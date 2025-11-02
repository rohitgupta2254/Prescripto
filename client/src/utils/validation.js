export const validateDoctorRegistration = (data) => {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!data.specialization?.trim()) {
    errors.specialization = 'Specialization is required';
  }

  if (!data.fees || data.fees <= 0) {
    errors.fees = 'Valid consultation fee is required';
  }

  if (!data.address?.trim()) {
    errors.address = 'Address is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePatientRegistration = (data) => {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateAppointment = (data) => {
  const errors = {};

  if (!data.appointment_date) {
    errors.appointment_date = 'Date is required';
  }

  if (!data.appointment_time) {
    errors.appointment_time = 'Time is required';
  }

  if (!data.consultation_type) {
    errors.consultation_type = 'Consultation type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateProfile = (data, userType) => {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (userType === 'doctor') {
    if (!data.specialization?.trim()) {
      errors.specialization = 'Specialization is required';
    }

    if (!data.fees || data.fees <= 0) {
      errors.fees = 'Valid consultation fee is required';
    }

    if (!data.address?.trim()) {
      errors.address = 'Address is required';
    }
  }

  if (data.phone && !/^\+?[\d\s-()]{10,}$/.test(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};