// src/components/Sidebar.js

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaHome,
  FaUserFriends,
  FaTruckMonster,
  FaTractor,
  FaTimes,
} from 'react-icons/fa';
import packageJson from '../../package.json';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const version = packageJson.version;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Links de Navegação
  const navLinks = [
    { to: '/dashboard', label: 'Início', icon: <FaHome /> },
    { to: '/dashboard/devices', label: 'Dispositivos', icon: <FaTruckMonster /> },
    { to: '/dashboard/equipments', label: 'Equipamentos', icon: <FaTractor /> },
    { to: '/dashboard/employees', label: 'Colaboradores', icon: <FaUserFriends /> },
  ];

  return (
    <div
      className={`flex flex-col bg-blue-900 text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Cabeçalho do Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-blue-800">
        {isOpen && <span className="font-bold text-xl">Dashboard</span>}
        <button
          onClick={toggleSidebar}
          className="focus:outline-none"
          aria-label={isOpen ? 'Colapsar Sidebar' : 'Expandir Sidebar'}
        >
          {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
        </button>
      </div>

      {/* Links de Navegação */}
      <nav className="flex-1 mt-4">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center py-3 px-4 hover:bg-blue-700 transition-colors duration-200 ${
                isActive ? 'bg-blue-700' : ''
              } relative group ${
                isOpen ? 'justify-start' : 'justify-center'
              }`}
              aria-label={link.label}
            >
              <div className={`text-lg ${!isOpen ? 'mx-auto' : 'ml-0'}`}>
                {link.icon}
              </div>
              {isOpen && <span className="ml-4 text-md font-medium">{link.label}</span>}
              {/* Tooltip */}
              {!isOpen && (
                <span className="absolute left-full ml-2 w-max bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé com Versão */}
      {isOpen && (
        <div className="p-4 text-center text-sm text-gray-300">
          <p className="text-yellow-400">Versão: {version}</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
