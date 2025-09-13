const User = require('../models/User');
const { generateToken } = require('../services/authService');

exports.register = async (req, res) => {
  try {
    console.log('📝 Register request received:', req.body);
    const { username, password, email, role } = req.body;
    
    // Input validation
    if (!username || !password || !email) {
      return res.status(400).json({ 
        error: 'Username, password, and email are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    console.log('👤 Creating user...');
    const user = new User({ username, password, email, role });
    console.log('💾 Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully');
    
    res.status(201).json({ 
      message: "User registered successfully",
      user: user.getProfile()
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        error: "Invalid credentials" 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: "Invalid credentials" 
      });
    }

    const token = generateToken(user);
    res.json({ 
      message: "Login successful",
      token,
      user: user.getProfile()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};