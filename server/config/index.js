module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: '24h'
  },
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  },
  game: {
    maxPlayersPerRoom: 2,
    arenaSize: 20
  }
};
