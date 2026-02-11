/*
  Design Choice Note:
  This project uses functional components instead of class-based components.
  Functional components (with React Hooks) simplify state management, improve readability,
  and align with modern React standards. Class-based components were avoided to reduce
  boilerplate code and ensure cleaner, reusable UI logic.
*/

/* 
  Functional components are used instead of class-based ones.
  They provide cleaner syntax, easier state management with Hooks,
  and align with modern React best practices for simplicity and reusability.
*/


import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/style.css";

export default function AdminEditStudent() {
    const { studentNo } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [alert, setAlert] = useState("");
    const [error, setError] = useState("");

    // < ----------- Fetch student on load -------------- >
    useEffect(() => {
        fetchStudent();
      // eslint-disable-next-line
    }, [studentNo]);

    const fetchStudent = async () => {
        try {
            const res = await API.get(`/students/${studentNo}`);
            setStudent(res.data);
        } catch (err) {
            console.error("Failed to fetch student details:", err);
            setError("Failed to load student details.");
        }
    };

    // < ----------- Handle form changes and submission -------------- >
    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedStudent = { ...student, [name]: value };

        // < ------- Auto-fill Date of Birth from ID number (13 digits) ------- >
        if (name === "idNumber") {
            if (value.length === 13 && /^\d+$/.test(value)) {
                const yy = value.substring(0, 2);
                const mm = value.substring(2, 4);
                const dd = value.substring(4, 6);

                // < ------- Determine correct century-------------- >
                const currentYear = new Date().getFullYear() % 100;
                const fullYear = parseInt(yy, 10) > currentYear ? `19${yy}` : `20${yy}`;
                const derivedDate = `${fullYear}-${mm}-${dd}`;

                if (!isNaN(new Date(derivedDate).getTime())) {
                    updatedStudent.dateofBirth = derivedDate;
                }
            } else {
                // < --------- Clear DOB if ID number becomes invalid --------- >
                updatedStudent.dateofBirth = "";
            }
        }

        // < ------- Auto-fill Course Summary when Course changes ------- >
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
            updatedStudent.courseSummary = summaries[value] || "";
        }
        setStudent(updatedStudent);
    };

    // < ----------- Handle form submission -------------- >
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.put(`/students/${studentNo}`, student);
            if (res.data.success) {
                // < -------------- Store success message for view page -------------- >
                sessionStorage.setItem("successMsg", "Successfully! updated student details.");
                navigate(`/admin_view_student/${studentNo}`);
            } else {
                setError("Failed to update student details!!!!");
            }
        } catch (err) {
            console.error("Update error:", err);

            const errorData = err.response?.data || {};
            if (errorData?.error) {
                let errorMsg = errorData.error;
                if (errorMsg.toLowerCase().includes("email")) {
                    errorMsg = "Email already exists for another student.";
                } else if (errorMsg.toLowerCase().includes("id")) {
                    errorMsg = "ID Number already exists for another student.";
                } else if (errorMsg.toLowerCase().includes("student")) {
                    errorMsg = "Student Number already exists.";
                }
                setError(errorMsg);
            } else {
                setError("Failed to connect to server.");
            }
        }
    };

    // < ----------- Auto-hide alerts -------------- >
    useEffect(() => {
        if (alert || error) {
            const timer = setTimeout(() => {
                setAlert("");
                setError("");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [alert, error]);


    // < ----------- Render component -------------- >
    if (!student) {
        return (
            <div style={{ textAlign: "center", marginTop: "40px", color: "white" }}>
                <h2>Loading student details...</h2>
            </div>
        );
    }

    return (
        <div>
            {error && (
                <div className="alert-box show">
                    <div className="alert error">
                        <i className="bx bxs-error-circle"></i>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <header>
                <div href="" className="logo">SkyNet Tech Academix</div>

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

            <div className="edit-container">
                <h2>Edit Student: {student.fullname}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="box-2">
                            <label>Full Name:</label>
                            <input type="text" name="fullname" value={student.fullname} onChange={handleChange} required />
                        </div>

                        <div className="box-2">
                            <label>ID Number:</label>
                            <input type="text" name="idNumber" value={student.idNumber} onChange={handleChange}
                                maxLength={13} required />
                        </div>

                        <div className="box-2">
                            <label>Student Number:</label>
                            <input type="text" name="studentNo" value={student.studentNo} readOnly />
                        </div>

                        <div className="box-2">
                            <label>Date of Birth: {student.idNumber?.length === 13 && (
                                <small style={{ color: "#0f0" }}>  auto-filled from ID</small>
                            )}</label>
                            <input
                                type="date"
                                name="dateofBirth"
                                value={student.dateofBirth ? student.dateofBirth.split("T")[0] : ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="box-2">
                            <label>Email:</label>
                            <input type="email" name="email" value={student.email} onChange={handleChange} required />
                        </div>

                        <div className="box-2">
                            <label>Password:</label>
                            <input type="text" name="password" minLength={5} value={student.password} onChange={handleChange} required />
                        </div>

                        <div className="box-2">
                            <label>Course:</label>
                            <select name="course" value={student.course || ""} onChange={handleChange}>
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
                                value={student.enrollmentDate ? student.enrollmentDate.split("T")[0] : ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="box-2">
                            <label>Registration Timestamp:</label>
                            <input
                                type="datetime-local"
                                name="registrationTimestamp"
                                value={
                                    student.registrationTimestamp
                                        ? new Date(student.registrationTimestamp).toISOString().slice(0, 16)
                                        : ""
                                }
                                onChange={handleChange}
                            />
                        </div>

                        <div className="box-2">
                            <label>Status:</label>
                            <select name="status" value={student.status || "Pending"} onChange={handleChange}>
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
                                value={student.courseSummary || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <button type="submit" className="save-btn">
                                <span>Save Changes</span>
                            </button>
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <a href={`/admin_view_student/${student.studentNo}`}>
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
