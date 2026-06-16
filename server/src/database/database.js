const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // Важно для Render!
  }
});

// Создание таблиц при первом запуске
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Таблица пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Таблица сообщений чата
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        username VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database tables initialized');
    client.release();
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
};

// Регистрация пользователя
const registerUser = async (username, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('Username already exists');
    }
    throw error;
  }
};

// Проверка пользователя
const loginUser = async (username, password) => {
  try {
    const result = await pool.query(
      'SELECT id, username, password FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      throw new Error('Invalid password');
    }
    
    return { id: user.id, username: user.username };
  } catch (error) {
    throw error;
  }
};

// Сохранение сообщения чата
const saveChatMessage = async (userId, username, message) => {
  try {
    const result = await pool.query(
      'INSERT INTO chat_messages (user_id, username, message) VALUES ($1, $2, $3) RETURNING *',
      [userId, username, message]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

// Получение последних сообщений чата
const getRecentMessages = async (limit = 50) => {
  try {
    const result = await pool.query(
      'SELECT username, message, created_at FROM chat_messages ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows.reverse();
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
};

module.exports = {
  pool,
  initDatabase,
  registerUser,
  loginUser,
  saveChatMessage,
  getRecentMessages
};
