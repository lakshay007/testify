const express = require('express');
const PingService = require('./services/pingService');

// ... other imports and middleware ...

// Initialize ping service
const pingService = new PingService(process.env.BACKEND_URL + '/api/auth/health');
pingService.start();

// ... rest of your server code ...

// Handle graceful shutdown
process.on('SIGTERM', () => {
    pingService.stop();
    // ... other cleanup code ...
});

process.on('SIGINT', () => {
    pingService.stop();
    // ... other cleanup code ...
});
