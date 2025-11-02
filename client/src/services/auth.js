// Auth utility functions
export const isAuthenticated = () => {
  return localStorage.getItem('prescripto_token') !== null;
};

export const getToken = () => {
  return localStorage.getItem('prescripto_token');
};

export const setToken = (token) => {
  localStorage.setItem('prescripto_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('prescripto_token');
};

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};