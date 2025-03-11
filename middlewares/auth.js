const jwt = require('jsonwebtoken');
const { promisify } = require('util');
require('dotenv').config();

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]; 
        }

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token has expired, please log in again' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
        } else {
            return res.status(401).json({ message: 'Unauthorized: Token verification failed' });
        }
    }
};
