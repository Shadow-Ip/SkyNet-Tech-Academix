import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem("admin")) || null);

    const login = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("admin", JSON.stringify(data.admin));
        setAdmin(data.admin);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
