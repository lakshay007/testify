const https = require('https');
const http = require('http');

class PingService {
    constructor(url) {
        this.url = url;
        this.interval = null;
    }

    start() {
        // Ping every 14 minutes (before the 15-minute timeout)
        this.interval = setInterval(() => {
            const protocol = this.url.startsWith('https') ? https : http;
            
            const req = protocol.get(this.url, (res) => {
                console.log(`Ping successful: ${res.statusCode}`);
            });

            req.on('error', (error) => {
                console.error('Ping failed:', error);
            });

            // End the request
            req.end();
        }, 14 * 60 * 1000); // 14 minutes
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

module.exports = PingService;
