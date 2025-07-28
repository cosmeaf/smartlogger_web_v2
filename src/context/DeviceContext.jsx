import React, { createContext, useContext, useState, useEffect } from 'react';

const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: 'portrait',
    touchSupported: false,
    userAgent: navigator.userAgent,
  });

  const detectDevice = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detectar se é touch device
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Detectar orientação
    const orientation = width > height ? 'landscape' : 'portrait';
    
    // Detectar tipo de dispositivo baseado na largura da tela
    const isMobile = width <= 768;
    const isTablet = width > 768 && width <= 1024;
    const isDesktop = width > 1024;
    
    // Detectar dispositivo baseado no user agent
    const mobileDevices = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUA = mobileDevices.test(userAgent);
    
    // Combinação final
    const finalIsMobile = isMobile || (isMobileUA && width <= 1024);
    const finalIsTablet = !finalIsMobile && (isTablet || (isMobileUA && width > 768));
    const finalIsDesktop = !finalIsMobile && !finalIsTablet;

    setDevice({
      isMobile: finalIsMobile,
      isTablet: finalIsTablet,
      isDesktop: finalIsDesktop,
      screenWidth: width,
      screenHeight: height,
      orientation,
      touchSupported,
      userAgent: navigator.userAgent,
    });
  };

  useEffect(() => {
    detectDevice();
    
    const handleResize = () => {
      detectDevice();
    };

    const handleOrientationChange = () => {
      // Aguarda um pouco para a mudança de orientação finalizar
      setTimeout(detectDevice, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const getGridCols = (desktop = 4, tablet = 2, mobile = 1) => {
    if (device.isMobile) return mobile;
    if (device.isTablet) return tablet;
    return desktop;
  };

  const getResponsiveClasses = (desktopClass, tabletClass, mobileClass) => {
    if (device.isMobile) return mobileClass;
    if (device.isTablet) return tabletClass;
    return desktopClass;
  };

  const value = {
    ...device,
    getGridCols,
    getResponsiveClasses,
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice deve ser usado dentro de um DeviceProvider');
  }
  return context;
};
