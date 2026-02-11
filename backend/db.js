// < ---------- backend/db.js ------------ >
import mysql from "mysql2";

export const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Masilo#25",  // Please change the password as per your MySQL setup
    database: "student_db",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Successfully Connected to MySQL (student_db)");
    }
});
