import React, { useState } from "react";
import { Link  } from "react-router-dom";
// import { useNavigate  } from "react-router-dom";
import InputField from "./components/InputField";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  // const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: ربط مع الباك إند عبر fetch/axios
    // مثال (تعليق):
    // fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) })
    // .then(...)
    console.log("login", { phone, password });
    // بعد تسجيل الدخول الناجح:
    // navigate('/dashboard');
    alert("محاكاة تسجيل الدخول — الآن يمكنك ربط الزر مع الباك إند");
  };
// ERROR: 
  return (
    <div className="flex items-center justify-center min-h-[72vh] px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm">
        <div className="text-center">
          {/* logo */}
          <svg className="mx-auto h-12 w-auto text-primary" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor" />
            <path d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236Z" fill="currentColor" />
          </svg>

          <h2 className="mt-6 text-2xl font-bold text-text-dark">Fideliter</h2>
          <p className="mt-1 text-sm text-gray-600">Vendor Login</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <InputField
              label="Phone Number"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              required
            />
          </div>

          <div>
            <InputField
              label="Password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          <div className="flex items-center justify-end text-sm">
            <Link to="/forgot-password" className="text-primary font-medium">
              Forgot Password?
            </Link>
          </div>

          <div>
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:opacity-95">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
