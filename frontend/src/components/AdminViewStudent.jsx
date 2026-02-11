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

export default function AdminViewStudent() {
    const { studentNo } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState(""); //  success | error

    // < ------ Fetch single student ------- >
    useEffect(() => {
        fetchStudent();
      // eslint-disable-next-line
    }, [studentNo]);

    const fetchStudent = async () => {
        try {
            const res = await API.get("/students");
            const found = res.data.find((s) => s.studentNo === studentNo);
            if (found) setStudent(found);
            else {
                setAlertMsg("Student not found.");
                setAlertType("error");
            }
        } catch (err) {
            console.error("Failed to load student data:", err);
            setAlertMsg("Failed to fetch student data.");
            setAlertType("error");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${student.fullname}?`)) return;

        try {
            const res = await API.delete(`/students/${student.studentNo}`);
            if (res.data.success) {
                sessionStorage.setItem("successMsg", "Student deleted successfully!");
                navigate("/admin_dashboard");
            } else {
                setAlertMsg("Failed to delete student.");
                setAlertType("error");
            }
        } catch (err) {
            console.error("Delete error:", err);
            setAlertMsg("Error deleting student's data.");
            setAlertType("error");
        }
    };

    // < --------- Show alert message stored in sessionStorage (if available) ---------- >
    useEffect(() => {
        const msg = sessionStorage.getItem("successMsg");
        if (msg) {
            setAlertMsg(msg);
            setAlertType("success");
            sessionStorage.removeItem("successMsg");
        }
    }, []);

    // < --------- Auto-hide alerts after 5s ---------- >
    useEffect(() => {
        if (alertMsg) {
            const timer = setTimeout(() => {
                setAlertMsg("");
                setAlertType("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alertMsg]);

    if (!student) {
        return (
            <div>
                <h2 style={{ color: "white", textAlign: "center" }}>
                    Loading student details...
                </h2>
            </div>
        );
    }

    return (
        <div>
            {/* ALERT */}
            {alertMsg && (
                <div className="alert-box show">
                    <div className={`alert ${alertType}`}>
                        <i
                            className={`bx ${alertType === "success"
                                    ? "bxs-check-circle"
                                    : "bxs-error-circle"
                                }`}
                        ></i>
                        <span>{alertMsg}</span>
                    </div>
                </div>
            )}

            
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

        
            <div className="profile-container">
                <h1>{student.fullname}'s Profile</h1>

                <div className="report-table">
                    <table>
                        <tbody>
                            <tr><td>Full Name</td><td>{student.fullname}</td></tr>
                            <tr><td>ID Number</td><td>{student.idNumber}</td></tr>
                            <tr><td>Student Number</td><td>{student.studentNo}</td></tr>
                            <tr><td>Email</td><td>{student.email}</td></tr>
                            <tr><td>Password</td><td>{student.password}</td></tr>
                            <tr><td>Date of Birth</td><td>{student.dateofBirth?.split("T")[0] || "N/A"}</td></tr>
                            <tr><td>Course</td><td>{student.course || "Not specified"}</td></tr>
                            <tr><td>Course Summary</td><td>{student.courseSummary || "Not specified"}</td></tr>
                            <tr><td>Enrollment Date</td><td>{student.enrollmentDate?.split("T")[0] || "Not Enrolled"}</td></tr>
                            <tr><td>Status</td><td>{student.status || "Pending"}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="grid-btns">
                    <a href={`/admin_edit_student/${student.studentNo}`}>
                        <button className="edit-btn">
                            <span>Edit Student</span>
                        </button>
                    </a>

                    <button className="delete-btn" onClick={handleDelete}>
                        <span>Delete Student</span>
                    </button>

                    <a href="/admin_dashboard">
                        <button className="back-btn">
                            <span>Back</span>
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
}
