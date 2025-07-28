import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

const LogoutHandler = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleLogout = async () => {
      const result = await Swal.fire({
        title: 'Você tem certeza?',
        text: 'Deseja realmente sair?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, sair',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        logout();
        await Swal.fire('Logout realizado!', 'Você saiu da sessão com sucesso.', 'success');
        navigate('/');
      } else {
        // Se cancelou, volta para o dashboard
        navigate('/dashboard');
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return null; // Este componente não renderiza nada
};

export default LogoutHandler;
