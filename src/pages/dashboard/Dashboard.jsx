import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useDevice } from '../../context/DeviceContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const { isMobile } = useDevice();
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      {/* Sidebar - oculta no mobile */}
      {!isMobile && <Sidebar />}
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - ajustado para mobile */}
        <Header />
        
        {/* Main content - com padding bottom no mobile para a bottom nav */}
        <main className={`flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto overflow-x-hidden transition-colors duration-300 ${
          isMobile ? 'pb-20' : ''
        }`}>
          <Outlet />
        </main>
      </div>
      
      {/* Bottom Navigation - apenas no mobile */}
      {isMobile && <Sidebar />}
    </div>
  );
};

export default Dashboard;