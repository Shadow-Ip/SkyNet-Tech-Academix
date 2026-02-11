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

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/style.css";

export default function StudentProfileReport() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const mounted = useRef(true);

  const studentNo = localStorage.getItem("studentNo");

  useEffect(() => {
    mounted.current = true;
    if (!studentNo) {
      // if not logged in
      navigate("/");
      return;
    }
    fetchStudent();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const fetchStudent = async () => {
    try {
      const res = await API.get(`/students/${studentNo}`);
      if (!mounted.current) return;
      setStudent(res.data);
    } catch (err) {
      console.error("Failed to load report data (primary):", err);
// < ---- try fallback endpoint if available ----- >
      try {
        const res2 = await API.get("/students/report");
        if (!mounted.current) return;
        setStudent(res2.data);
      } catch (err2) {
        console.error("Failed to load report data (fallback):", err2);
        if (!mounted.current) return;
        setAlert({ type: "error", message: "Failed to load student report." });
// < ---- keep a visible message and not infinite spinner ----- >
        setTimeout(() => setAlert({ type: "", message: "" }), 5000);
      }
    }
  };

// < --------- Build same HTML snapshot used for PDF ----------- >
  const buildPdfHtml = (studentData) => {
    const dt = new Date();
    const generated = `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;

    const styles = `
      * {
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
  }

  body {
    margin: 0;
    padding: 0;
    background: #f5f5f5;
  }

  .page {
    width: 794px;
    margin: 20px auto;
    background: transparent;
  }

  .page-header {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 6px 10px 20px;
  }

  .page-header .left {
    position: absolute;
    left: 10px;
    top: 8px;
    font-size: 12px;
    color: #222;
  }

  .page-header .center {
    width: 100%;
    text-align: center;
    font-size: 12px;
    color: #222;
  }

  .card {
    background: #fff;
    border-radius: 6px;
    padding: 28px 34px;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
    border: 1px solid #eee;
  }

  .brand {
    text-align: center;
    font-weight: 700;
    font-size: 20px;
    margin-bottom: 8px;
    color: rgba(248, 7, 7, 1);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .profile-title {
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    margin: 6px 0 18px;
    text-transform: none;
  }

  table.report {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  table.report td {
    border: 1px solid #ddd;
    padding: 12px 10px;
    vertical-align: top;
  }

  table.report td:first-child {
    width: 170px;
    font-weight: 600;
    background: #fafafa;
  }

  .course-summary {
    white-space: normal;
    line-height: 1.45;
  }

  .footer-space {
    height: 12px;
  }
    `;
    const esc = (v) =>
      v === null || v === undefined
        ? ""
        : String(v)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    const html = `
      <div class="page">
        <style>${styles}</style>
        <div class="page-header">
          <div class="left">${generated}</div>
        </div>

        <div class="card">
          <div class="brand">SkyNet Tech Academix</div>

          <div class="card-top">
            <div></div>
            <div style="font-size:12px;color:#333;">${generated}</div>
          </div>

          <div class="profile-title">${esc(
            studentData.fullname
          )}'s Profile Summary</div>

          <table class="report" cellpadding="0" cellspacing="0">
            <tr>
                <td>Full Name</td>
                <td>${esc(studentData.fullname)}</td></tr>
            <tr>
                <td>ID Number</td>
                <td>${esc(studentData.idNumber)}</td></tr>
            <tr>
                <td>Student Number</td>
                <td>${esc(studentData.studentNo)}</td></tr>
            <tr>
                <td>Email</td>
                <td>${esc(studentData.email)}</td></tr>
            <tr>
                <td>Date of Birth</td>
                <td>${esc(
                  studentData.dateofBirth
                    ? studentData.dateofBirth.split("T")[0]
                    : ""
                )}</td></tr>
            <tr>
              <td>Course</td>
              <td>${esc(studentData.course || "Not specified")}</td>
            </tr>
            <tr>
              <td>Course Summary</td>
              <td class="course-summary">${esc(
                studentData.courseSummary || "Not specified"
              ).replace(/\n/g, "<br/>")}</td>
            </tr>
            <tr>
              <td>Enrollment Date</td>
              <td>${esc(
                studentData.enrollmentDate
                  ? studentData.enrollmentDate.split("T")[0]
                  : ""
              )}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td>${esc(studentData.status || "")}</td>
            </tr>
          </table>

          <div class="footer-space"></div>
        </div>
      </div>
    `;
    return html;
  };

  // Generate PDF from HTML snapshot (used for both profile & registration)
  const downloadPDF = async (sectionId, filename) => {
    if (!student) return alert("No student data available.");

    try {
      // For registration slip
      // -- still the same card layout, but with registration fields --
      if (sectionId === "profile") {
        const html = buildPdfHtml(student);
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.left = "-10000px";
        container.style.top = "0";
        container.innerHTML = html;
        document.body.appendChild(container);

        const target = container.querySelector(".page");
        const canvas = await html2canvas(target, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        document.body.removeChild(container);

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidthMm = pageWidth - 16;
        const pdfHeightMm = (imgProps.height * pdfWidthMm) / imgProps.width;
        pdf.addImage(imgData, "PNG", 8, 8, pdfWidthMm, pdfHeightMm);
        pdf.save(filename);
        return;
      }

      // For registration slip, build a simple snapshot to match the style
      if (sectionId === "registration") {
        const dt = new Date();
        const generated = `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
        const esc = (v) =>
          v === null || v === undefined
            ? ""
            : String(v)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        const styles = `
          * { box-sizing: border-box;
font-family: Arial,
Helvetica,
sans-serif;
color: #111;
}

body {
  margin: 0;
  padding: 0;
  background: #f5f5f5;
}

.page {
  width: 794px;
  margin: 20px auto;
  background: transparent;
}

.card {
  background: #fff;
  border-radius: 6px;
  padding: 28px 34px;
  border: 1px solid #eee;
}

table.report {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

table.report td {
  border: 1px solid #ddd;
  padding: 12px 10px;
  vertical-align: top;
}

table.report td:first-child {
  width: 170px;
  font-weight: 600;
  background: #fafafa; }
        `;
        const html = `
            <div class="page">
                <style>${styles}</style>
                <div style="text-align:center;
                font-weight:700;
                font-size:20px;
                margin-bottom:10px; 
                color:red;">SkyNet Tech Academix</div>
                <div style="text-align:right;font-size:12px;margin-bottom:8px;">${generated}</div>
                <div class="card">
                    <div style="font-weight:700;font-size:18px;margin-bottom:10px;text-align:center;">Registration Confirmation Slip</div>
                    <table class="report">
                        <tr><td>Student</td>
                        <td>${esc(student.fullname)} (${esc(
          student.studentNo
        )})</td></tr>
                        <tr><td>Email</td>
                        <td>${esc(student.email)}</td></tr>
                        <tr><td>Course</td>
                        <td>${esc(student.course || "")}</td></tr>
                        <tr><td>Course Summary</td>
                        <td>${esc(student.courseSummary || "").replace(
                          /\n/g,
                          "<br/>"
                        )}</td></tr>
                        <tr><td>Enrollment Date</td>
                        <td>${esc(student.enrollmentDate || "")}</td></tr>
                        <tr><td>Registration Timestamp</td>
                        <td>${esc(
                          student.registrationTimestamp || ""
                        )}</td></tr>
                        <tr><td>Status</td><td>${esc(
                          student.status || ""
                        )}</td></tr>
                    </table>
                </div>
            </div>
        `;

        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.left = "-10000px";
        container.style.top = "0";
        container.innerHTML = html;
        document.body.appendChild(container);

        const target = container.querySelector(".page");
        const canvas = await html2canvas(target, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: "#fff",
        });
        document.body.removeChild(container);

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidthMm = pageWidth - 16;
        const pdfHeightMm = (imgProps.height * pdfWidthMm) / imgProps.width;
        pdf.addImage(imgData, "PNG", 8, 8, pdfWidthMm, pdfHeightMm);
        pdf.save(filename);
        return;
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. See console for details.");
    }
  };

  // Print: temporarily inject header that matches PDF before printing
  const printSection = (id) => {
    const section = document.getElementById(id);
    if (!section) return alert("Section not found.");

// < ------ create print header ------- >
    const dt = new Date();
    const generated = `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
    const header = document.createElement("div");
    header.id = "temp-print-header";
    header.style.textAlign = "center";
    header.style.marginBottom = "12px";
    header.innerHTML = `
        <h2 style="font-weight:700;margin:0; color:red; font-size:34px;">SkyNet Tech Academix</h2>
      <div style="text-align:right;font-size:10pt;margin-bottom:6px; color:black;">
        <span style="text-align:right;">${generated}</span>
      </div>
      
      
    `;

// < ------ insert before the section to print ------- >
    section.parentNode.insertBefore(header, section);
    window.print();
    // remove header afterwards
    header.remove();
  };

  // If fetch failed and student remains null for long, show real error
  if (!student && alert.message) {
    return (
      <div style={{ textAlign: "center", marginTop: 40, color: "#222" }}>
        <h2>{alert.message}</h2>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ textAlign: "center", marginTop: 40, color: "#e21111ff" }}>
        <h2>Loading student report...</h2>
      </div>
    );
  }


  return (
    <div>
      {alert.message && (
        <div className="alert-box show">
          <div className={`alert ${alert.type}`}>
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      <header className="tabs no-print">
        <div className="logo">SkyNet Tech Academix</div>

        <div className="RegSlip">
          <button
            className="RegSlip-btn"
            onClick={() => navigate("/student_dashboard")}
          >
            <span>{"<== Dashboard"}</span>
          </button>
        </div>

        <div className="ProSummary">
          <button
            className="ProSummary-btn"
            onClick={() => setActiveTab("profile")}
          >
            <span>Profile Summary</span>
          </button>
        </div>

        <div className="RegSlip">
          <button
            className="RegSlip-btn"
            onClick={() => setActiveTab("registration")}
          >
            <span>Registration Slip</span>
          </button>
        </div>

        <div className="head-logout">
          <button
            type="button"
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="wrapReport">
        {activeTab === "profile" && (
          <div id="profile" className="report-card">
            <div className="report-title">
              {student.fullname}'s Profile Summary
            </div>
            <div className="report-table">
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
                    <td>Date of Birth</td>
                    <td>{student.dateofBirth?.split("T")[0]}</td>
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
                      {student.enrollmentDate?.split("T")[0] || "Not Enrolled"}
                    </td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>{student.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="no-print">
              <button
                className="print-btn"
                onClick={() => printSection("profile")}
              >
                Print
              </button>
              <button
                className="pdf-btn"
                onClick={() => downloadPDF("profile", "profile_summary.pdf")}
              >
                Download PDF
              </button>
              <button
                className="Return-btn"
                onClick={() => navigate("/student_profile")}
              >
                <span>Back</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "registration" && (
          <div id="registration" className="report-card">
            <div className="report-title">Registration Confirmation Slip</div>
            <div className="report-table">
              <table>
                <tbody>
                  <tr>
                    <td>Student</td>
                    <td>
                      {student.fullname} ({student.studentNo})
                    </td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>{student.email}</td>
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
                      {student.enrollmentDate?.split("T")[0] || "Not Enrolled"}
                    </td>
                  </tr>
                  <tr>
                    <td>Registration Timestamp</td>
                    <td>
                      {student.registrationTimestamp
                        ? student.registrationTimestamp
                            .replace("T", " ")
                            .slice(0, 19)
                        : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>{student.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="no-print">
              <button
                className="print-btn"
                onClick={() => printSection("registration")}
              >
                Print
              </button>
              <button
                className="pdf-btn"
                onClick={() =>
                  downloadPDF("registration", "registration_slip.pdf")
                }
              >
                Download PDF
              </button>
              <button
                className="Return-btn"
                onClick={() => navigate("/student_profile")}
              >
                <span>Back</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
