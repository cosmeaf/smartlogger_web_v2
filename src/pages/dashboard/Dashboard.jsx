import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 overflow-y-auto transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;