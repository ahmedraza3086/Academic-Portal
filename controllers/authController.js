const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h'; // Token valid for 24 hours

// Login handler
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    let user = null;
    let role = null;

    // 1. Check Admin table
    const [adminRows] = await db.query(
      'SELECT admin_id AS id, first_name, last_name, email, password_hash, role FROM admin WHERE email = ?',
      [email]
    );
    if (adminRows.length > 0) {
      user = adminRows[0];
      role = 'admin';
    }

    // 2. Check Faculty table
    if (!user) {
      const [facultyRows] = await db.query(
        'SELECT faculty_id AS id, first_name, last_name, email, password_hash, role FROM faculty WHERE email = ?',
        [email]
      );
      if (facultyRows.length > 0) {
        user = facultyRows[0];
        role = 'faculty';
      }
    }

    // 3. Check Student table
    if (!user) {
      const [studentRows] = await db.query(
        'SELECT student_id AS id, first_name, last_name, email, password_hash, role FROM student WHERE email = ?',
        [email]
      );
      if (studentRows.length > 0) {
        user = studentRows[0];
        role = 'student';
      }
    }

    // No user found
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      email: user.email,
      role: role,
      name: `${user.first_name} ${user.last_name}`
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    // Send response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    let table = '';
    
    switch (role) {
      case 'admin': table = 'admin'; break;
      case 'faculty': table = 'faculty'; break;
      case 'student': table = 'student'; break;
      default: return res.status(400).json({ message: 'Invalid role' });
    }

    const [rows] = await db.query(
      `SELECT ${role === 'admin' ? 'admin_id' : role + '_id'} AS id, 
              first_name, last_name, email, role FROM ${table} WHERE ${role}_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { login, getProfile };