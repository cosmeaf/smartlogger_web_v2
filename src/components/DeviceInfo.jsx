import React, { useState } from 'react';
import { useDevice } from '../context/DeviceContext';
import { useTheme } from '../context/ThemeContext';

const DeviceInfo = () => {
  const [showInfo, setShowInfo] = useState(false);
  const { isMobile, isTablet, isDesktop, screenWidth, screenHeight, orientation, touchSupported } = useDevice();
  const { isDarkMode } = useTheme();

  if (!showInfo) {
    return (
      <button
        onClick={() => setShowInfo(true)}
        className={`fixed bottom-4 left-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-full w-10 h-10 flex items-center justify-center shadow-lg border z-50 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} hover:scale-110 transition-transform`}
        title="Informações do dispositivo"
      >
        📱
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-xl border p-3 z-50 min-w-[200px]`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Info do Dispositivo
        </h4>
        <button
          onClick={() => setShowInfo(false)}
          className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'} text-lg font-bold`}
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span>Tipo:</span>
          <span className="font-medium">
            {isMobile && '📱 Mobile'}
            {isTablet && '📱 Tablet'}
            {isDesktop && '💻 Desktop'}
          </span>
        </div>
        
        <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span>Resolução:</span>
          <span className="font-medium">{screenWidth}x{screenHeight}</span>
        </div>
        
        <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span>Orientação:</span>
          <span className="font-medium">
            {orientation === 'portrait' ? '📱 Retrato' : '📱 Paisagem'}
          </span>
        </div>
        
        <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span>Touch:</span>
          <span className="font-medium">
            {touchSupported ? '✅ Sim' : '❌ Não'}
          </span>
        </div>
        
        <div className={`mt-2 pt-2 border-t text-center ${isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
          Layout adaptativo ativo
        </div>
      </div>
    </div>
  );
};

export default DeviceInfo;
