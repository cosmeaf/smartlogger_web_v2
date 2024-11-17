import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Header = () => {
  const { logout, user } = useContext(AuthContext);

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
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded p-2 text-sm"
        />
        <div className="text-gray-700 text-sm">
          <span>Bem-vindo, </span>
          <strong>
            {user?.first_name || user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : user?.email}
          </strong>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
