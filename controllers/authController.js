const User = require('../models/User');
const { generateToken } = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { username, password, email, role } = req.body; // ✅ FIXED
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = new User({ username, password, email, role }); // ✅ FIXED
    await user.save();
    
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};