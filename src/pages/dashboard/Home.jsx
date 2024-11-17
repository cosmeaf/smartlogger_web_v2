import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { logout } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  return (
    <div>
      <h1>Bem-vindo ao Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
