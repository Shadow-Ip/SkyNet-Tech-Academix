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
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/style.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const fullname = localStorage.getItem("fullname") || "Student";
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await API.get(`/students`);
        const data = res.data.find((s) => s.email === email);
        if (data) setStudent(data);
      } catch (err) {
        console.error("Error fetching student:", err);
        setAlert({ type: "error", message: "Failed to load student data." });
        setTimeout(() => setAlert({ type: "", message: "" }), 4000);
      }
    };
    fetchStudent();
  }, [email]);

  const handleLogout = async () => {
    await API.post("/logout");
    localStorage.clear();
    navigate("/");
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    const date = new Date(ts);
    return isNaN(date) ? ts : date.toISOString().replace("T", " ").slice(0, 19);
  };

  return (
    <div>
      <header>
        <div className="logo">SkyNet Tech Academix</div>
        <div className="RegSlip">
          <button
            type="button"
            className="RegSlip-btn"
            onClick={() => navigate("/student_profile")}
          >
            <span>Profile</span>
          </button>
        </div>
        <div className="ProSummary">
          <button
            type="button"
            className="ProSummary-btn"
            onClick={() => navigate("/student_profile_report")}
          >
            <span>Reports</span>
          </button>
        </div>
        <div className="head-logout">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {alert.message && (
        <div className="alert-box show">
          <div className={`alert ${alert.type}`}>
            <i
              className={`bx ${
                alert.type === "success"
                  ? "bxs-check-circle"
                  : "bxs-error-circle"
              }`}
            ></i>
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      <div className="dashboard-container">
        <h2>Welcome: {fullname}</h2>

        {student ? (
          <>
            <div className="dashboard-cards">
              <div className="card total">
                <p>Course</p>
                <h3>{student.course || "N/A"}</h3>
              </div>

              <div
                className={`card ${
                  student.status?.toLowerCase().replace(" ", "") || ""
                }`}
              >
                <p>Status</p>
                <h3>{student.status || "N/A"}</h3>
              </div>

              <div className="card awaiting">
                <p>Enrollment Date</p>
                <h3>{formatDate(student.enrollmentDate)}</h3>
              </div>

              <div className="card graduated">
                <p>Registered On</p>
                <h2>{formatTimestamp(student.registrationTimestamp)}</h2>
              </div>
            </div>

            <div className="report-card" style={{ color: "black" }}>
              <h3>Course Overview</h3>
              <p>{student.courseSummary || "No course summary available."}</p>
            </div>
          </>
        ) : (
          <p>Loading student data...</p>
        )}
      </div>
    </div>
  );
}
