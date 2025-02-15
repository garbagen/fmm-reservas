import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Alert = ({ children, variant = 'info' }) => {
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[variant]} flex items-start gap-2`}>
      {variant === 'success' ? (
        <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      )}
      <div>{children}</div>
    </div>
  );
};

export default Alert;