import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import session from "express-session";
import bodyParser from "body-parser";

const app = express();

// < ------------- Middleware ----------------- >
app.use(cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// < ----------- Session setup ---------------- >
app.use(session({
    secret: "skynet-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 },
}));

// < ------ Connect to my local MySQL DB -------- > 
const db = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Masilo#25",  // Please change the password as per your MySQL setup
    database: "student_db",
    dateStrings: true,
});

// < ----------- Confirm connection --------------- >
console.log("Successfully Connected to MySQL (student_db)");


// < =================== ROUTES ================== >

// < ------------- LOGIN ROUTE ---------------- >
app.post("/api/login", async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: "Email, password, and role are required." });
    }

    try {
        const query =
            role === "admin"
                ? "SELECT * FROM admins WHERE email = ? AND password = ? LIMIT 1"
                : "SELECT * FROM students WHERE email = ? AND password = ? LIMIT 1";

        const [rows] = await db.query(query, [email, password]);

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid login Details" });
        }

        const user = rows[0];
        req.session.user = user;
        req.session.role = role;

        res.json({
            message: "Loging in. please wait...",
            role,
            fullname: user.fullname,
            email: user.email,
            studentNo: user.studentNo || null
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// < ----------- REGISTER ADMIN ROUTE -------------- >
app.post("/api/register_admin", async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
 // < ----------- Check if the email already exists -------------- >
        const [existing] = await db.query(
            "SELECT email FROM admins WHERE email = ? LIMIT 1",
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: "Email already registered." });
        }

// < ----------- Register new admin --------------- >
        await db.query(
            "INSERT INTO admins (fullname, email, password) VALUES (?, ?, ?)",
            [fullname, email, password]
        );

        res.json({ message: "Successfully Registered, Please log-in." });
    } catch (err) {
        console.error("Register admin error:", err);
        res.status(500).json({ error: "Server error while registering admin." });
    }
});



// < ----------- Fetch all students -------------- >
app.get("/api/students", async (req, res) => {
    try {
        const [students] = await db.execute("SELECT * FROM students");
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// < ----------- Get single student by studentNo -------------- >
app.get("/api/students/:studentNo", async (req, res) => {
    const { studentNo } = req.params;
    try {
        const [rows] = await db.query("SELECT * FROM students WHERE studentNo = ? LIMIT 1", [studentNo]);
        if (rows.length === 0) return res.status(404).json({ error: "Student not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("Fetch student error:", err);
        res.status(500).json({ error: err.message });
    }
});

// < ----------- Delete a student -------------- >
app.delete("/api/students/:studentNo", async (req, res) => {
    const { studentNo } = req.params;
    try {
        const [result] = await db.execute("DELETE FROM students WHERE studentNo = ?", [studentNo]);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Successfully deleted student" });
        } else {
            res.status(404).json({ success: false, message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// < ----------- UPDATE STUDENT (PUT) -------------- >
app.put("/api/students/:studentNo", async (req, res) => {
    const { studentNo } = req.params;
    const {
        fullname,
        idNumber,
        dateofBirth,
        email,
        password,
        course,
        courseSummary,
        enrollmentDate,
        registrationTimestamp,
        status,
    } = req.body;

    try {
    // Ensure registrationTimestamp defaults to current time if empty
        const regTime = registrationTimestamp && registrationTimestamp !== ""
            ? registrationTimestamp
            : new Date().toISOString().slice(0, 19).replace("T", " ");
        // < ---- Prevent duplicate email, idNumber, studentNo for others ---- >
        const [dupes] = await db.query(
            "SELECT email, idNumber, studentNo FROM students WHERE (email = ? OR idNumber = ?) AND studentNo != ?",
            [email, idNumber, studentNo]
        );

        if (dupes.length > 0) {
            const duplicate = dupes[0];
            let errorMsg = "";

            if (duplicate.email === email) errorMsg = "Email already exists for another student.";
            else if (duplicate.idNumber === idNumber) errorMsg = "ID Number already exists for another student.";

            return res.status(400).json({ success: false, error: errorMsg });
        }

        const [result] = await db.execute(
            `UPDATE students 
            SET fullname=?, idNumber=?, dateofBirth=?, email=?, password=?, 
                course=?, courseSummary=?, enrollmentDate=?, registrationTimestamp=?, status=? 
            WHERE studentNo=?`,
            [
                fullname,
                idNumber,
                dateofBirth || null,
                email,
                password,
                course,
                courseSummary,
                enrollmentDate || null,
                regTime,
                status,
                studentNo,
            ]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Successfully updated student details" });
        } else {
            res.status(404).json({ success: false, message: "Student not found" });
        }
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ success: false, message: "Server error updating student" });
    }
});

// < ----------- REGISTER NEW STUDENT (POST) -------------- >
app.post("/api/students", async (req, res) => {
    try {
        const { fullname, idNumber, studentNo, email } = req.body;

    // < ----------- check if duplicate exists --------------- >
        const [rows] = await db.query(
            "SELECT email, idNumber, studentNo FROM students WHERE email = ? OR idNumber = ? OR studentNo = ?",
            [email, idNumber, studentNo]
        );

        if (rows.length > 0) {
            const duplicate = rows[0];
            let errorMsg = "";

            if (duplicate.email === email) {
                errorMsg = "Email already exists for another student.";
            } else if (duplicate.idNumber === idNumber) {
                errorMsg = "ID Number already exists for another student.";
            } else if (duplicate.studentNo === studentNo) {
                errorMsg = "Student Number already exists.";
            }

            return res.status(400).json({ success: false, error: errorMsg });
        }

    // < ---------- if no duplicates, insert student ---------------- >
        await db.query("INSERT INTO students SET ?", [req.body]);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ success: false, error: "Server error occurred." });
    }
});



// < ----------- Logout --------------- >
app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// ================== Server ==================

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`The server is running on http://localhost:${PORT}`);
});
