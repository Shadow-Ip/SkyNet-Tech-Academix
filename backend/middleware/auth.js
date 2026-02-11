// <---------- middleware/auth.js ---------->
const jwt = require('jsonwebtoken');
require('dotenv').config();

// < ----------- Middleware to authenticate admin users -------------->
module.exports = function (req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    jwt.verify(token, process.env.JWT_SECRET || 'devsecret', (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.admin = { id: decoded.id, fullname: decoded.fullname, email: decoded.email };
        next();
    });
};
