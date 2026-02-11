// < ------------ routes/students.js ------------ >
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

db.query("SELECT * FROM students", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
});


// < --------- GET /api/students  (list with optional search) --------- >
router.get('/', auth, async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (q) {
            const like = `%${q}%`;
            const [rows] = await pool.query(
                `SELECT fullname, studentNo, idNumber, email, course, enrollmentDate, status
        FROM students
        WHERE fullname LIKE ? OR studentNo LIKE ? OR email LIKE ?
        ORDER BY fullname ASC`,
                [like, like, like]
            );
            return res.json(rows);
        } else {
            const [rows] = await pool.query(
                `SELECT fullname, studentNo, idNumber, email, course, enrollmentDate, status
        FROM students
        ORDER BY fullname ASC`
            );
            return res.json(rows);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// < -------- GET /api/students/:studentNo -------------- >
router.get('/:studentNo', auth, async (req, res) => {
    try {
        const studentNo = req.params.studentNo;
        const [rows] = await pool.query('SELECT * FROM students WHERE studentNo = ? LIMIT 1', [studentNo]);
        if (!rows.length) return res.status(404).json({ error: 'Student not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// < -------- POST /api/students  (create) --------- >
router.post('/', auth, async (req, res) => {
    try {
        const {
            fullname, idNumber, studentNo, dateofBirth, email, password,
            course, courseSummary, enrollmentDate, registrationTimestamp, status
        } = req.body;

// < ----------- minimal validation (expand as needed) ----------- >
        if (!fullname || !idNumber || !studentNo || !email) {
            return res.status(400).json({ error: 'fullname, idNumber, studentNo and email are required' });
        }

// < ------------------- check duplicates ------------------- >
        const [dup] = await pool.query('SELECT * FROM students WHERE email = ? OR idNumber = ? OR studentNo = ? LIMIT 1', [email, idNumber, studentNo]);
        if (dup.length) return res.status(400).json({ error: 'Duplicate student (email, idNumber or studentNo)' });

        await pool.query(`INSERT INTO students 
        (fullname, idNumber, studentNo, dateofBirth, email, password, course, courseSummary, enrollmentDate, registrationTimestamp, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fullname, idNumber, studentNo, dateofBirth, email, password, course, courseSummary, enrollmentDate, registrationTimestamp, status]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// < --------- PUT /api/students/:studentNo  (update) ------------- >
router.put('/:studentNo', auth, async (req, res) => {
    try {
        const originalStudentNo = req.params.studentNo;
        const {
            fullname, idNumber, studentNo, dateofBirth, email, password,
            course, courseSummary, enrollmentDate, registrationTimestamp, status
        } = req.body;

// < -------------------------- check if student exists -------------------------- > 
        const [exists] = await pool.query('SELECT * FROM students WHERE studentNo = ? LIMIT 1', [originalStudentNo]);
        if (!exists.length) return res.status(404).json({ error: 'Student not found' });

// < ------------------------ check duplicates excluding current record ------------------------ >
        const [dup] = await pool.query(
            'SELECT * FROM students WHERE (email = ? OR idNumber = ? OR studentNo = ?) AND studentNo != ? LIMIT 1',
            [email, idNumber, studentNo, originalStudentNo]
        );
        if (dup.length) return res.status(400).json({ error: 'Duplicate email, idNumber or studentNo belongs to another student' });

        await pool.query(`UPDATE students SET
        fullname=?, idNumber=?, studentNo=?, dateofBirth=?, email=?, password=?, course=?, courseSummary=?, enrollmentDate=?, registrationTimestamp=?, status=?
        WHERE studentNo=?`,
            [fullname, idNumber, studentNo, dateofBirth, email, password, course, courseSummary, enrollmentDate, registrationTimestamp, status, originalStudentNo]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// < ---------- DELETE /api/students/:studentNo ------------ >
router.delete('/:studentNo', auth, async (req, res) => {
    try {
        const studentNo = req.params.studentNo;
        await pool.query('DELETE FROM students WHERE studentNo = ?', [studentNo]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
