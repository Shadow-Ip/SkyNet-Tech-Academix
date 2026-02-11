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

import React, { useState, useEffect } from "react";
import "../styles/style.css";
import "boxicons/css/boxicons.min.css";


export default function LoginPage() {
    // < ----------- Login form -------------- >
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // < ------------- register form (admin) ------------- >
    const [showRegister, setShowRegister] = useState(false);
    const [regFullname, setRegFullname] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirm, setRegConfirm] = useState("");

    // < -----------UI state -------------- >
    const [alert, setAlert] = useState({ type: "", message: "" }); // type: "success" | "error"
    const [forgotMessage, setForgotMessage] = useState("");
    const [showLoginPwd, setShowLoginPwd] = useState(false);
    const [showRegPwd, setShowRegPwd] = useState(false);
    const [showRegConfirmPwd, setShowRegConfirmPwd] = useState(false);

    useEffect(() => {
        if (alert.message) {
            const t = setTimeout(() => setAlert({ type: "", message: "" }), 5000);
            return () => clearTimeout(t);
        }
    }, [alert]);

    // < ---------- Helper: show alert --------------- >
    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    // < ------------- Login handler ------------- >
    const handleLogin = async (e) => {
        e.preventDefault();

    // < ----------- basic client validation ------------------ >
        if (!role) return showAlert("error", "Please select a role.");
        if (!email) return showAlert("error", "Please enter email.");
        if (!password) return showAlert("error", "Please enter password.");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: email.trim(), password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                const msg =
                    data?.error || data?.message || "Invalid login credentials.";
                showAlert("error", msg);
                return;
            }

            // success
            showAlert("success",  "Loging in. please wait... ");

// < ---------- store minimal info for later pages (my code uses localStorage) --------------- >
            if (data.fullname) localStorage.setItem("fullname", data.fullname);
            if (data.role) localStorage.setItem("role", data.role);
            if (data.studentNo) localStorage.setItem("studentNo", data.studentNo);
            if (data.email) localStorage.setItem("email", data.email);

 // < ------------- redirect based on role (keeps same routes as my PHP) ----------------- >
            setTimeout(() => {
                if (data.role === "admin" || role === "admin") {
                    window.location.href = "/admin_dashboard";
                } else {
                    window.location.href = "/student_dashboard";
                }
            }, 700); 
        } catch (err) {
            console.error("Login error:", err);
            showAlert("error", "Error connecting to the server.");
        }
    };

// < ------------ top-right Login button behavior: -------------- >
    // - if register form visible -> hide register and return to login form
    // - else -> trigger handleLogin (calls server) using a fake event object
    const topLoginClick = async (e) => {
        e.preventDefault?.();

        if (showRegister) {
// < --------- switch to login form ------------ >
            setShowRegister(false);
            // scroll to top for nicer UX
            try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (err) { }
            // highlight the login box
            const loginBox = document.querySelector(".form-box.login");
            if (loginBox) {
                loginBox.classList.add("highlight");
                setTimeout(() => loginBox.classList.remove("highlight"), 900);
            }
            return;
        }

    // < ----------- IF already on login -> call existing handler -------------- >
// < ------- handleLogin, expects an event with preventDefault  -------- >
        try {
            await handleLogin({ preventDefault: () => { } });
        } catch (err) {
            console.error("topLoginClick login attempt failed:", err);
        }
    };


    // ------------- Admin register handler -------------
    const handleRegister = async (e) => {
        e.preventDefault();

    // < --------------------- basic client validation ------------------ >
        if (!regFullname.trim())
            return showAlert("error", "Full name is required.");
        if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail))
            return showAlert("error", "Valid email is required.");
        if (!regPassword) return showAlert("error", "Password is required.");
        if (!regConfirm) return showAlert("error", "Please confirm your password.");
        if (regPassword !== regConfirm)
            return showAlert("error", "Passwords do not match.");

        try {
            const res = await fetch("/api/register_admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    fullname: regFullname.trim(),
                    email: regEmail.trim(),
                    password: regPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                const msg = data?.error || data?.message || "Registration failed.";
                showAlert("error", msg);
                return;
            }

            showAlert(
                "success",
                data.message || "Successfully created Admin account."
            );
// < ------- clear registration form and hide panel after brief delay ------------- >
            setTimeout(() => {
                setRegFullname("");
                setRegEmail("");
                setRegPassword("");
                setRegConfirm("");
                setShowRegister(false);
            }, 1000);
        } catch (err) {
            console.error("Register admin error:", err);
            showAlert("error", "Error connecting to the server.");
        }
    };

    // < ------------- Forgot password ------------- >
    const handleForgot = (e) => {
        e.preventDefault();
        if (!role) {
            showAlert("error", "Please select a role to use Forgot Password.");
            return;
        }
        if (role === "admin")
            setForgotMessage(
                "Please contact the IT Department to reset your password."
            );
        else
            setForgotMessage(
                "Please contact your course admin to reset your password."
            );

// < --------- show message briefly (5s) --------- >
        showAlert(
            "error",
            forgotMessage 
        );
        setTimeout(() => setForgotMessage(""), 5000);
    };

    // < ------------- UI helpers ------------- >
    const togglePassword = (target) => {
        if (target === "login") setShowLoginPwd((p) => !p);
        if (target === "reg") setShowRegPwd((p) => !p);
        if (target === "reg_confirm") setShowRegConfirmPwd((p) => !p);
    };

    // When role changes, hide admin register section if not admin
    // < ---------- Apply "slide" CSS transition ---------- >
    const containerClass = `container ${showRegister ? "slide" : ""}`;

    return (
        <div className="loginPage">
            <header>
                {/* eslint-disable-next-line*/}
                <a href="#" onClick={(e) => e.preventDefault()} className="logo">
                    SkyNet Tech Academix
                </a>
                <nav>
                    {/* eslint-disable-next-line*/}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                        Home
                    </a>
                    {/* eslint-disable-next-line*/}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                        About
                    </a>
                    {/* eslint-disable-next-line*/}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                        Contact
                    </a>
                </nav>

                <div className="head-login">
                    <button
                        type="button"
                        className="login-btn"
                        onClick={topLoginClick}
                    >
                        Login
                    </button>
                </div>

            </header>

            <section>
                <h2>
                    <em>Academic Management System</em>
                </h2>
            </section>

        
            {(alert.message || forgotMessage) && (
                <div className={`alert-box show`}>
                    <div
                        className={`alert ${alert.type === "success" ? "success" : "error"
                            }`}
                    >
                        <i
                            className={`bx ${alert.type === "success" ? "bxs-check-circle" : "bxs-x-circle"
                                }`}
                        ></i>
                        <span>{alert.message || forgotMessage}</span>
                    </div>
                </div>
            )}

            <div className={containerClass}>
                <div className="form-box login">
                    <h1>Login</h1>

                    <form onSubmit={handleLogin} id="loginForm">
                        <div className="input-box">
                            <select
                                id="roleSelect"
                                name="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    Select Role
                                </option>
                                <option value="student">Student</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        <div className="input-box">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <i className="bx bxs-envelope"></i>
                        </div>

                        <div className="input-box password-box">
                            <input
                                id="password"
                                type={showLoginPwd ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span
                                className="toggle-password"
                                onClick={() => togglePassword("login")}
                            >
                                <i className="bx bxs-lock-alt"></i>
                            </span>
                        </div>

                        <div className="remember-forgot">
                            <label>
                                <input type="checkbox" name="remember" /> Remember Me
                            </label>
                            {/* eslint-disable-next-line*/}
                            <a
                                id="forgotBtn"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleForgot(e);
                                }}
                            >
                                Forgot Password?
                            </a>
                        </div>

                        <button type="submit" name="login_btn" className="login-btn">
                            <span className="shadow"></span>
                            <span className="edge"></span>
                            <span className="front text">Login</span>
                        </button>

                        {/* Admin register link (visible only when admin role selected) */}
                        {role === "admin" && (
                            <div id="adminRegisterLink">
                                <p>
                                    Don't have an account?{" "}
                                    {/* eslint-disable-next-line*/}
                                    <a
                                        href="#"
                                        className="register-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowRegister(true);
                                        }}
                                    >
                                        Register
                                    </a>
                                </p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Admin registration panel (togglable) */}

                <div className="form-box register">
                    <h1>Register Admin</h1>
                    <form onSubmit={handleRegister} id="registerAdminForm">
                        <input type="hidden" name="action" value="register_admin" />

                        <div className="input-box">
                            <input
                                type="text"
                                name="reg_fullname"
                                placeholder="Full Name"
                                value={regFullname}
                                onChange={(e) => setRegFullname(e.target.value)}
                            />
                            <i className="bx bxs-user"></i>
                        </div>

                        <div className="input-box">
                            <input
                                type="email"
                                name="reg_email"
                                placeholder="Email"
                                
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                            />
                            <i className="bx bxs-envelope"></i>
                        </div>

                        <div className="input-box">
                            <input
                                type={showRegPwd ? "text" : "password"}
                                name="reg_password"
                                id="reg_password"
                                placeholder="Password"
                                minLength="5"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                            />
                            <span
                                className="toggle-password"
                                onClick={() => togglePassword("reg")}
                            >
                                <i className="bx bxs-lock-alt"></i>
                            </span>
                        </div>

                        <div className="input-box">
                            <input
                                type={showRegConfirmPwd ? "text" : "password"}
                                name="reg_confirm"
                                id="reg_confirm"
                                placeholder="Confirm Password"
                                minLength="5"
                                
                                value={regConfirm}
                                onChange={(e) => setRegConfirm(e.target.value)}
                            />
                            <span
                                className="toggle-password"
                                onClick={() => togglePassword("reg_confirm")}
                            >
                                <i className="bx bxs-lock-alt"></i>
                            </span>
                        </div>

                        <button
                            type="submit"
                            name="register_btn"
                            className="register-btn"
                        >
                            <span className="shadow"></span>
                            <span className="edge"></span>
                            <span className="front text">Register</span>
                        </button>

                        <div className="register-link">
                            <p>
                                Already have an account?{" "}
                                {/* eslint-disable-next-line*/}
                                <a
                                    href="#"
                                    className="login-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowRegister(false);
                                    }}
                                >
                                    Login
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* hidden form for forgot password */}
            <form id="forgotForm" method="POST" style={{ display: "none" }}>
                <input type="hidden" name="action" value="forgot" />
                <input type="hidden" name="role" id="forgotRole" value={role} />
            </form>
        </div>
    );
}
