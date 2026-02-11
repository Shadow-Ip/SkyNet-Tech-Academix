// < --------- routes/auth.js ------------ >
const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// < --------- POST /api/auth/login ------------ >
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

// < ----------- Input validation ------------ >
    try {
        const [rows] = await db.execute(
            "SELECT * FROM admins WHERE email = ? AND password = ? LIMIT 1",
            [email, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const admin = rows[0];
        const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET || "secret", {
            expiresIn: "1h",
        });

        res.json({ token, admin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


// < --------- POST /api/auth/register  — Register admin ------------ >
router.post('/register', async (req, res) => {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) return res.status(400).json({ error: 'All fields required' });

    try {
        const [exists] = await pool.query('SELECT id FROM admins WHERE email = ? LIMIT 1', [email]);
        if (exists.length) return res.status(400).json({ error: 'Admin with that email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO admins (fullname, email, password) VALUES (?, ?, ?)', [fullname, email, hashed]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
