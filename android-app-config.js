/**
 * Ring & Wing Android App API Configuration
 * 
 * This file contains the configuration for connecting your Android app
 * to the Ring & Wing backend API deployed on Render.com
 */

// Android app configuration
const apiConfig = {
  // Replace with your actual Render.com deployment URL when deployed
  // For local development, use your local server URL (e.g., http://10.0.2.2:5000 to access localhost from Android emulator)
  BASE_URL: 'https://ring-wing-backend.onrender.com',
  
  // API endpoints
  endpoints: {
    // Auth endpoints
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      verifyToken: '/api/auth/verify'
    },
    
    // Staff endpoints
    staff: {
      list: '/api/staff',
      timeClock: '/api/staff/time-clock',
      details: (id) => `/api/staff/${id}`
    },
    
    // Time log endpoints
    timeLogs: {
      clockIn: '/api/time-logs/clock-in',
      clockOut: '/api/time-logs/clock-out',
      getForStaff: (staffId) => `/api/time-logs/staff/${staffId}`
    },
    
    // Menu endpoints
    menu: {
      list: '/api/menu',
      categories: '/api/categories'
    },
    
    // Order endpoints
    orders: {
      create: '/api/orders',
      list: '/api/orders',
      details: (id) => `/api/orders/${id}`,
      updateStatus: (id) => `/api/orders/${id}/status`
    },
    
    // Inventory endpoints
    inventory: {
      items: '/api/items',
      itemDetails: (id) => `/api/items/${id}`,
      restock: (id) => `/api/items/${id}/restock`
    },
    
    // Health check
    health: '/api/health'
  },
  
  // Request timeouts (in milliseconds)
  timeouts: {
    connect: 10000,
    read: 30000,
    write: 30000
  },
  
  // Image upload settings
  imageUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: ['image/jpeg', 'image/png']
  }
};

module.exports = apiConfig;