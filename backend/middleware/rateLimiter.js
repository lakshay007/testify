const rateLimit = new Map();

const forgotPasswordLimiter = (req, res, next) => {
    const email = req.body.email;
    const now = Date.now();
    
    if (rateLimit.has(email)) {
        const lastRequest = rateLimit.get(email);
        const timeElapsed = now - lastRequest;
        
        if (timeElapsed < 60000) { // 60 seconds
            return res.status(429).json({ 
                message: 'Please wait 60 seconds before requesting another reset link',
                timeRemaining: Math.ceil((60000 - timeElapsed) / 1000)
            });
        }
    }
    
    rateLimit.set(email, now);
    next();
};

module.exports = { forgotPasswordLimiter }; 