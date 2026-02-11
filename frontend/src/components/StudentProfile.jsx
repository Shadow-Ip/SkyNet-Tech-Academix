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

export default function StudentProfile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  // < ------- Get logged-in student number ------- >
  const studentNo = localStorage.getItem("studentNo");
  const fullname = localStorage.getItem("fullname") || "Student";

  // < ------- Redirect if not logged in ------- >
  useEffect(() => {
    if (!studentNo) {
      navigate("/loginPage");
    } else {
      fetchStudent();
    }
    // eslint-disable-next-line
  }, [studentNo]);

  // < ------- Fetch Student Data ------- >
  const fetchStudent = async () => {
    try {
      const res = await API.get(`/students/${studentNo}`);
      setStudent(res.data);
    } catch (err) {
      console.error("Failed to fetch student data:", err);
      setError("Failed to load profile data.");
    }
  };

  // < ------- Logout ------- >
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/loginPage");
  };

  if (!student) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", color: "white" }}>
        <h2>{error || "Loading student profile..."}</h2>
      </div>
    );
  }

  return (
    <div>
      <header>
        <div className="logo">Welcome {fullname}</div>

        <a href="/student_dashboard">
          <div className="RegSlip">
            <button type="button" className="RegSlip-btn">
              <span>&lt;== Dashboard</span>
            </button>
          </div>
        </a>

        <a href="/student_profile_report">
          <div className="RegSlip">
            <button type="button" className="RegSlip-btn">
              <span>View / Download Reports 📑</span>
            </button>
          </div>
        </a>

        <div className="head-logout">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ---------- PROFILE INFO ---------- */}
      <div className="profile-container">
        <h1>{student.fullname}'s Profile</h1>

        <div className="profile-table">
          <table>
            <tbody>
              <tr>
                <td>Full Name</td>
                <td>{student.fullname}</td>
              </tr>
              <tr>
                <td>ID Number</td>
                <td>{student.idNumber}</td>
              </tr>
              <tr>
                <td>Student Number</td>
                <td>{student.studentNo}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{student.email}</td>
              </tr>
              <tr>
                <td>Password</td>
                <td>{student.password}</td>
              </tr>
              <tr>
                <td>Date of Birth</td>
                <td>
                  {student.dateofBirth
                    ? student.dateofBirth.split("T")[0]
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td>Course</td>
                <td>{student.course || "Not specified"}</td>
              </tr>
              <tr>
                <td>Course Summary</td>
                <td>{student.courseSummary || "Not specified"}</td>
              </tr>
              <tr>
                <td>Enrollment Date</td>
                <td>
                  {student.enrollmentDate
                    ? student.enrollmentDate.split("T")[0]
                    : "Not Enrolled"}
                </td>
              </tr>
              <tr>
                <td>Status</td>
                <td>{student.status || "Pending"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
