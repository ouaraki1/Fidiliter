import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./pages/login/components/Navbar.jsx";
import Login from "./pages/login/Login.jsx";
import ForgotPasswordPhone from "./pages/login/ForgotPasswordPhone.jsx";
import ForgotPasswordOTP from "./pages/login/ForgotPasswordOTP.jsx";
import ResetPassword from "./pages/login/ResetPassword.jsx"
export default function App() {
  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      <main className="pt-6">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPhone />} />
          <Route path="/verify-otp" element={<ForgotPasswordOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<div className="p-8 text-center">صفحة غير موجودة</div>} />
        </Routes>
      </main>
    </div>
  );
}
