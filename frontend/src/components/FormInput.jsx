import React from 'react';

const FormInput = ({ type = "text", value, onChange, placeholder, required = false }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full p-2 border rounded-lg
        text-gray-900 
        bg-white
        border-gray-300
        placeholder-gray-500
        focus:ring-2 
        focus:ring-blue-500 
        focus:border-transparent"
    />
  );
};

export default FormInput;