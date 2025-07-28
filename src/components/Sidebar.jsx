// src/components/Sidebar.js

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useDevice } from '../context/DeviceContext';
import {
  FaBars,
  FaHome,
  FaUserFriends,
  FaTruckMonster,
  FaTractor,
  FaTimes,
  FaMapMarkedAlt,
  FaChevronRight,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';
import packageJson from '../../package.json';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const version = packageJson.version;
  const { isDarkMode } = useTheme();
  const { isMobile, isTablet } = useDevice();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Auto-close sidebar on mobile when route changes
  React.useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Links de Navegação
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <FaHome />, category: 'main' },
    // { to: '/dashboard/devices', label: 'Dispositivos', icon: <FaTruckMonster />, category: 'main' },
    { to: '/dashboard/equipments', label: 'Equipamentos', icon: <FaTractor />, category: 'main' },
    // { to: '/dashboard/employees', label: 'Colaboradores', icon: <FaUserFriends />, category: 'main' },
  ];

  const externalLinks = [
    { external: true, to: 'https://traccar.smartlogger.com.br/login', label: 'Traccar', icon: <FaMapMarkedAlt /> },
  ];

  const bottomLinks = [
    // { to: '/dashboard/settings', label: 'Configurações', icon: <FaCog /> },
    { to: '/logout', label: 'Sair', icon: <FaSignOutAlt />, action: 'logout' },
  ];

  // Renderiza Bottom Navigation para mobile
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className={`${isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-lg border-t px-2 py-2`}>
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                    isActive 
                      ? `${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-lg` 
                      : `${isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'}`
                  }`}
                >
                  <div className={`text-xl mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                    {link.icon}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : ''} text-center leading-tight`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
            
            {/* Botão de Links Externos/Menu */}
            <div className="relative">
              <button
                onClick={toggleSidebar}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                  isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="text-xl mb-1">
                  <FaBars />
                </div>
                <span className="text-xs font-medium text-center leading-tight">Menu</span>
              </button>
              
              {/* Menu expansível para mobile */}
              {isOpen && (
                <div className={`absolute bottom-full right-0 mb-2 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl shadow-xl border min-w-[200px] overflow-hidden`}>
                  {/* Links externos */}
                  {externalLinks.map((link) => (
                    <a
                      key={link.to}
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center px-4 py-3 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors duration-200`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="text-lg mr-3">
                        {link.icon}
                      </div>
                      <span className="text-sm font-medium">{link.label}</span>
                    </a>
                  ))}
                  
                  {/* Separador */}
                  <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
                  
                  {/* Links do sistema */}
                  {bottomLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center px-4 py-3 transition-colors duration-200 ${
                        link.action === 'logout'
                          ? `${isDarkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`
                          : `${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="text-lg mr-3">
                        {link.icon}
                      </div>
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  ))}
                  
                  {/* Versão */}
                  <div className={`px-4 py-2 border-t ${isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                      SMARTLOGGER v{version}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white shadow-2xl transition-all duration-300 ease-in-out ${
        isOpen ? 'w-72' : 'w-20'
      } min-h-screen border-r border-blue-700 dark:border-gray-700`}
    >
      {/* Cabeçalho do Sidebar */}
      <div className="flex items-center justify-between p-6 border-b border-blue-700 dark:border-gray-700 bg-blue-800/50 dark:bg-gray-800/50 transition-colors duration-300">
        {isOpen && (
          <div className="flex items-center space-x-3">
            <span className="font-bold text-xl bg-gradient-to-r from-gray-100 via-white to-gray-200 dark:from-gray-200 dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              SMARTLOGGER
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-gray-500"
          aria-label={isOpen ? 'Colapsar Sidebar' : 'Expandir Sidebar'}
        >
          {isOpen ? 
            <FaTimes className="h-5 w-5 text-blue-300 dark:text-gray-300" /> : 
            <FaBars className="h-5 w-5 text-blue-300 dark:text-gray-300" />
          }
        </button>
      </div>

      {/* Links de Navegação Principais */}
      <nav className="flex-1 mt-6 px-3">
        {isOpen && (
          <div className="mb-4">
            <span className="text-xs uppercase tracking-wider text-blue-400 dark:text-gray-400 font-semibold px-3 transition-colors duration-300">
              Menu Principal
            </span>
          </div>
        )}
        
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center py-3 px-4 mb-2 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-gray-600 dark:to-gray-500 shadow-lg shadow-blue-500/25 dark:shadow-gray-500/25' 
                  : 'hover:bg-blue-700/50 dark:hover:bg-gray-700/50 hover:shadow-md'
              } ${isOpen ? 'justify-start' : 'justify-center'}`}
              aria-label={link.label}
            >
              <div className={`text-lg ${!isOpen ? 'mx-auto' : 'ml-0'} ${
                isActive ? 'text-white' : 'text-blue-300 dark:text-gray-300 group-hover:text-white'
              } transition-colors duration-300`}>
                {link.icon}
              </div>
              {isOpen && (
                <>
                  <span className={`ml-4 text-sm font-medium ${
                    isActive ? 'text-white' : 'text-blue-300 dark:text-gray-300 group-hover:text-white'
                  } transition-colors duration-300`}>
                    {link.label}
                  </span>
                  {isActive && (
                    <FaChevronRight className="ml-auto text-white text-sm" />
                  )}
                </>
              )}
              
              {/* Tooltip para sidebar fechada */}
              {!isOpen && (
                <span className="absolute left-full ml-3 w-max bg-gray-900 text-white text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 shadow-xl border border-gray-700">
                  {link.label}
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
                </span>
              )}
            </Link>
          );
        })}

        {/* Links Externos */}
        {isOpen && externalLinks.length > 0 && (
          <div className="mt-8 mb-4">
            <span className="text-xs uppercase tracking-wider text-blue-400 dark:text-gray-400 font-semibold px-3 transition-colors duration-300">
              Links Externos
            </span>
          </div>
        )}
        
        {externalLinks.map((link) => (
          <a
            key={link.to}
            href={link.to}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center py-3 px-4 mb-2 rounded-xl hover:bg-blue-700/50 dark:hover:bg-gray-700/50 hover:shadow-md transition-all duration-200 group relative ${
              isOpen ? 'justify-start' : 'justify-center'
            }`}
            aria-label={link.label}
          >
            <div className={`text-lg ${!isOpen ? 'mx-auto' : 'ml-0'} text-blue-300 group-hover:text-white`}>
              {link.icon}
            </div>
            {isOpen && (
              <span className="ml-4 text-sm font-medium text-blue-300 group-hover:text-white">
                {link.label}
              </span>
            )}
            
            {/* Tooltip para sidebar fechada */}
            {!isOpen && (
              <span className="absolute left-full ml-3 w-max bg-gray-900 text-white text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 shadow-xl border border-gray-700">
                {link.label}
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Links do rodapé (Configurações, Sair) */}
      <div className="px-3 pb-4">
        {isOpen && (
          <div className="mb-4 border-t border-blue-700 pt-4">
            <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold px-3">
              Sistema
            </span>
          </div>
        )}
        
        {bottomLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center py-3 px-4 mb-2 rounded-xl transition-all duration-200 group relative ${
                link.action === 'logout'
                  ? 'hover:bg-red-600/20 hover:text-red-400'
                  : isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25' 
                    : 'hover:bg-blue-700/50 hover:shadow-md'
              } ${isOpen ? 'justify-start' : 'justify-center'}`}
              aria-label={link.label}
            >
              <div className={`text-lg ${!isOpen ? 'mx-auto' : 'ml-0'} ${
                link.action === 'logout'
                  ? 'text-blue-400 group-hover:text-red-400'
                  : isActive 
                    ? 'text-white' 
                    : 'text-blue-300 group-hover:text-white'
              }`}>
                {link.icon}
              </div>
              {isOpen && (
                <span className={`ml-4 text-sm font-medium ${
                  link.action === 'logout'
                    ? 'text-blue-400 group-hover:text-red-400'
                    : isActive 
                      ? 'text-white' 
                      : 'text-blue-300 group-hover:text-white'
                }`}>
                  {link.label}
                </span>
              )}
              
              {/* Tooltip para sidebar fechada */}
              {!isOpen && (
                <span className="absolute left-full ml-3 w-max bg-gray-900 text-white text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 shadow-xl border border-gray-700">
                  {link.label}
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Rodapé com Versão */}
      {isOpen && (
        <div className="p-4 border-t border-blue-700 bg-blue-800/30">
          <div className="text-center">
            <p className="text-xs text-blue-400 mb-1">SMARTLOGGER WEB</p>
            <p className="text-xs font-semibold text-blue-300">v{version}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
