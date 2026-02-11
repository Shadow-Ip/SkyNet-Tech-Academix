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
import { useLocation } from "react-router-dom";
import API from "../api";
import "../styles/style.css";


export default function Dashboard() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("");
    const [counts, setCounts] = useState({});
    const [searchFocused, setSearchFocused] = useState(false);
    const fullname = localStorage.getItem("fullname") || "Administrator";
    const location = useLocation();
    const [alert, setAlert] = useState(location.state?.successMessage || "");


// Map DB status -> CSS class used in my stylesheet
    const statusCssMap = {
        "": "total",
        "Pending": "pending",
        "Awaiting Approval": "awaiting",
        "Active": "active",
        "On-hold": "onhold",
        "On hold": "onhold",         
        "On Hold": "onhold",
        "Suspended": "suspended",
        "Graduated": "graduated",
    };

    useEffect(() => {
    fetchStudents();
      // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => setAlert(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    useEffect(() => {
        if (location.state?.successMessage) {
            window.history.replaceState({}, document.title);
        }
    }, [location]);

// < --------- Auto-hide delete message ( success ) --------- >
    useEffect(() => {
        const msg = sessionStorage.getItem("successMsg");
        if (msg) {
            const timer = setTimeout(() => {
                sessionStorage.removeItem("successMsg");
                const alertBox = document.querySelector(".alert-box");
                if (alertBox) alertBox.classList.add("fade-out");
                window.location.reload();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, []);

// < --------- Fetch students from backend --------- > 
    const fetchStudents = async () => {
        try {
            const res = await API.get("/students");
            setStudents(res.data);
            updateCounts(res.data);
        } catch (err) {
            console.error("Failed to fetch students:", err);
        }
    };

// < --------- Update counts for dashboard cards based on status --------- >
    const updateCounts = (list) => {
        const count = {};
        list.forEach((s) => {
            const st = s.status || "Pending";
            count[st] = (count[st] || 0) + 1;
        });
        setCounts(count);
    };

// < --------- Handle logout action --------- >
    const handleLogout = async () => {
        try {
            await API.post("/logout");
        } catch (e) {
            console.warn("Logout request failed:", e);
        }
        localStorage.clear();
        window.location.href = "/";
    };

// < -------- Dashboard status cards --------- >
    const statuses = [
        { label: "Total Students", key: "" },
        { label: "Pending", key: "Pending" },
        { label: "Awaiting Approval", key: "Awaiting Approval" },
        { label: "Active", key: "Active" },
        { label: "On Hold", key: "On-hold" },
        { label: "Suspended", key: "Suspended" },
        { label: "Graduated", key: "Graduated" },
    ];

// < --------- Filter and search students --------- >
    const filteredStudents = students.filter((s) => {
        const st = s.status || "Pending";
        const matchesFilter = filter === "" || st === filter;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            s.fullname?.toLowerCase().includes(q) ||
            s.studentNo?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

// < ---------Focus style to matches my other inputs ----------- > 
    const searchFocusStyle = searchFocused
        ? { boxShadow: "0 0 10px rgba(1,121,41,0.7)", border: "2px solid rgb(5,248,45)" }
        : {};

    return (
        <div>
            <header>
                <div className="logo">
                    SkyNet Tech Academix
                </div>

                <a href="/admin_register_student">
                    <div className="RegSlip">
                        <button type="button" className="RegSlip-btn">
                            <span> + Register Student </span>
                        </button>
                    </div>
                </a>

                <div className="head-logout">
                    <button type="button" className="logout-btn" onClick={handleLogout}>
                        <span> Logout </span>
                    </button>
                </div>
            </header>

            {alert && (
                <div className="alert-box show">
                    <div className="alert success">
                        <i className="bx bxs-check-circle"></i>
                        <span>{alert}</span>
                    </div>
                </div>
            )}

            {/* Delete Success Message (from sessionStorage) */}
            {sessionStorage.getItem("successMsg") && (
                <div className="alert-box show">
                    <div className="alert success">
                        <i className="bx bxs-check-circle"></i>
                        <span>{sessionStorage.getItem("successMsg")}</span>
                    </div>
                </div>
            )}


            <div className="dashboard-container">
                <h2>Welcome Administrator: {fullname}</h2>
                <p>Manage your students below:</p>

                <div className="dashboard-cards">
                    {statuses.map((item) => {
                        const cssClass = statusCssMap[item.key] || "total";
                        return (
                            <div
                                key={item.key || "total"}
                                className={`card ${cssClass} ${filter === item.key ? "card-selected" : ""}`}
                                onClick={() => setFilter(item.key)}
                            >
                                <h3>{item.key === "" ? students.length : counts[item.key] || 0}</h3>
                                <p>{item.label}</p>
                            </div>
                        );
                    })}
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setSearchQuery(search.trim()); // triggers search when clicking Search
                    }}
                    style={{ display: "flex", 
                            alignItems: "center", 
                            gap: "12px", 
                            marginTop: "12px" }}
                >
                    <input
                        className="search-box"
                        placeholder="Search Student"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        style={searchFocusStyle}
                    />
                    <button type="submit" className="delete-btn">
                        <span> Search </span>
                    </button>

                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => {
                            setSearch("");
                            setSearchQuery("");
                            setFilter("");
                        }}
                    >
                        <span> Clear </span>
                    </button>
                </form>


                <div className="dashboard-table" style={{ marginTop: "18px" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Student No</th>
                                <th>ID Number</th>
                                <th>Email</th>
                                <th>Course</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((s) => {
                                    const cssClass = statusCssMap[s.status] || "pending";
                                    return (
                                        <tr key={s.studentNo}>
                                            <td>{s.fullname}</td>
                                            <td>{s.studentNo}</td>
                                            <td>{s.idNumber}</td>
                                            <td>{s.email}</td>
                                            <td>{s.course}</td>
                                            <td className={`status-${cssClass}`}>{s.status || "Pending"}</td>
                                            <td>
                                                <a href={`/admin_view_student/${s.studentNo}`}>
                                                    <button type="button" className="edit-btn">
                                                        <span> View </span>
                                                    </button>
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", color: 'red' }}>
                                        No students found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
