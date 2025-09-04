// src/components/Sidebar.js

import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useDevice } from '../context/DeviceContext';
import { AuthContext } from '../context/AuthContext';
import { useThemeTransitions } from '../hooks/useThemeTransitions';
import Swal from 'sweetalert2';
import '../styles/transitions.css';
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
  FaChartLine,
} from 'react-icons/fa';
import packageJson from '../../package.json';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const version = packageJson.version;
  const { isDarkMode, toggleTheme } = useTheme();
  const { isMobile, isTablet } = useDevice();
  const { logout } = useContext(AuthContext);
  
  // 🎭 Hook para transições suaves de tema
  const {
    isTransitioning,
    iconRef,
    buttonRef,
    handleThemeChange
  } = useThemeTransitions(toggleTheme, isDarkMode);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Você tem certeza?',
      text: 'Deseja realmente sair do sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isDarkMode ? '#1f2937' : '#2563eb',
      cancelButtonColor: isDarkMode ? '#374151' : '#64748b',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
      background: isDarkMode ? '#111827' : '#ffffff',
      color: isDarkMode ? '#f9fafb' : '#111827',
      iconColor: isDarkMode ? '#60a5fa' : '#2563eb',
      width: '420px',
      padding: '2rem',
      customClass: {
        popup: isDarkMode ? 'dark-popup' : 'light-popup',
        title: isDarkMode ? 'dark-title' : 'light-title',
        htmlContainer: isDarkMode ? 'dark-text' : 'light-text',
        confirmButton: 'custom-confirm-btn',
        cancelButton: 'custom-cancel-btn'
      },
      didOpen: () => {
        // Aplica estilos personalizados
        const style = document.createElement('style');
        style.innerHTML = `
          .dark-popup {
            border: 2px solid #374151 !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8) !important;
            border-radius: 16px !important;
          }
          .light-popup {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
            border-radius: 16px !important;
            border: 2px solid #e5e7eb !important;
          }
          .dark-title {
            color: #f9fafb !important;
            font-size: 1.5rem !important;
            font-weight: 600 !important;
          }
          .light-title {
            color: #111827 !important;
            font-size: 1.5rem !important;
            font-weight: 600 !important;
          }
          .dark-text {
            color: #d1d5db !important;
            font-size: 1.1rem !important;
          }
          .light-text {
            color: #4b5563 !important;
            font-size: 1.1rem !important;
          }
          .custom-confirm-btn {
            background: ${isDarkMode ? 'linear-gradient(135deg, #111827, #1f2937)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)'} !important;
            border: ${isDarkMode ? '2px solid #374151' : '2px solid #1e40af'} !important;
            color: ${isDarkMode ? '#f9fafb' : '#ffffff'} !important;
            box-shadow: 0 8px 20px ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(37, 99, 235, 0.4)'} !important;
            transition: all 0.3s ease !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            padding: 12px 24px !important;
            border-radius: 8px !important;
          }
          .custom-confirm-btn:hover {
            background: ${isDarkMode ? 'linear-gradient(135deg, #1f2937, #374151)' : 'linear-gradient(135deg, #1d4ed8, #1e40af)'} !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 25px ${isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(37, 99, 235, 0.5)'} !important;
          }
          .custom-cancel-btn {
            background: ${isDarkMode ? 'linear-gradient(135deg, #374151, #4b5563)' : 'linear-gradient(135deg, #64748b, #475569)'} !important;
            border: ${isDarkMode ? '2px solid #4b5563' : '2px solid #475569'} !important;
            color: #ffffff !important;
            box-shadow: 0 8px 20px ${isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(100, 116, 139, 0.4)'} !important;
            transition: all 0.3s ease !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            padding: 12px 24px !important;
            border-radius: 8px !important;
          }
          .custom-cancel-btn:hover {
            background: ${isDarkMode ? 'linear-gradient(135deg, #4b5563, #6b7280)' : 'linear-gradient(135deg, #475569, #334155)'} !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 25px ${isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(100, 116, 139, 0.5)'} !important;
          }
        `;
        document.head.appendChild(style);
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostra notificação de sucesso maior e mais bonita
        Swal.fire({
          title: 'Logout Realizado!',
          text: 'Você foi desconectado com sucesso. Redirecionando...',
          icon: 'success',
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
          background: isDarkMode ? '#111827' : '#ffffff',
          color: isDarkMode ? '#f9fafb' : '#111827',
          iconColor: isDarkMode ? '#10b981' : '#059669',
          width: '400px',
          padding: '2rem',
          customClass: {
            popup: isDarkMode ? 'dark-success-popup' : 'light-success-popup',
            title: isDarkMode ? 'dark-success-title' : 'light-success-title',
            htmlContainer: isDarkMode ? 'dark-success-text' : 'light-success-text'
          },
          didOpen: () => {
            const style = document.createElement('style');
            style.innerHTML = `
              .dark-success-popup {
                border: 2px solid #10b981 !important;
                box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.3) !important;
                border-radius: 16px !important;
                background: linear-gradient(135deg, #111827, #1f2937) !important;
              }
              .light-success-popup {
                box-shadow: 0 25px 50px -12px rgba(5, 150, 105, 0.3) !important;
                border-radius: 16px !important;
                border: 2px solid #10b981 !important;
                background: linear-gradient(135deg, #ffffff, #f8fafc) !important;
              }
              .dark-success-title {
                color: #10b981 !important;
                font-size: 1.5rem !important;
                font-weight: 700 !important;
              }
              .light-success-title {
                color: #059669 !important;
                font-size: 1.5rem !important;
                font-weight: 700 !important;
              }
              .dark-success-text {
                color: #d1d5db !important;
                font-size: 1rem !important;
              }
              .light-success-text {
                color: #4b5563 !important;
                font-size: 1rem !important;
              }
            `;
            document.head.appendChild(style);
          },
          willClose: () => {
            // Executa logout após o modal fechar
            logout();
          }
        });
      }
    });
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
    { to: '/dashboard/reports', label: 'Relatórios', icon: <FaChartLine />, category: 'main' },
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
        <div className={`${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'} backdrop-blur-lg border-t px-2 py-2`}>
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
            
            {/* Botão Traccar */}
            <a
              href="https://traccar.smartlogger.com.br/login"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800/50' : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50/70'
              }`}
            >
              <div className="text-xl mb-1">
                <FaMapMarkedAlt />
              </div>
              <span className="text-xs font-medium text-center leading-tight">Traccar</span>
            </a>
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
          if (link.action === 'logout') {
            return (
              <button
                key={link.to}
                onClick={handleLogout}
                className={`flex items-center py-3 px-4 mb-2 rounded-xl transition-all duration-200 group relative hover:bg-red-600/20 hover:text-red-400 ${
                  isOpen ? 'justify-start' : 'justify-center'
                } w-full text-left`}
                aria-label={link.label}
              >
                <div className={`text-lg ${!isOpen ? 'mx-auto' : 'ml-0'} text-blue-400 group-hover:text-red-400`}>
                  {link.icon}
                </div>
                {isOpen && (
                  <span className="ml-4 text-sm font-medium text-blue-400 group-hover:text-red-400">
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
              </button>
            );
          }
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center py-3 px-4 mb-2 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25' 
                  : 'hover:bg-blue-700/50 hover:shadow-md'
              } ${isOpen ? 'justify-start' : 'justify-center'}`}
              aria-label={link.label}
            >
              <div className={`text-lg ${!isOpen ? 'mx-auto' : 'ml-0'} ${
                isActive 
                  ? 'text-white' 
                  : 'text-blue-300 group-hover:text-white'
              }`}>
                {link.icon}
              </div>
              {isOpen && (
                <span className={`ml-4 text-sm font-medium ${
                  isActive 
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
