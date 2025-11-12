import React, { useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password reset successfully!");
    // هنا يمكنك ربط API الباكإند
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#fcfaf8] overflow-x-hidden"
      style={{ fontFamily: "Inter, Noto Sans, sans-serif" }}
    >
      <form
        onSubmit={handleSubmit}
        className="px-40 flex flex-1 justify-center py-5"
      >
        <div className="flex flex-col w-[512px] max-w-[512px] py-5">
          <h2 className="text-[#1c140d] text-[28px] font-bold text-center pb-3 pt-5">
            Reset Password
          </h2>

          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col flex-1">
              <p className="text-[#1c140d] text-base font-medium pb-2">
                New Password
              </p>
              <input
                type="password"
                placeholder="Enter new password"
                className="form-input w-full rounded-lg text-[#1c140d] bg-[#f3ede7] h-14 p-4 placeholder:text-[#9b714b] focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col flex-1">
              <p className="text-[#1c140d] text-base font-medium pb-2">
                Confirm New Password
              </p>
              <input
                type="password"
                placeholder="Confirm new password"
                className="form-input w-full rounded-lg text-[#1c140d] bg-[#f3ede7] h-14 p-4 placeholder:text-[#9b714b] focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
          </div>

          <p className="text-[#9b714b] text-sm px-4 pb-3">
            Password must be at least 8 characters long and include a mix of
            letters, numbers, and symbols.
          </p>

          <div className="flex justify-center px-4 py-3">
            <button
              type="submit"
              className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-[#ef8624] text-[#1c140d] text-sm font-bold"
            >
              <span>Reset Password</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
