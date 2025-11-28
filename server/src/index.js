const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5174;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['*'];

const corsOptions = allowedOrigins.includes('*')
  ? { origin: true }
  : {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
      }
    };

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cors(corsOptions));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/contact-requests', async (req, res, next) => {
  try {
    const contactRequests = await prisma.contactRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(contactRequests);
  } catch (error) {
    next(error);
  }
});

app.post('/api/contact-requests', async (req, res, next) => {
  try {
    const { email, message, source } = req.body;

    if (!email || !message) {
      return res.status(400).json({ message: 'email and message are required' });
    }

    const entry = await prisma.contactRequest.create({
      data: {
        email,
        message,
        source
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = crypto.randomBytes(24).toString('hex');

    res.json({
      token,
      user: {
        username: user.username,
        hasFullAccess: user.hasFullAccess
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || 'Internal server error'
  });
});

const server = app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
