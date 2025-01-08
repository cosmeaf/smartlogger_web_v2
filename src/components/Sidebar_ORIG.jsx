import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaHome, FaUserFriends, FaTruckMonster, FaTractor } from 'react-icons/fa';
import packageJson from '../../package.json'; 

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const version = packageJson.version;

  const toggleSidebar = () => {
    setIsOpen(!isOpen); 
  };

  return (
    <aside className={`h-screen bg-blue-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Cabeçalho do sidebar */}
      <div className="flex items-center justify-between p-4">
        {isOpen && <span className="font-bold text-2xl">Dashboard</span>}
        <button onClick={toggleSidebar} className="focus:outline-none">
          <FaBars className="text-white h-6 w-6 cursor-pointer" />
        </button>
      </div>

      {/* Links de navegação */}
      <nav className="mt-8 space-y-4">
        <Link to="/dashboard" className="flex items-center py-2 px-4 hover:bg-blue-700 rounded-md">
          <FaHome className="h-6 w-6 text-white" />
          {isOpen && <span className="ml-4">Início</span>}
        </Link>

        <Link to="/dashboard/devices" className="flex items-center py-2 px-4 hover:bg-blue-700 rounded-md">
          <FaTruckMonster className="h-6 w-6 text-white" />
          {isOpen && <span className="ml-4">Dispositivos</span>}
        </Link>

        <Link to="/dashboard/equipments" className="flex items-center py-2 px-4 hover:bg-blue-700 rounded-md">
          <FaTractor className="h-6 w-6 text-white" />
          {isOpen && <span className="ml-4">Equipamentos</span>}
        </Link>

        <Link to="/dashboard/employees" className="flex items-center py-2 px-4 hover:bg-blue-700 rounded-md">
          <FaUserFriends className="h-6 w-6 text-white" />
          {isOpen && <span className="ml-4">Colaboradores</span>}
        </Link>
      </nav>

      {/* Versão exibida no rodapé com cor adicionada */}
      {isOpen && (
        <div className="absolute bottom-4 w-full text-center text-sm text-gray-300">
          <p className="text-yellow-400">Versão: {version}</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;