import React from 'react';

const LoadPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-white"></div>
      </div>
    </div>
  );
};

export default LoadPage;
