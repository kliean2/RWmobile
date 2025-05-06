const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const http = require('http');
const axios = require('axios');
const cron = require('node-cron');
const Expense = require('./models/expense');
const cookieParser = require('cookie-parser');
const { logger, criticalErrors } = require('./config/logger');
const { startMonitoring, checkMemory, releaseMemory } = require('./utils/memoryMonitor');

// Optimize memory usage by setting a reasonable heap size limit
// This will reduce memory fragmentation and improve GC efficiency
if (global.gc) {
  logger.info('Garbage collection is enabled - memory optimization active');
} else {
  logger.warn('Garbage collection is not enabled - start server with --expose-gc flag for better memory management');
}

dotenv.config();

// Validate environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'OPENROUTER_API_KEY'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`${varName} environment variable is required`);
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'data:', 'blob:', 'http://localhost:5000']
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(compression());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', apiLimiter);

// Create necessary directories
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');

[publicDir, uploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
});

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://ring-wing-frontend.onrender.com',
      // Include Render.com deployed frontend URL
      process.env.FRONTEND_URL,
      undefined // Allow requests with no origin (like mobile apps or curl requests)
    ].filter(Boolean); // Filter out undefined values
    
    // For Android app development and production
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || 
        origin.includes('.ngrok.io') || origin.includes('.vercel.app') || 
        origin.includes('.onrender.com')) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Make sure OPTIONS requests are handled properly
app.options('*', cors());

// Enable CORS debugging for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    logger.debug(`[CORS Debug] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
    next();
  });
}

// Request logging
app.use((req, res, next) => {
  logger.debug(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// HTTP logging
app.use(morgan('combined'));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };

    if (mimeTypes[ext]) {
      res.set('Content-Type', mimeTypes[ext]);
      res.set('Cache-Control', 'public, max-age=31536000, must-revalidate');
    }

    res.setHeader('Access-Control-Allow-Origin', 
      process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:5173'
    );
  }
}));

// Route debug middleware - update to show more details
app.use((req, res, next) => {
  logger.debug(`[Route Debug] ${req.method} ${req.originalUrl}`);
  next();
});

// Database connection check middleware
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    logger.error('Database connection lost - middleware check');
    return res.status(500).json({
      success: false,
      message: 'Database connection not established'
    });
  }
  next();
});

// Route imports
const timeLogRoutes = require('./routes/timeLogRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const staffRoutes = require('./routes/staffRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const healthRoutes = require('./routes/healthRoutes');

// API Routes
logger.info('[Setup] Registering time-log routes...');
app.use('/api/time-logs', timeLogRoutes);
logger.info('[Setup] Time-log routes registered');

app.use('/api/payroll', payrollRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/add-ons', require('./routes/addOnsRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/revenue', revenueRoutes);

// Health routes for server monitoring
app.use('/api/health', healthRoutes);

// Chat proxy route
app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ring-wing-cafe.com',
          'X-Title': 'Ring & Wing Café Assistant'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    logger.error('Chat proxy error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Chat service temporarily unavailable' 
    });
  }
});

// Route check endpoint
app.get('/api/route-check', (req, res) => {
  const routes = [
    '/api/time-logs/clock-in',
    '/api/time-logs/clock-out'
  ];
  res.json({ registeredRoutes: routes });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'production' ? '🔒' : err.stack
  });

  if (err instanceof multer.MulterError) {
    return res.status(413).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Scheduled tasks
cron.schedule('0 0 * * *', async () => {
  try {
    const result = await Expense.updateMany(
      { disbursed: true },
      { $set: { disbursed: false } }
    );
    logger.info(`Daily expense reset completed. Reset ${result.modifiedCount} expenses.`);
  } catch (error) {
    logger.error('Daily expense reset failed:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Manila"
});

// Schedule memory checks and controlled restarts if memory usage is high
// This helps prevent unexpected shutdowns due to memory issues
let serverRuntime = Date.now();
cron.schedule('*/30 * * * *', async () => {
  try {
    // Check if server has been running for at least 6 hours (reduce for testing)
    const uptime = (Date.now() - serverRuntime) / (1000 * 60 * 60); // hours
    logger.info(`Server uptime: ${Math.round(uptime * 10) / 10} hours`);
    
    // Check current memory usage
    const memoryStats = checkMemory();
    
    // If memory usage is above 80% and server has been running for a while,
    // initiate a controlled restart
    if (memoryStats.percentUsed > 80 && uptime > 6) {
      logger.warn(`Scheduled memory check: High memory usage (${memoryStats.percentUsed}%) detected after ${Math.round(uptime)} hours uptime. Initiating controlled restart.`);
      
      // Add a 30-second delay to let current requests complete
      setTimeout(() => {
        logger.info('Performing controlled server restart due to high memory usage');
        process.exit(0); // Clean exit for process manager to restart
      }, 30000);
    }
  } catch (error) {
    logger.error('Error in scheduled memory check:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Manila"
});

// Server setup
const server = http.createServer(app);

// Connection handling configuration
server.keepAliveTimeout = 65 * 1000; // 65 seconds
server.headersTimeout = 66 * 1000; // Slightly longer than keepAliveTimeout
server.maxConnections = 100; // Adjust based on your server capacity
server.timeout = 120000; // Request timeout: 2 minutes

// Track active connections for proper shutdown
let connections = [];
server.on('connection', connection => {
  connections.push(connection);
  connection.on('close', () => {
    connections = connections.filter(curr => curr !== connection);
  });
});

// Implement graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully.`);
  
  // Set a longer overall shutdown timeout
  const forcedShutdownTimeout = setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 60000); // Increased from 30s to 60s to give more time for connections to close
  
  // First, terminate any scheduled tasks
  logger.info('Stopping scheduled tasks...');
  try {
    // Get all scheduled tasks and stop them
    const scheduledTasks = cron.getTasks();
    for (const [key, task] of Object.entries(scheduledTasks)) {
      task.stop();
    }
    logger.info('All scheduled tasks stopped');
  } catch (err) {
    logger.error('Error stopping scheduled tasks:', err);
  }
  
  // Then stop memory monitoring
  if (typeof stopMemoryMonitoring === 'function') {
    logger.info('Stopping memory monitoring...');
    stopMemoryMonitoring();
  }

  // Next, stop accepting new connections
  logger.info('Closing HTTP server...');
  server.close(async () => {
    logger.info('HTTP server closed.');
    
    try {
      // Forcefully end any remaining connections
      if (connections.length > 0) {
        logger.info(`Destroying ${connections.length} remaining connections...`);
        connections.forEach(connection => connection.destroy());
        logger.info('All connections destroyed.');
      }
      
      // Close MongoDB connection with a timeout
      logger.info('Closing database connection...');
      const dbClosePromise = new Promise((resolve, reject) => {
        mongoose.connection.close(false, (err) => {
          if (err) {
            logger.error('Error closing MongoDB connection:', err);
            reject(err);
          } else {
            logger.info('MongoDB connection closed successfully.');
            resolve();
          }
        });
        
        // Add a safety timeout for DB connection close
        setTimeout(() => {
          logger.warn('MongoDB close operation timed out, proceeding with shutdown.');
          resolve();
        }, 10000);
      });
      
      await dbClosePromise;
      
      // Clear the forced shutdown timeout as we're exiting cleanly
      clearTimeout(forcedShutdownTimeout);
      
      logger.info('All connections closed, exiting cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during clean shutdown:', err);
      process.exit(1);
    }
  });
  
  // Handle server.close timeout case
  setTimeout(() => {
    if (connections.length > 0) {
      logger.info(`Server close timed out. Forcefully destroying ${connections.length} connections...`);
      connections.forEach(connection => connection.destroy());
    }
  }, 15000);
};

// Listen for shutdown signals
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, () => gracefulShutdown(signal));
});

// Start memory monitoring
const stopMemoryMonitoring = startMonitoring();

// Add an "uncaughtException" handler with restart capability
process.on('uncaughtException', (err) => {
  logger.error(`[CRITICAL] Uncaught Exception: ${err.message}`);
  logger.error(err.stack);

  // Only attempt restart in production mode
  if (process.env.NODE_ENV === 'production' && process.env.AUTO_RESTART === 'true') {
    logger.info('Attempting to restart server after uncaught exception...');
    
    // Clean up resources
    stopMemoryMonitoring();
    
    // Give time to log the error before restart
    setTimeout(() => {
      logger.info('Restarting server...');
      process.exit(1); // Exit with error code to let process manager restart
    }, 1000);
  }
  // Note: In non-production mode, we keep the server running
});

// Memory optimization middleware - periodically check memory usage on heavy routes
const memoryOptimizedRoutes = [
  '/api/menu',
  '/api/orders',
  '/api/chat',
  '/api/revenue'
];

app.use((req, res, next) => {
  const isHeavyRoute = memoryOptimizedRoutes.some(route => req.path.startsWith(route));
  
  if (isHeavyRoute) {
    // Check memory on 5% of requests to these routes
    if (Math.random() < 0.05) {
      const memoryStats = checkMemory();
      
      // If memory usage is high, try to release some
      if (memoryStats.percentUsed > 75) {
        logger.debug(`High memory detected during ${req.path} request (${memoryStats.percentUsed}%) - releasing memory`);
        releaseMemory();
      }
    }
  }
  next();
});

// Optimize Mongoose for better memory management
mongoose.set('bufferCommands', false); // Don't buffer commands when disconnected
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production'); // Disable autoIndex in prod

// Optimize connections for better memory management
let connectionCount = 0;
server.on('connection', connection => {
  connections.push(connection);
  connectionCount++;
  
  // Every 100 connections, check memory usage
  if (connectionCount % 100 === 0) {
    const memoryStats = checkMemory();
    logger.info(`${connectionCount} connections received. Current memory usage: ${memoryStats.percentUsed}%`);
    
    // If high memory, release some
    if (memoryStats.percentUsed > 80) {
      releaseMemory();
    }
  }
  
  connection.on('close', () => {
    connections = connections.filter(curr => curr !== connection);
  });
});

// Schedule more frequent memory checks for high load periods
// This helps catch memory issues before they become critical
cron.schedule('*/10 * * * *', async () => {
  // Check memory more frequently during business hours (9am-9pm)
  const hour = new Date().getHours();
  const isDuringBusinessHours = hour >= 9 && hour <= 21;
  
  if (isDuringBusinessHours) {
    const memoryStats = checkMemory();
    
    // If memory usage is above 75% during business hours, be proactive
    if (memoryStats.percentUsed > 75) {
      logger.info(`Business hours memory check: ${memoryStats.percentUsed}% memory usage detected`);
      releaseMemory();
    }
  }
}, {
  scheduled: true,
  timezone: "Asia/Manila"
});

server.listen(PORT, () => {
  logger.info(`
  Server running in ${process.env.NODE_ENV || 'development'} mode
  Listening on port ${PORT}
  Database: ${process.env.MONGO_URI}
  Keep-alive timeout: ${server.keepAliveTimeout}ms
  `);
});

module.exports = server;