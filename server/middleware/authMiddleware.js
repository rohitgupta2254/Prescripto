const jwt = require('jsonwebtoken');
const db = require('../config/database');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user is doctor or patient
      let user;
      if (decoded.role === 'doctor') {
        const [rows] = await db.execute('SELECT id, name, email, specialization FROM doctors WHERE id = ?', [decoded.id]);
        user = rows[0];
      } else if (decoded.role === 'patient') {
        const [rows] = await db.execute('SELECT id, name, email FROM patients WHERE id = ?', [decoded.id]);
        user = rows[0];
      }

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: decoded.role,
        ...(decoded.role === 'doctor' && { specialization: user.specialization })
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };