import React from 'react';
import { useDevice } from '../../context/DeviceContext';
import { useTheme } from '../../context/ThemeContext';

const ResponsiveGrid = ({ children, desktopCols = 4, tabletCols = 2, mobileCols = 1, className = "" }) => {
  const { getGridCols } = useDevice();
  const cols = getGridCols(desktopCols, tabletCols, mobileCols);
  
  return (
    <div 
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {children}
    </div>
  );
};

const ResponsiveCard = ({ children, className = "" }) => {
  const { isDarkMode } = useTheme();
  const { isMobile } = useDevice();
  
  return (
    <div className={`
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} 
      rounded-lg shadow-lg border 
      ${isMobile ? 'p-3' : 'p-4'} 
      ${className}
    `}>
      {children}
    </div>
  );
};

const ResponsiveChart = ({ title, children, height = "auto" }) => {
  const { isDarkMode } = useTheme();
  const { isMobile, isTablet } = useDevice();
  
  const titleSize = isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl';
  const chartHeight = isMobile ? "250px" : isTablet ? "300px" : height;
  
  return (
    <ResponsiveCard className="flex flex-col justify-between">
      <h3 className={`${titleSize} font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <div className="flex-1" style={{ height: chartHeight }}>
        {children}
      </div>
      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-2 text-center`}>
        Atualizado recentemente
      </p>
    </ResponsiveCard>
  );
};

const MobileOptimizedChart = ({ children, type = "default" }) => {
  const { isMobile } = useDevice();
  
  if (!isMobile) return children;
  
  // Para mobile, ajustar layout específico por tipo de gráfico
  switch (type) {
    case 'impact':
      return (
        <div className="grid grid-cols-2 gap-1 h-full p-1">
          {children}
        </div>
      );
    case 'acceleration':
      return (
        <div className="grid grid-cols-1 gap-2 h-full p-2">
          {children}
        </div>
      );
    case 'speedometer':
      return (
        <div className="grid grid-cols-2 gap-1 h-full p-1">
          {children}
        </div>
      );
    case 'satellite':
      return (
        <div className="grid grid-cols-2 gap-1 h-full p-1">
          {children}
        </div>
      );
    default:
      return children;
  }
};

export { ResponsiveGrid, ResponsiveCard, ResponsiveChart, MobileOptimizedChart };
