const express = require('express');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser } = require('../database/database');
const config = require('../config');

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    if (username.length < 3 || password.length < 6) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters, password at least 6' 
      });
    }
    
    const user = await registerUser(username, password);
    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const user = await loginUser(username, password);
    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;
