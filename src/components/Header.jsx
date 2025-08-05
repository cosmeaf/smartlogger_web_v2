import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDevice } from '../context/DeviceContext';
import { FaUser, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import Swal from 'sweetalert2';

const Header = () => {
  const { logout, user } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isMobile } = useDevice();

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

  return (
    <header className={`bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 ${
      isMobile ? 'py-2.5 px-3.5' : 'py-3 px-7'
    }`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-1' : 'justify-between items-center'}`}>
        {/* Seção de boas-vindas */}
        <div className={`flex items-center ${isMobile ? 'justify-between' : 'space-x-6'}`}>
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className={`text-blue-900 dark:text-blue-400 font-bold tracking-wide transition-colors duration-300 truncate ${
              isMobile ? 'text-sm' : 'text-base'
            }`}>
              GESTÃO INTELIGENTE DE FROTAS
            </h1>
            <div className="flex items-center space-x-1 mt-0.5">
              <FaUser className={`text-blue-600 dark:text-blue-400 transition-colors duration-300 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`} />
              <span className={`text-gray-700 dark:text-gray-300 transition-colors duration-300 truncate ${
                isMobile ? 'text-xs' : 'text-xs'
              }`}>
                Bem-vindo, <strong className="text-blue-900 dark:text-blue-400">
                  {user?.first_name || user?.last_name ? 
                    `${user.first_name} ${user.last_name}` : 
                    user?.email
                  }
                </strong>
              </span>
            </div>
            {!isMobile && (
              <span className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 ml-3 transition-colors duration-300">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>

          {/* Seção de ações - mobile na mesma linha */}
          {isMobile && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Notificações */}
              <NotificationBell />

              {/* Botão de tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              >
                {isDarkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
              </button>

              {/* Botão de logout compacto */}
              <button
                onClick={handleLogout}
                className="p-2 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
                title="Sair"
              >
                <FaSignOutAlt className="text-sm" />
              </button>
            </div>
          )}
        </div>

        {/* Seção de ações - desktop */}
        {!isMobile && (
          <div className="flex items-center space-x-3">
            {/* Notificações */}
            <NotificationBell />

            {/* Botão de tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {isDarkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>

            {/* Separador */}
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Botão de logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg text-sm hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaSignOutAlt className="text-sm" />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
