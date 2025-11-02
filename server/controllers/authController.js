const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Doctor registration
exports.registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, fees, address, phone, experience_years, qualifications } = req.body;

    // Validation
    if (!name || !email || !password || !specialization || !fees || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if doctor exists
    const doctorExists = await Doctor.findByEmail(email);
    if (doctorExists) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create doctor
    const result = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      specialization,
      fees: parseFloat(fees),
      address,
      phone: phone || null,
      experience_years: experience_years ? parseInt(experience_years) : null,
      qualifications: qualifications || null
    });

    if (result.affectedRows === 1) {
      const doctor = await Doctor.findById(result.insertId);
      
      res.status(201).json({
        success: true,
        data: {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization,
          fees: doctor.fees,
          address: doctor.address,
          phone: doctor.phone,
          experience_years: doctor.experience_years,
          qualifications: doctor.qualifications,
          token: generateToken(doctor.id, 'doctor')
        },
        message: 'Doctor registered successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to register doctor'
      });
    }
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Doctor login
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const doctor = await Doctor.findByEmail(email);
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, doctor.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      data: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        fees: doctor.fees,
        address: doctor.address,
        phone: doctor.phone,
        experience_years: doctor.experience_years,
        qualifications: doctor.qualifications,
        token: generateToken(doctor.id, 'doctor')
      },
      message: 'Doctor logged in successfully'
    });
  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Patient registration
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, date_of_birth, address } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if patient exists
    const patientExists = await Patient.findByEmail(email);
    if (patientExists) {
      return res.status(400).json({
        success: false,
        message: 'Patient already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create patient
    const result = await Patient.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      date_of_birth: date_of_birth || null,
      address: address || null
    });

    if (result.affectedRows === 1) {
      const patient = await Patient.findById(result.insertId);
      
      res.status(201).json({
        success: true,
        data: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          date_of_birth: patient.date_of_birth,
          address: patient.address,
          token: generateToken(patient.id, 'patient')
        },
        message: 'Patient registered successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to register patient'
      });
    }
  } catch (error) {
    console.error('Patient registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Patient login
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const patient = await Patient.findByEmail(email);
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, patient.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      data: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        date_of_birth: patient.date_of_birth,
        address: patient.address,
        token: generateToken(patient.id, 'patient')
      },
      message: 'Patient logged in successfully'
    });
  } catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    let user;
    if (req.user.role === 'doctor') {
      user = await Doctor.findById(req.user.id);
    } else {
      user = await Patient.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...user,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};