// File: src/components/form/SelectField.jsx
import React from 'react';

export const SelectField = ({ label, options, value, onChange, className = '' }) => (
  <div>
    <label className="block mb-2 font-medium">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={onChange}
        className={`w-full px-4 rounded-lg bg-white border-2 border-black h-[50px] shadow-button appearance-none pr-10 ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);