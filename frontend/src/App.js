import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import AdminViewStudent from "./components/AdminViewStudent";
import AdminRegisterStudent from "./components/AdminRegisterStudent";
import AdminEditStudent from "./components/AdminEditStudent";
import StudentDashboard from "./components/StudentDashboard";
import StudentProfile from "./components/StudentProfile";
import StudentProfileReport from "./components/StudentProfileReport";



export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin_dashboard" element={<AdminDashboard />} />
          <Route path="/admin_view_student/:studentNo" element={<AdminViewStudent/>}/>
          <Route path="/admin_edit_student/:studentNo" element={<AdminEditStudent/>}/>
          <Route path="/admin_register_student"element={<AdminRegisterStudent/>}/>
          <Route path="/student_dashboard" element={<StudentDashboard/>}/>
          <Route path="/student_profile" element={<StudentProfile/>}/>
          <Route path="/student_profile_report" element={<StudentProfileReport/>}/>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
