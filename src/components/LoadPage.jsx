import React from 'react';
import { useTheme } from '../context/ThemeContext';

const LoadPage = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-gray-800 text-white transition-colors duration-300">
      <div className="flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-white dark:border-gray-300"></div>
      </div>
    </div>
  );
};

export default LoadPage;
