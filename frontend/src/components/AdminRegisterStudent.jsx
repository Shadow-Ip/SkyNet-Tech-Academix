/* 
  Functional components are used instead of class-based ones.
  They provide cleaner syntax, easier state management with Hooks,
  and align with modern React best practices for simplicity and reusability.
*/


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/style.css";

export default function AdminRegisterStudent() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullname: "",
        idNumber: "",
        studentNo: "",
        dateofBirth: "",
        email: "",
        password: "",
        course: "",
        enrollmentDate: "",
        status: "",
        courseSummary: "",
        registrationTimestamp: "", // <- empty by default (admin may provide one)
    });

    const [alert, setAlert] = useState({ type: "", message: "" });

// Utility: format JS Date -> SQL DATETIME "YYYY-MM-DD HH:MM:SS"
    function formatSQLDatetime(d = new Date()) {
        const pad = (n) => String(n).padStart(2, "0");
        const Y = d.getFullYear();
        const M = pad(d.getMonth() + 1);
        const D = pad(d.getDate());
        const h = pad(d.getHours());
        const m = pad(d.getMinutes());
        const s = pad(d.getSeconds());
        return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    }

// < ----------- handle input -------------- >
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

// < ----- auto-fill course summary when course selected ---- >
        if (name === "course") {
            const summaries = {
                "System Development":
                "The process of designing, creating, testing, and implementing new software or customized systems to solve problems or meet user needs. It involves methodical phases, known as the System Development Life Cycle (SDLC), and can cover everything from internal custom software to integrating third-party applications. The goal is to produce high-quality, accurate systems that meet client requirements, often involving a collaborative team of specialists. ",
                "IT Security":
                "Focuses on the practice of protecting computer networks, systems, and data from unauthorized access, attacks, and damage. It involves using a combination of technologies, policies, and physical security measures to ensure the confidentiality, integrity, and availability of information assets. Key areas include network security, endpoint security, and application security, and its importance is growing due to the exponential increase in cyberattacks.",
                "Networking": 
                "This course covers the foundation of networking and network devices, media, and protocols. Explores network configuration, maintenance, and security in enterprise and cloud environments.",
                "AI & Data Science":
                "Introduces artificial intelligence, data analysis, and machine learning concepts for smart systems. This course is designed to equip individuals with the skills needed for careers such as data scientist, AI engineer, or data analyst, and often include hands-on projects, real-world case studies, and a strong theoretical foundation.",
                "Full-Stack Dev": 
                " You'll learn to build complete web applications using HTML, CSS, JavaScript, React, TypeScript, Node.js, Python, and more.",
                };
            setForm((prev) => ({ ...prev, courseSummary: summaries[value] || "" }));
        }

// < ------- extract DOB from ID number (first 6 digits) ------- >
        if (name === "idNumber") {
            if (value.length === 13 && /^\d+$/.test(value)) {
                const yy = value.substring(0, 2);
                const mm = value.substring(2, 4);
                const dd = value.substring(4, 6);

// < ------- Determine correct century -------- >
                const currentYear = new Date().getFullYear() % 100;
                const fullYear = parseInt(yy, 10) > currentYear ? `19${yy}` : `20${yy}`;
                const derivedDate = `${fullYear}-${mm}-${dd}`;

                if (!isNaN(new Date(derivedDate).getTime())) {
                    setForm((prev) => ({ ...prev, dateofBirth: derivedDate }));
                }
            } else {
// < -------- Clear DOB if ID number becomes invalid ------- >
                setForm((prev) => ({ ...prev, dateofBirth: "" }));
            }
        }
    };

// < ----------- form submit ------------- >
    const handleSubmit = async (e) => {
        e.preventDefault();

// < ----- If the admin didn't provide a registrationTimestamp -------- >
        const payload = { ...form };
        if (!payload.registrationTimestamp || payload.registrationTimestamp.trim() === "") {
            payload.registrationTimestamp = formatSQLDatetime();
        } else {
// < ------ If the admin provided a datetime-local input, convert it to SQL format ----- >
    // e.g. "2025-10-14T22:00" or "2025-10-14T22:00:00.000Z"
            const provided = payload.registrationTimestamp;
            const parsed = new Date(provided);
            if (!isNaN(parsed.getTime())) {
                payload.registrationTimestamp = formatSQLDatetime(parsed);
            } // else "Blank" (backend will validate it)
        }

        try {
            const res = await API.post("/students", payload);

            if (res.data?.success) {
                setAlert({ type: "success", message: "Successfully registered new student!" });
                setTimeout(() => {
                    navigate("/admin_dashboard", {
                        state: { successMessage: "Successfully registered new student!" },
                    });
                }, 1500);
            } else {
                setAlert({
                    type: "error",
                    message: res.data?.error || "Registration failed. Please try again.",
                });
                setTimeout(() => setAlert({ type: "", message: "" }), 4000);
            }
        } catch (err) {
            console.error("Registration error:", err);

 // < --------- Handle backend duplicate messages correctly ---------- >
            const backendMessage = err.response?.data?.error;
            setAlert({
                type: "error",
                message: backendMessage || "Failed to connect to server.",
            });

            setTimeout(() => setAlert({ type: "", message: "" }), 4000);
        }

    };

    return (
        <div>
            <header>
                <div className="logo">SkyNet Tech Academix</div>
                <a href="/admin_dashboard">
                    <div className="RegSlip">
                        <button type="button" className="RegSlip-btn">
                            <span>&lt;== Dashboard</span>
                        </button>
                    </div>
                </a>
                <a href="/">
                    <div className="head-logout">
                        <button type="button" className="logout-btn">
                            <span>Logout</span>
                        </button>
                    </div>
                </a>
            </header>

            {alert.message && (
                <div className="alert-box show">
                    <div className={`alert ${alert.type}`}>
                        <i className={`bx ${alert.type === "success" ? "bxs-check-circle" : "bxs-error-circle"}`}></i>
                        <span>{alert.message}</span>
                    </div>
                </div>
            )}

            <div className="register-container">
                <h2>Register New Student</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="box-2">
                            <label>Full Name:</label>
                            <input
                                name="fullname"
                                value={form.fullname}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div className="box-2">
                            <label>ID Number:</label>
                            <input
                                name="idNumber"
                                value={form.idNumber}
                                onChange={handleChange}
                                maxLength="13"
                                pattern="\d{13}"
                                placeholder="e.g. 9901015800084"
                                required
                            />
                        </div>

                        <div className="box-2">
                            <label>Student Number:</label>
                            <input
                                name="studentNo"
                                value={form.studentNo}
                                onChange={handleChange}
                                placeholder="e.g. 13ha2304374"
                                required
                            />
                        </div>

                        <div className="box-2">
                            <label>Date of Birth: {form.idNumber?.length === 13 && (
                                <small style={{ color: "#0f0" }}> auto-filled from ID</small>
                            )}</label>
                            <input
                                type="date"
                                name="dateofBirth"
                                value={form.dateofBirth}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="box-2">
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="e.g. student@gmail.com"
                                required
                            />
                        </div>

                        <div className="box-2">
                            <label>Password:</label>
                            <input
                                name="password"
                                minLength={5}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        <div className="box-2">
                            <label>Course:</label>
                            <select
                                name="course"
                                value={form.course}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Select Course</option>
                                <option value="System Development">System Development</option>
                                <option value="IT Security">IT Security</option>
                                <option value="Networking">Networking</option>
                                <option value="AI & Data Science">AI & Data Science</option>
                                <option value="Full-Stack Dev">Full-Stack Dev</option>
                            </select>
                        </div>

                        <div className="box-2">
                            <label>Enrollment Date:</label>
                            <input
                                type="date"
                                name="enrollmentDate"
                                value={form.enrollmentDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="box-2">
                            <label>Registration Timestamp:</label>
                            <input
                                type="datetime-local"
                                name="registrationTimestamp"
                                value={form.registrationTimestamp}
                                onChange={(e) => setForm((p) => ({ ...p, registrationTimestamp: e.target.value }))}
                                placeholder="Leave blank to auto-fill current time"
                            />
                        </div>

                        <div className="box-2">
                            <label>Status:</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Awaiting Approval">Awaiting Approval</option>
                                <option value="Active">Active</option>
                                <option value="On-hold">On-hold</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Graduated">Graduated</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: "1 / span 2", margin: "15px 0" }}>
                            <label>Course Summary:</label>
                            <textarea
                                name="courseSummary"
                                rows="3"
                                value={form.courseSummary}
                                onChange={handleChange}
                                placeholder="Auto-filled summary based on course selected"
                            ></textarea>
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <button type="submit" className="save-btn"><span>Register Student</span></button>
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <a href="/admin_dashboard">
                                <button type="button" className="back-btn">
                                    <span>Cancel</span>
                                </button>
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
