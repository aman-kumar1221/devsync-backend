const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsync_super_secret_key';

// 1. SIGNUP ROUTE (Register a new user)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, skills, role } = req.body;

    // Check if the user already exists in the database
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash the password securely before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user document instance
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      skills: skills || [],
      role
    });

    // Save user to MongoDB
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. LOGIN ROUTE (Authenticate user & issue cookie token)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by their email string
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }

    // Compare plain-text password with the stored hashed password string
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }

    // Generate a secure JWT session token containing their unique database ID
    const token = jwt.sign(
      { userId: user._id }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // Store the token directly inside an HTTP-only browser cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false // Change to true when deploying with HTTPS on Render
    });

    res.status(200).json({ 
      message: 'Logged in successfully', 
      user: { name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the configured router object so app.js can use it
module.exports = router;