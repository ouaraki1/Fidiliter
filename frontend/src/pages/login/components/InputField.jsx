import React from "react";

export default function InputField({ label, ...props }) {
  return (
    <label className="block text-sm">
      {label && <div className="text-sm font-medium text-text-dark mb-2">{label}</div>}
      <input
        className="form-input w-full rounded-lg bg-card-bg p-3 text-text-dark placeholder:text-accent-brown focus:outline-none focus:ring-2 focus:ring-primary"
        {...props}
      />
    </label>
  );
}
