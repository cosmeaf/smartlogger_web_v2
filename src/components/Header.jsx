import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaUser, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Header = () => {
  const { logout, user } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    Swal.fire({
      title: 'Você tem certeza?',
      text: 'Deseja realmente sair?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire('Logout realizado!', 'Você saiu da sessão com sucesso.', 'success');
      }
    });
  };

  return (
    <header className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center transition-colors duration-300">
      {/* Seção de boas-vindas */}
      <div className="flex items-center space-x-6">
        <div className="flex flex-col">
          <h1 className="text-blue-900 dark:text-blue-400 font-bold text-lg tracking-wide transition-colors duration-300">
            GESTÃO INTELIGENTE DE FROTAS
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <FaUser className="text-blue-600 dark:text-blue-400 text-sm transition-colors duration-300" />
            <span className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
              Bem-vindo, <strong className="text-blue-900 dark:text-blue-400">{user?.first_name || user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email}</strong>
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-xs mt-1 ml-5 transition-colors duration-300">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Seção de ações */}
      <div className="flex items-center space-x-3">
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
    </header>
  );
};

export default Header;
