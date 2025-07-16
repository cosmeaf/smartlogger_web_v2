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
    <header className="bg-white shadow-md p-4 flex justify-between items-center animate-slide-down">
      <div className="flex items-center space-x-6">
        <div className="flex flex-col">
          <span className="text-blue-900 font-bold text-base tracking-wide animate-glow">GESTÃO INTELIGENTE DE FROTAS</span>
          <span className="text-gray-700 text-sm mt-1">
            Bem-vindo, <strong>{user?.first_name || user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email}</strong>
          </span>
          <span className="text-gray-500 text-xs mt-1">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
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


// Animação slide-down simples
const style = document.createElement('style');
style.innerHTML = `
@keyframes slide-down { from { transform: translateY(-40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.animate-slide-down { animation: slide-down 0.7s cubic-bezier(0.4,0,0.2,1); }
.animate-glow { 
  animation: glow 10s ease-in-out infinite; 
  background: linear-gradient(45deg, #1e3a8a, #3b82f6, #1e3a8a);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
@keyframes glow {
  0%, 100% { 
    background-position: 0% 50%;
    filter: brightness(1);
  }
  50% { 
    background-position: 100% 50%;
    filter: brightness(1.2);
  }
}
`;
document.head.appendChild(style);

export default Header;
