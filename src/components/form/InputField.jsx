// File: src/components/form/InputField.jsx
import React from 'react';

export const InputField = ({ label, type = 'text', placeholder, value, onChange, className = '' }) => (
  <div>
    <label className="block mb-2 font-medium">{label}</label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 rounded-lg bg-white border-2 border-black h-[50px] shadow-button ${className}`}
      />
    </div>
  </div>
);
