require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./src/routes/auth');
const socketHandler = require('./src/socket');
const { initDatabase } = require('./src/database/database');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use('/api/auth', authRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

socketHandler(io);

const PORT = process.env.PORT || 3000;


const startServer = async () => {
  let retries = 5;

  while (retries > 0) {
    try {
      await initDatabase();
      console.log(' Database initialized');
      break;
    } catch (error) {
      retries--;
      console.error(` DB init failed, retries left: ${retries} — ${error.message}`);
      if (retries === 0) {
        console.error(' Could not connect to DB after 5 attempts, exiting');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 3000));
    }
  }

  server.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();
